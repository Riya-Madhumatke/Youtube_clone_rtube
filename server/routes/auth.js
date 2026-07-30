import express from "express";
import {
  login,
  updateprofile,
  getUserById,
  updateTheme,
  verifyOTP,
  resendOTP,
  updatePreferredLanguage,
} from "../controllers/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateprofile);
routes.patch("/theme/:id", updateTheme);
routes.get("/:id", getUserById);
routes.post("/verify-otp", verifyOTP);
routes.post("/resend-otp", resendOTP);
routes.patch("/language/:id", updatePreferredLanguage);

export default routes;