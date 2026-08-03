import express from "express";
import { downloadVideo,
  getMyDownloads, 
  removeDownload} 
  from "../controllers/download.js";

const router = express.Router();

router.post("/", downloadVideo);
router.get("/mydownloads/:userId", getMyDownloads);
router.delete("/:downloadId", removeDownload);

export default router;