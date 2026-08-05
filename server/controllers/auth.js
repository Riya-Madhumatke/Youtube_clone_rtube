import mongoose from "mongoose";
import users from "../Models/Auth.js";
import { sendSubscriptionEmail, sendOTPEmail } from "../services/emailService.js";

const getDefaultTheme = () => {
  const now = new Date();

  const indiaHour = Number(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    })
  );

  return indiaHour >= 10 && indiaHour < 12 ? "light" : "dark";
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const login = async (req, res) => {
  const { email, name, image, deviceId } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    let existingUser = await users.findOne({ email });

    // NEW USER
    if (!existingUser) {
      const otp = generateOTP();

      existingUser = await users.create({
        email,
        name,
        image,
        theme: getDefaultTheme(),
        otp,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        trustedDevices: [],
      });

try {
  await sendOTPEmail(existingUser.email, otp);
} catch (error) {
  console.error("OTP Email Error:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to send OTP email. Please try again later.",
  });
}
      return res.status(200).json({
        success: true,
        otpRequired: true,
        userId: existingUser._id,
        message: "OTP sent",
      });
    }

    // CHECK TRUSTED DEVICE
    const isTrustedDevice =
      deviceId &&
      existingUser.trustedDevices.some(
        (device) => device.deviceId === deviceId
      );

    // NEW DEVICE → SEND OTP
    if (!isTrustedDevice) {
      const otp = generateOTP();

      existingUser.otp = otp;
      existingUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      await existingUser.save();

      await sendOTPEmail(existingUser.email, otp);

      return res.status(200).json({
        success: true,
        otpRequired: true,
        userId: existingUser._id,
        message: "OTP sent",
      });
    }

    // TRUSTED DEVICE
    return res.status(200).json({
      success: true,
      otpRequired: false,
      result: existingUser,
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp, deviceId } = req.body;

    if (!userId || !otp || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const alreadyExists = user.trustedDevices.some(
  (device) => device.deviceId === deviceId
);

if (!alreadyExists) {
  user.trustedDevices.push({
    deviceId,
    lastLogin: new Date(),
  });
}

    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      result: user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendOTPEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP Error:",error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }

  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true }
    );

    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { theme } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const updatedUser = await users.findByIdAndUpdate(
      id,
      {
        theme,
      },
      {
        new: true,
      }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await users.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const updatePreferredLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredLanguage } = req.body;

    const validLanguages = [
      "en",
      "hi",
      "mr",
      "ta",
      "te",
      "ml",
      "kn",
      "gu",
      "bn",
      "pa",
      "ur",
      "es",
      "fr",
      "de",
      "ja",
      "ko",
      "zh",
    ];

    if (!validLanguages.includes(preferredLanguage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language selected.",
      });
    }

    const updatedUser = await users.findByIdAndUpdate(
      id,
      { preferredLanguage },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preferred language updated successfully.",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};