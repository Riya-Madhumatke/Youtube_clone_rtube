import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import paymentroutes from "./routes/payment.js";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js";
import authRoutes from "./routes/auth.js";
import watchPartyRoutes from "./routes/watchParty.js";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket/socket.js";

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
app.use("/download", downloadroutes);
app.use("/payment", paymentroutes);
app.use("/auth", authRoutes);
app.use("/watch-party", watchPartyRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
initializeSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
       console.log("Database:", mongoose.connection.name);
  })
  .catch((error) => {
    console.log(error);
  });