import mongoose from "mongoose";

const watchPartySchema = new mongoose.Schema(
  {
    partyCode: {
      type: String,
      required: true,
      unique: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const WatchParty =
  mongoose.models.watchParty ||
  mongoose.model("watchParty", watchPartySchema);

export default WatchParty;