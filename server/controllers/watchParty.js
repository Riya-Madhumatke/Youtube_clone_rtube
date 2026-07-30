import WatchParty from "../Models/watchParty.js";

const generatePartyCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

export const createWatchParty = async (req, res) => {
  try {
    const { hostId, videoId } = req.body;

    if (!hostId || !videoId) {
      return res.status(400).json({
        success: false,
        message: "Host ID and Video ID are required",
      });
    }
    const existingParty = await WatchParty.findOne({
  host: hostId,
  video: videoId,
  isActive: true,
});

if (existingParty) {
  return res.status(200).json({
    success: true,
    message: "Active watch party already exists",
    party: existingParty,
  });
}

    let partyCode = generatePartyCode();

    while (await WatchParty.findOne({ partyCode })) {
      partyCode = generatePartyCode();
    }

    const party = await WatchParty.create({
      partyCode,
      host: hostId,
      video: videoId,
      participants: [hostId],
    });

    res.status(201).json({
      success: true,
      message: "Watch party created successfully",
      party,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const joinWatchParty = async (req, res) => {
  try {
    const { partyCode, userId } = req.body;

    if (!partyCode || !userId) {
      return res.status(400).json({
        success: false,
        message: "Party code and User ID are required",
      });
    }

    const party = await WatchParty.findOne({
      partyCode,
      isActive: true,
    })
      .populate("host", "name image")
      .populate("video")
      .populate("participants", "name image");

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Watch party not found",
      });
    }

    const alreadyJoined = party.participants.some(
      (participant) => participant._id.toString() === userId
    );

    if (!alreadyJoined) {
      party.participants.push(userId);
      await party.save();

      await party.populate("participants", "name image");
    }

    res.status(200).json({
      success: true,
      message: "Joined watch party successfully",
      party,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getWatchParty = async (req, res) => {
  try {
    const { partyCode } = req.params;

    const party = await WatchParty.findOne({ partyCode })
      .populate("host")
      .populate("video")
      .populate("participants");
      if (!party.isActive) {
  return res.status(410).json({
    success: false,
    message: "This watch party has ended.",
  });
}

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Watch party not found",
      });
    }

    res.status(200).json({
      success: true,
      party,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { partyCode } = req.params;

    const party = await WatchParty.findOne({ partyCode });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Watch party not found",
      });
    }

    const messages = await WatchPartyMessage.find({
      party: party._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to load chat history",
    });
  }
};

export const endWatchParty = async (req, res) => {
  try {
    const { partyCode } = req.params;
    const { hostId } = req.body;

    const party = await WatchParty.findOne({ partyCode });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Watch party not found",
      });
    }

    if (String(party.host) !== String(hostId)) {
      return res.status(403).json({
        success: false,
        message: "Only the host can end the watch party",
      });
    }

    party.isActive = false;
    await party.save();

    res.status(200).json({
      success: true,
      message: "Watch party ended successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to end watch party",
    });
  }
};