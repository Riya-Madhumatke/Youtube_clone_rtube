import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    downloadedAt: {
      type: Date,
      default: Date.now,
    },

    userPlan: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      default: "free",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("downloads", downloadSchema);