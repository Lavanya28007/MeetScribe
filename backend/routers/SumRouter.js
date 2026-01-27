const express = require("express");
const router = express.Router();
const generate = require("../gemini");

/* ───────────── Utilities ───────────── */

const ensureArray = (value) =>
  Array.isArray(value) ? value : [];

const normalize = (arr) =>
  arr.length
    ? arr.map(v => `- ${v}`).join("\n")
    : "- Not specified";

const withTimeout = (promise, ms = 20000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout")), ms)
    )
  ]);

/* ───────────── Routes ───────────── */

router.post("/generate-docs", async (req, res) => {
  try {
    console.log("📥 MeetScribe Extension Docs HIT");

    const {
      projectName = "MeetScribe",
      description = "A Chrome extension that generates AI-powered summaries from meeting transcripts.",
      features,
      techStack,
      apis
    } = req.body;

    const safeFeatures = ensureArray(features);
    const safeTechStack = ensureArray(techStack);
    const safeApis = ensureArray(apis);

    const prompt = `
You are a senior frontend and AI engineer.

Generate professional Markdown documentation for a Chrome Extension project.

## Extension Name
${projectName}

## Description
${description}

## Key Features
${normalize(safeFeatures)}

## Tech Stack
${normalize(safeTechStack)}

## APIs & AI Services
${normalize(safeApis)}

The documentation must include:

1. 📘 README Overview
   - What problem the extension solves
   - How MeetScribe works

2. 🧩 Chrome Extension Architecture
   - Manifest v3
   - Popup UI
   - Content Script
   - Background Service Worker

3. ⚙️ Installation
   - Load unpacked extension
   - Chrome Web Store (optional)

4. ▶️ How to Use
   - Join meeting
   - Enable captions
   - Generate AI summary
   - Export summary

5. 🔐 Permissions Explained
   - Why each Chrome permission is needed

6. 🔌 AI Workflow
   - Input text
   - Prompt engineering
   - Summary generation

7. 📁 Project Folder Structure

8. 🚀 Future Enhancements
   - Auto-capture captions
   - Multi-language summaries
   - Action items extraction

Keep it concise, professional, and Chrome Web Store review-safe.
`;

    const documentation = await withTimeout(generate(prompt));

    res.status(200).json({
      product: "MeetScribe Chrome Extension",
      format: "markdown",
      documentation: documentation.trim()
    });

  } catch (error) {
    console.error("❌ MeetScribe Docs Error:", error.message);

    res.status(500).json({
      error: "Failed to generate documentation",
      details: error.message
    });
  }
});

module.exports = router;
