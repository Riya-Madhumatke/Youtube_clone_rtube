import comment from "../Models/comment.js";
import mongoose from "mongoose";
import { validateComment } from "../middleware/commentFilter.js";
import translate from "translate-google-api";

export const postcomment = async (req, res) => {
  const commentdata = req.body;
  const validation = validateComment(commentdata.commentbody);

if (!validation.valid) {
  return res.status(400).json({
    success: false,
    message: validation.message,
  });
}
  if (!commentdata.commentbody?.trim()) {
  return res.status(400).json({
    message: "Comment cannot be empty",
  });
}
  const postcomment = new comment(commentdata);
  try {
    await postcomment.save();
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
const commentvideo = await comment
  .find({
    videoid,
    moderationStatus: "approved",
  })
  .populate("userid", "name image")
  .sort({ createdAt: -1 });

const validComments = commentvideo.filter(c => c.userid);

return res.status(200).json(validComments);
      return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const commentData = await comment.findById(commentId);

    if (!commentData) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const alreadyLiked = commentData.likes.includes(userId);

    if (alreadyLiked) {
      commentData.likes.pull(userId);
    } else {
      commentData.likes.addToSet(userId);
      commentData.dislikes.pull(userId);
    }

    await commentData.save();

    return res.status(200).json({
      success: true,
      likes: commentData.likes.length,
      dislikes: commentData.dislikes.length,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const dislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    const commentData = await comment.findById(commentId);

    if (!commentData) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const alreadyDisliked = commentData.dislikes.includes(userId);

    if (alreadyDisliked) {
      commentData.dislikes.pull(userId);
    } else {
      commentData.dislikes.addToSet(userId);
      commentData.likes.pull(userId);
    }

    await commentData.save();

    return res.status(200).json({
      success: true,
      likes: commentData.likes.length,
      dislikes: commentData.dislikes.length,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, reason } = req.body;

    const commentData = await comment.findById(commentId);

    if (!commentData) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Prevent duplicate reports from the same user
    const alreadyReported = commentData.reports.some(
      (report) => report.userId.toString() === userId
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this comment.",
      });
    }

    commentData.reports.push({
      userId,
      reason,
    });

    commentData.isReported = true;

    await commentData.save();

    return res.status(200).json({
      success: true,
      message: "Comment reported successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const translateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { targetLanguage } = req.body;

    const commentData = await comment.findById(commentId);

    if (!commentData) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Return cached translation if it already exists
    if (
      commentData.translatedText &&
      commentData.translatedLanguage === targetLanguage
    ) {
      return res.status(200).json({
        success: true,
        translatedText: commentData.translatedText,
        cached: true,
      });
    }

    const result = await translate(commentData.commentbody, {
  to: targetLanguage,
});

const translated = Array.isArray(result) ? result.join(" ") : result;

    commentData.translatedText = translated;
    commentData.translatedLanguage = targetLanguage;

    await commentData.save();

    return res.status(200).json({
      success: true,
      translatedText: translated,
      cached: false,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Translation failed",
    });
  }
};