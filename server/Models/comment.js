import mongoose from "mongoose";

const commentschema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    commentbody: {
      type: String,
      required: true,
      trim: true,
    },

    usercommented: {
      type: String,
      required: true,
    },

    commentedon: {
      type: Date,
      default: Date.now,
    },

    // ===== New Fields =====

    language: {
      type: String,
      default: "en",
    },

    translatedText: {
      type: String,
      default: "",
    },

    translatedLanguage: {
  type: String,
  default: "",
},

    locationVisible: {
      type: Boolean,
      default: false,
    },

 

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    reports: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        reason: {
          type: String,
          default: "Inappropriate",
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isReported: {
      type: Boolean,
      default: false,
    },

    moderationStatus: {
      type: String,
      enum: ["approved", "flagged", "removed"],
      default: "approved",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentschema);