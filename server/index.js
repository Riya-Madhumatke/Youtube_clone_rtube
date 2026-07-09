import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
const app = express();
import path from "path";
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("You tube backend is working");
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
const PORT = process.env.PORT || 5000;

const DBURL = process.env.DB_URL?.trim();

if (!DBURL) {
  console.error('Missing DB_URL in environment. Set DB_URL in .env');
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(DBURL);
    console.log('Mongodb connected');
    console.log('Database:', mongoose.connection.name);
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:');
    console.error(error);
    console.error('Check DB_URL, network/DNS (SRV), firewall, or try a non-SRV connection string.');
    process.exit(1);
  }
}

start();

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});