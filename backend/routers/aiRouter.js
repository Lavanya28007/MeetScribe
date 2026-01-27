const express = require("express");
const router = express.Router();
const generate = require("../gemini");

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

/* ──────────────────── /generate-docs ──────────────────── */

router.post("/generate-docs", async (req, res) => {
  try {
    console.log("📥 MeetScribe Docs HIT");

    const {
      projectName = "MeetScribe",
      description = "A Chrome extension that generates AI-powered summaries from meeting transcripts.",
      features,
      techStack,
      apis
    } = req.body;

    const prompt = `
You are a senior frontend and AI engineer.

Generate professional Markdown documentation for a Chrome Extension.

## Extension Name
${projectName}

## Description
${description}

## Key Features
${normalize(ensureArray(features))}

## Tech Stack
${normalize(ensureArray(techStack))}

## APIs & AI Services
${normalize(ensureArray(apis))}

Include:
1. README Overview
2. Chrome Extension Architecture
3. Installation
4. How to Use
5. Permissions Explained
6. AI Workflow
7. Folder Structure
8. Future Enhancements

Keep it concise, professional, and Chrome Web Store review-safe.
`;

    const documentation = await withTimeout(generate(prompt));

    res.status(200).json({
      type: "documentation",
      format: "markdown",
      output: documentation.trim()
    });

  } catch (error) {
    console.error("❌ Docs Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ──────────────────── /summarize ──────────────────── */

router.post("/summarize", async (req, res) => {
  try {
    console.log("📥 MeetScribe Summarize HIT");

    const { transcript } = req.body;

    if (!transcript || transcript.trim().length < 50) {
      return res.status(400).json({
        error: "Transcript too short or missing"
      });
    }

    const prompt = `
You are an AI meeting assistant.

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

    const summary = await withTimeout(generate(prompt));

    res.status(200).json({
      type: "summary",
      output: summary.trim()
    });

  } catch (error) {
    console.error("❌ Summarize Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ──────────────────── /action-items ──────────────────── */

router.post("/action-items", async (req, res) => {
  try {
    console.log("📥 MeetScribe Action Items HIT");

    const { transcript } = req.body;

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
 // Call Gemini with timeout protection
    const actions = await withTimeout(generate(prompt));

    res.status(200).json({
      type: "action-items",
      format: "markdown",
      output: actions.trim()
    });

  } catch (error) {
    console.error("❌ Action Items Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
