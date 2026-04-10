const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const Summary = require("../models/SummaryModel");
require("dotenv").config();

/* ── Auth middleware ── */
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* ── GET /user/history ── */
// Returns all summaries for the logged-in user, newest first.
// Explicitly selects every field so new fields (starred, tags, sentiment,
// participants, nextMeeting) are always included even if the document
// was created before those fields existed in the schema.
router.get("/history", requireAuth, async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user._id })
      .select(
        "meetingTitle summary transcript actionItems " +
        "starred tags sentiment participants nextMeeting " +
        "duration createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({ summaries });
  } catch (err) {
    console.error("❌ History fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /user/history/:id ── */
router.delete("/history/:id", requireAuth, async (req, res) => {
  try {
    const doc = await Summary.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id   // ensures users can only delete their own
    });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;