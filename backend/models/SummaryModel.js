const {Schema, model} = require('../connection');

const SummarySchema = new Schema(
  {
    meetingTitle: {
      type: String,
      required: true,
      trim: true
    },
    transcript: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
  //   userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User"
  //  },

    actionItems: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt automatically
  }
);

module.exports = model("Summary", SummarySchema);
