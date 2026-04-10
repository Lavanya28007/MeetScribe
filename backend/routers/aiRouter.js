const express   = require("express");
const router    = express.Router();
const generate  = require("../gemini");
const Summary   = require("../models/SummaryModel");
const jwt       = require("jsonwebtoken");
require("dotenv").config();

/* ──────────────────── Optional Auth ──────────────────── */
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try { req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET); }
    catch { /* invalid token — proceed without user */ }
  }
  next();
};

/* ──────────────────── Utilities ──────────────────── */
const withTimeout = (promise, ms = 25000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), ms)
    )
  ]);

// Extract a simple JSON block the AI might embed in its response
function tryParseJSON(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/) || text.match(/({[\s\S]*})/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

/* ──────────────────── POST /summarize ──────────────────── */
router.post("/summarize", optionalAuth, async (req, res) => {
  try {
    const { meetingTitle = "Untitled Meeting", transcript, duration = null } = req.body;
    if (!transcript || transcript.trim().length < 50)
      return res.status(400).json({ error: "Transcript too short or missing" });

    const clean = transcript.slice(0, 12000);

    const prompt = `
You are an AI meeting assistant.

Your job:
1. Remove repeated phrases caused by speech recognition.
2. Merge similar sentences into one idea.
3. Ignore filler words.
4. Extract only meaningful discussion.
5. Extract a list of participant names (first names only) mentioned in the transcript.
6. If a next-meeting date or time is mentioned, extract it.

Provide output in exactly this format:

## Summary
- Key discussion points

## Decisions
- Decisions made (if any)

## Action Items
- Tasks with owners if mentioned

## Meta
PARTICIPANTS: comma-separated first names, e.g. Rahul, Ananya
NEXT_MEETING: date/time string or NONE

Transcript:
"""
${clean}
"""
`;

    const raw = await withTimeout(generate(prompt));
    if (!raw) throw new Error("AI returned empty response");

    // Parse meta lines out of the output
    const participantMatch = raw.match(/PARTICIPANTS:\s*(.+)/i);
    const nextMeetMatch    = raw.match(/NEXT_MEETING:\s*(.+)/i);

    const participants = participantMatch
      ? participantMatch[1].split(",").map(s => s.trim()).filter(Boolean)
      : [];
    const nextMeeting = nextMeetMatch && !/none/i.test(nextMeetMatch[1])
      ? nextMeetMatch[1].trim()
      : null;

    // Strip the Meta block from the displayed summary
    const summaryOutput = raw.replace(/## Meta[\s\S]*$/, "").trim();

    const saved = await Summary.create({
      meetingTitle,
      transcript,
      summary:      summaryOutput,
      userId:       req.user?._id || null,
      actionItems:  [],
      participants,
      nextMeeting,
      duration
    });

    res.status(200).json({
      type:        "summary",
      summaryId:   saved._id,
      output:      saved.summary,
      participants: saved.participants,
      nextMeeting:  saved.nextMeeting
    });
  } catch (err) {
    console.error("❌ Summarize:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────── POST /action-items ──────────────────── */
router.post("/action-items", optionalAuth, async (req, res) => {
  try {
    const { transcript, summaryId } = req.body;
    if (!summaryId)
      return res.status(400).json({ error: "summaryId is required" });
    if (!transcript || transcript.trim().length < 50)
      return res.status(400).json({ error: "Transcript too short or missing" });

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
${transcript.slice(0, 12000)}
"""
`;

    const output = await withTimeout(generate(prompt));

    const actionItems = output
      .split("\n")
      .filter(l => l.trim().startsWith("-"))
      .map(l => l.replace(/^-\s*/, ""));

    await Summary.findByIdAndUpdate(summaryId, { actionItems }, { new: true });

    res.status(200).json({ type: "action-items", summaryId, output: output.trim() });
  } catch (err) {
    console.error("❌ Action Items:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────── POST /ask  (NEW) ──────────────────── */
// AI Q&A: ask any question about a saved meeting's transcript
router.post("/ask", optionalAuth, async (req, res) => {
  try {
    const { summaryId, question } = req.body;
    if (!summaryId || !question)
      return res.status(400).json({ error: "summaryId and question are required" });

    const meeting = await Summary.findById(summaryId).lean();
    if (!meeting)
      return res.status(404).json({ error: "Meeting not found" });

    const prompt = `
You are an AI assistant that has access to the following meeting transcript.
Answer the user's question concisely and accurately based ONLY on the transcript.
If the answer is not in the transcript, say "I couldn't find that in the transcript."

Meeting: "${meeting.meetingTitle}"

Transcript:
"""
${meeting.transcript.slice(0, 12000)}
"""

Question: ${question}
`;

    const answer = await withTimeout(generate(prompt));
    res.status(200).json({ type: "ask", question, answer: answer.trim() });
  } catch (err) {
    console.error("❌ Ask:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────── POST /sentiment  (NEW) ──────────────────── */
// Analyse meeting tone and mood
router.post("/sentiment", optionalAuth, async (req, res) => {
  try {
    const { summaryId } = req.body;
    if (!summaryId)
      return res.status(400).json({ error: "summaryId is required" });

    const meeting = await Summary.findById(summaryId).lean();
    if (!meeting)
      return res.status(404).json({ error: "Meeting not found" });

    const prompt = `
You are a meeting analyst. Analyse the overall tone and sentiment of this meeting transcript.

Return your analysis as JSON inside a \`\`\`json block with this exact shape:
{
  "label": "positive" | "neutral" | "negative",
  "score": <number between -1.0 and 1.0>,
  "insight": "<one sentence describing the meeting's emotional tone>",
  "breakdown": [
    { "section": "<topic or phase name>", "tone": "positive|neutral|negative" }
  ]
}

Only return the JSON block, nothing else.

Transcript:
"""
${meeting.transcript.slice(0, 12000)}
"""
`;

    const raw  = await withTimeout(generate(prompt));
    const data = tryParseJSON(raw);

    if (!data)
      return res.status(500).json({ error: "AI returned unparseable sentiment data" });

    const sentiment = {
      label:     data.label     || "neutral",
      score:     data.score     ?? 0,
      insight:   data.insight   || "",
      breakdown: data.breakdown || []
    };

    await Summary.findByIdAndUpdate(summaryId, { sentiment });

    res.status(200).json({ type: "sentiment", summaryId, sentiment });
  } catch (err) {
    console.error("❌ Sentiment:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────── POST /auto-tag  (NEW) ──────────────────── */
// Auto-generate smart tags from the summary
router.post("/auto-tag", optionalAuth, async (req, res) => {
  try {
    const { summaryId } = req.body;
    if (!summaryId)
      return res.status(400).json({ error: "summaryId is required" });

    const meeting = await Summary.findById(summaryId).lean();
    if (!meeting)
      return res.status(404).json({ error: "Meeting not found" });

    const prompt = `
Given this meeting summary, generate 3–6 short lowercase tags that categorise the meeting.
Tags should reflect topics, project areas, or outcomes (e.g. "design", "blocked", "sprint-planning", "backend", "urgent").

Return ONLY a JSON array of strings inside a \`\`\`json block, e.g.:
\`\`\`json
["design", "frontend", "sprint-planning"]
\`\`\`

Summary:
"""
${meeting.summary.slice(0, 3000)}
"""
`;

    const raw  = await withTimeout(generate(prompt));
    const data = tryParseJSON(raw);
    const tags = Array.isArray(data) ? data.map(t => String(t).toLowerCase().trim()) : [];

    await Summary.findByIdAndUpdate(summaryId, { tags });

    res.status(200).json({ type: "auto-tag", summaryId, tags });
  } catch (err) {
    console.error("❌ Auto-tag:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────── PATCH /tag  (NEW) ──────────────────── */
// Manually add/remove a tag, or toggle starred/archived
router.patch("/tag/:summaryId", optionalAuth, async (req, res) => {
  try {
    const { summaryId } = req.params;
    const { addTag, removeTag, starred, archived } = req.body;

    const update = {};
    if (addTag)    update.$addToSet = { tags: addTag.toLowerCase().trim() };
    if (removeTag) update.$pull     = { tags: removeTag.toLowerCase().trim() };
    if (starred  !== undefined) update.$set = { ...update.$set, starred };
    if (archived !== undefined) update.$set = { ...update.$set, archived };

    const updated = await Summary.findByIdAndUpdate(summaryId, update, { new: true });
    if (!updated) return res.status(404).json({ error: "Meeting not found" });

    res.status(200).json({ type: "tag", summaryId, tags: updated.tags, starred: updated.starred, archived: updated.archived });
  } catch (err) {
    console.error("❌ Tag:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────── GET /export/:summaryId  (NEW) ──────────────────── */
// Export a meeting as a Markdown document
router.get("/export/:summaryId", optionalAuth, async (req, res) => {
  try {
    const meeting = await Summary.findById(req.params.summaryId).lean();
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    const date = new Date(meeting.createdAt).toDateString();
    const participants = meeting.participants?.length
      ? meeting.participants.join(", ")
      : "Unknown";

    const actionMd = meeting.actionItems?.length
      ? meeting.actionItems.map(a => `- [ ] ${a}`).join("\n")
      : "_No action items recorded._";

    const tagsMd = meeting.tags?.length
      ? meeting.tags.map(t => `\`${t}\``).join(" ")
      : "_none_";

    const sentimentLine = meeting.sentiment?.insight
      ? `\n> 💬 **Sentiment:** ${meeting.sentiment.label} (${meeting.sentiment.score > 0 ? "+" : ""}${meeting.sentiment.score?.toFixed(2)}) — ${meeting.sentiment.insight}\n`
      : "";

    const nextLine = meeting.nextMeeting
      ? `\n**Next meeting:** ${meeting.nextMeeting}\n`
      : "";

    const md = `# ${meeting.meetingTitle}

**Date:** ${date}  
**Participants:** ${participants}  
**Tags:** ${tagsMd}
${sentimentLine}
---

${meeting.summary}

## ✅ Action Items

${actionMd}
${nextLine}
---
*Exported by MeetScribe*
`;

    // Update exportedAt timestamp
    await Summary.findByIdAndUpdate(meeting._id, { exportedAt: new Date() });

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${meeting.meetingTitle.replace(/\s+/g, "_")}.md"`);
    res.send(md);
  } catch (err) {
    console.error("❌ Export:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────── GET /summaries ──────────────────── */
router.get("/summaries", async (req, res) => {
  const { tag, starred } = req.query;
  const filter = {};
  if (tag)     filter.tags    = tag;
  if (starred) filter.starred = starred === "true";
  const summaries = await Summary.find(filter).sort({ createdAt: -1 });
  res.json(summaries);
});

/* ──────────────────── GET /summaries/:id ──────────────────── */
router.get("/summaries/:id", async (req, res) => {
  const meeting = await Summary.findById(req.params.id).lean();
  if (!meeting) return res.status(404).json({ error: "Not found" });
  res.json(meeting);
});

module.exports = router;