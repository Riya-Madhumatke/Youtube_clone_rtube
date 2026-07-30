import express from "express";
import { createWatchParty, joinWatchParty, getWatchParty, } from "../controllers/watchParty.js";
import { getChatHistory } from "../controllers/watchPartyMessageController.js";
import { endWatchParty } from "../controllers/watchParty.js";

const router = express.Router();

router.post("/create", createWatchParty);
router.post("/join", joinWatchParty);
router.post("/:partyCode/end", endWatchParty);
router.get("/:partyCode", getWatchParty);
router.get(
  "/:partyCode/messages",
  getChatHistory
);

export default router;