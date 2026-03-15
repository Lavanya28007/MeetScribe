const express = require("express");
const router = express.Router();
const generate = require("../gemini");
const Summary = require("../models/SummaryModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ──────────────────── Optional Auth ──────────────────── */
// Attaches req.user if a valid token is present, but never blocks the request
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    } catch {
      // invalid token — just ignore, proceed without user
    }
  }
  next();
};

/* ──────────────────── Utilities ──────────────────── */

const withTimeout = (promise, ms = 20000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), ms)
    )
  ]);

/* ──────────────────── /summarize ──────────────────── */

router.post("/summarize", optionalAuth, async (req, res) => {
  try {
    console.log("📥 Summarize HIT — user:", req.user?._id || "anonymous");

    const { meetingTitle = "Untitled Meeting", transcript } = req.body;

    if (!transcript || transcript.trim().length < 50) {
      return res.status(400).json({ error: "Transcript too short or missing" });
    }

    const cleanTranscript = transcript.slice(0, 12000);

    const prompt = `
You are an AI meeting assistant.

Your job:
1. Remove repeated phrases caused by speech recognition.
2. Merge similar sentences into one idea.
3. Ignore filler words.
4. Extract only meaningful discussion.

Provide output in:

## Summary
- Key discussion points

## Decisions
- Decisions made (if any)

## Action Items
- Tasks with owners if mentioned

Transcript:
"""
${cleanTranscript}
"""
`;

    const summaryOutput = await withTimeout(generate(prompt));
    if (!summaryOutput) throw new Error("AI returned empty response");

    const savedSummary = await Summary.create({
      meetingTitle,
      transcript,
      summary: summaryOutput.trim(),
      userId: req.user?._id || null,   // save userId if logged in, null otherwise
      actionItems: []
    });

    res.status(200).json({
      type: "summary",
      summaryId: savedSummary._id,
      output: savedSummary.summary
    });

  } catch (error) {
    console.error("❌ Summarize Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ──────────────────── /action-items ──────────────────── */

router.post("/action-items", optionalAuth, async (req, res) => {
  try {
    console.log("📥 Action Items HIT — user:", req.user?._id || "anonymous");

    const { transcript, summaryId } = req.body;

    if (!summaryId) {
      return res.status(400).json({ error: "summaryId is required" });
    }
    if (!transcript || transcript.trim().length < 50) {
      return res.status(400).json({ error: "Transcript too short or missing" });
    }

    const cleanTranscript = transcript.slice(0, 12000);

    const prompt = `
You are an AI project manager.

Extract ONLY actionable tasks from the meeting transcript.

For each action item, include:
- Task
- Owner (if mentioned)
- Deadline (if mentioned)

Format as clean Markdown bullet points.

Transcript:
"""
${cleanTranscript}
"""
`;

    const actionsOutput = await withTimeout(generate(prompt));

    const actionItems = actionsOutput
      .split("\n")
      .filter(line => line.trim().startsWith("-"))
      .map(line => line.replace(/^-\s*/, ""));

    await Summary.findByIdAndUpdate(summaryId, { actionItems }, { new: true });

    res.status(200).json({
      type: "action-items",
      summaryId,
      output: actionsOutput.trim()
    });

  } catch (error) {
    console.error("❌ Action Items Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ──────────────────── /summaries (all, for admin) ──────────────────── */
router.get("/summaries", async (req, res) => {
  const summaries = await Summary.find().sort({ createdAt: -1 });
  res.json(summaries);
});

module.exports = router;