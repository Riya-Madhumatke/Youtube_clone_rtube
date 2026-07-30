import mongoose from "mongoose";

const watchPartyMessageSchema = new mongoose.Schema(
  {
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchParty",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["chat", "join", "leave"],
      default: "chat",
    },
  },
  {
    timestamps: true,
  }
);

const WatchPartyMessage =
  mongoose.models.WatchPartyMessage ||
  mongoose.model("WatchPartyMessage", watchPartyMessageSchema);

export default WatchPartyMessage;