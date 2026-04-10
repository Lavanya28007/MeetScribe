const { Schema, model } = require('../connection');

const SummarySchema = new Schema(
  {
    meetingTitle: { type: String, required: true, trim: true },
    transcript:   { type: String, required: true },
    summary:      { type: String, required: true },

    userId: {
      type:    Schema.Types.ObjectId,
      ref:     "users",
      default: null
    },

    actionItems: { type: [String], default: [] },

    // ── NEW FIELDS ──────────────────────────────────────────────
    participants: {
      // Auto-extracted names from transcript, e.g. ["Rahul", "Ananya"]
      type:    [String],
      default: []
    },

    sentiment: {
      // Overall mood label: "positive" | "neutral" | "negative"
      label:        { type: String, default: "neutral" },
      // Score -1.0 → 1.0
      score:        { type: Number, default: 0 },
      // Short one-sentence insight from the AI
      insight:      { type: String, default: "" },
      // Per-section tone breakdown (optional, set by /sentiment route)
      breakdown:    { type: [{ section: String, tone: String }], default: [] }
    },

    tags: {
      // Smart tags auto-generated + user-added, e.g. ["engineering", "blocked"]
      type:    [String],
      default: []
    },

    starred:  { type: Boolean, default: false },
    archived: { type: Boolean, default: false },

    duration: {
      // Approximate meeting duration in minutes (set by client if known)
      type:    Number,
      default: null
    },

    nextMeeting: {
      // Free-text or ISO date string extracted from transcript
      type:    String,
      default: null
    },

    exportedAt: {
      // Timestamp of last Markdown/PDF export
      type:    Date,
      default: null
    }
    // ── END NEW FIELDS ──────────────────────────────────────────
  },
  { timestamps: true }
);

// Handy index for fast user-history queries
SummarySchema.index({ userId: 1, createdAt: -1 });
SummarySchema.index({ tags: 1 });

module.exports = model("Summary", SummarySchema);