import express from "express";
import { deletecomment, getallcomment, postcomment ,editcomment, likeComment,
  dislikeComment, reportComment, translateComment} from "../controllers/comment.js";

const routes = express.Router();
routes.get("/:videoid", getallcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);
routes.post("/like/:commentId", likeComment);
routes.post("/dislike/:commentId", dislikeComment);
routes.post("/report/:commentId", reportComment);
routes.post("/translate/:commentId", translateComment);

export default routes;