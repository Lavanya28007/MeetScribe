const {Schema, model} = require('../connection');

const SummarySchema = new Schema(
  {
    meetingTitle: { type: String, required: true, trim: true },
    transcript: { type: String, required: true },
    summary: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: null       // optional — null for anonymous extension use
    },
    actionItems: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = model("Summary", SummarySchema);