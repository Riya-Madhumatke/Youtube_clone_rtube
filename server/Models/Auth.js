import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  preferredLanguage: {
  type: String,
  default: "en",
},

  plan: {
  type: String,
  enum: ["free", "bronze", "silver", "gold"],
  default: "free",
},

theme: {
  type: String,
  enum: ["light", "dark"],
  default: "dark",
},

 paymentId: { type: String },
  orderId: { type: String },
  subscriptionDate: { type: Date },
  trustedDevices: [
  {
    deviceId: String,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
],

otp: String,

otpExpires: Date,
  
});

export default mongoose.model("user", userschema);