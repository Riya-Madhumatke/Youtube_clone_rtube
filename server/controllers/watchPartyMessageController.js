import WatchParty from "../Models/watchParty.js";
import WatchPartyMessage from "../Models/WatchPartyMessage.js";

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