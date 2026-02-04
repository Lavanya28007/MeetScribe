const express = require("express");
const router = express.Router();
const generate = require("../gemini");
const Summary = require("../models/SummaryModel");

/* ──────────────────── Utilities ──────────────────── */

// Ensure array input
const ensureArray = (value) => (Array.isArray(value) ? value : []);

// Normalize array into markdown bullets
const normalize = (arr) =>
  arr.length ? arr.map(v => `- ${v}`).join("\n") : "- Not specified";

// AI timeout protection
const withTimeout = (promise, ms = 20000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), ms)
    )
  ]);



/* ──────────────────── /summarize ──────────────────── */

router.post("/summarize", async (req, res) => {
  try {
    console.log("📥 MeetScribe Summarize HIT");

    const { meetingTitle = "Untitled Meeting", transcript } = req.body;

    if (!transcript || transcript.trim().length < 50) {
      return res.status(400).json({
        error: "Transcript too short or missing"
      });
    }

    const prompt = `
You are an AI meeting assistant.

Rules:
- Do NOT repeat the transcript
- Merge repeated statements
- Summarize unique ideas only
- Ignore filler, greetings, or repeated phrases


Summarize the following meeting transcript into:

## Summary
- Key discussion points

## Decisions
- Clear decisions made (if any)

## Action Items
- Bullet list of tasks with responsible parties if mentioned

Transcript:
"""
${transcript}
"""
`;

    const summaryOutput = await withTimeout(generate(prompt));

    // 🔹 Save to DB
    const savedSummary = await Summary.create({
      meetingTitle,
      transcript,
      summary: summaryOutput.trim(),
      actionItems: [] // will be updated later
    });

    res.status(200).json({
      type: "summary",
      summaryId: savedSummary._id, // IMPORTANT
      output: savedSummary.summary
    });

  } catch (error) {
    console.error("❌ Summarize Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.get("/summaries", async (req, res) => {
  const summaries = await Summary.find().sort({ createdAt: -1 });
  res.json(summaries);
});


/* ──────────────────── /action-items ──────────────────── */

router.post("/action-items", async (req, res) => {
  try {
    console.log("📥 MeetScribe Action Items HIT");

    const { transcript, summaryId } = req.body;

    if (!summaryId) {
      return res.status(400).json({
        error: "summaryId is required to attach action items"
      });
    }

    if (!transcript || transcript.trim().length < 50) {
      return res.status(400).json({
        error: "Transcript too short or missing"
      });
    }

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
${transcript}
"""
`;

    const actionsOutput = await withTimeout(generate(prompt));

    // Simple parsing: split markdown bullets
    const actionItems = actionsOutput
      .split("\n")
      .filter(line => line.trim().startsWith("-"))
      .map(line => line.replace(/^-\s*/, ""));

    // 🔹 Update DB
    const updatedSummary = await Summary.findByIdAndUpdate(
      summaryId,
      { actionItems },
      { new: true }
    );

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


module.exports = router;
