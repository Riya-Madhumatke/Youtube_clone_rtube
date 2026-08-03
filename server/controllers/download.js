import Download from "../Models/download.js";
import users from "../Models/Auth.js";
import video from "../Models/video.js";

export const downloadVideo = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    // Check user
    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check video
    const selectedVideo = await video.findById(videoId);

    if (!selectedVideo) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count today's downloads
   const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todaysDownloads = await Download.countDocuments({
  userId,
  downloadedAt: {
    $gte: today,
    $lt: tomorrow,
  },
});

    // Download limits
    const limits = {
      free: 1,
      bronze: 5,
      silver: 20,
      gold: Infinity,
    };

    const limit = limits[user.plan];

    if (todaysDownloads >= limit) {
      return res.status(403).json({
        message: "Daily download limit reached.",
      });
    }

    // Save download history
    const download = await Download.create({
      userId,
      videoId,
      userPlan: user.plan,
    });

    return res.status(201).json({
      success: true,
      download,
      file: selectedVideo.filepath,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getMyDownloads = async (req, res) => {
  try {
    const { userId } = req.params;

    const downloads = await Download.find({ userId })
      .populate("videoId")
      .sort({ createdAt: -1 });

    return res.status(200).json(downloads);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const removeDownload = async (req, res) => {
  try {
    const { downloadId } = req.params;

    const download = await Download.findById(downloadId);

    if (!download) {
      return res.status(404).json({
        message: "Download not found",
      });
    }

    await Download.findByIdAndDelete(downloadId);

    return res.status(200).json({
      success: true,
      message: "Download removed successfully",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};