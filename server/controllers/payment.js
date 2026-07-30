import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import users from "../Models/Auth.js";
import { sendSubscriptionEmail } from "../services/emailService.js";

export const createOrder = async (req, res) => {
  try {
    const { amount, plan } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json(order);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

  const updatedUser = await users.findByIdAndUpdate(
  userId,
  {
    plan,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    subscriptionDate: new Date(),
  },
  { new: true }
);

await sendSubscriptionEmail({
  email: updatedUser.email,
  name: updatedUser.name,
  plan: plan.charAt(0).toUpperCase() + plan.slice(1),
  amount:
    plan === "bronze"
      ? 199
      : plan === "silver"
      ? 349
      : 999,
  paymentId: razorpay_payment_id,
  orderId: razorpay_order_id,
});

return res.status(200).json({
  success: true,
  message: "Payment verified successfully",
});
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};