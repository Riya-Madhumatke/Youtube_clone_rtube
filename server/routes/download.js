import express from "express";
import { downloadVideo,
  getMyDownloads, } from "../controllers/download.js";

const router = express.Router();

router.post("/", downloadVideo);
router.get("/mydownloads/:userId", getMyDownloads);

export default router;