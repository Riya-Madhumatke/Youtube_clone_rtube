import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendSubscriptionEmail = async ({
  email,
  name,
  plan,
  amount,
  paymentId,
  orderId,
}) => {
  const mailOptions = {
    from: `"RTube" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 RTube Premium Subscription Activated",
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:10px; overflow:hidden;">
        <div style="background:#ff0000; color:white; padding:20px; text-align:center;">
          <h1>RTube Premium</h1>
        </div>

        <div style="padding:25px;">
          <h2>Hello ${name},</h2>

          <p>Your subscription has been activated successfully.</p>

          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px;"><strong>Plan</strong></td>
              <td>${plan}</td>
            </tr>
            <tr>
              <td style="padding:8px;"><strong>Amount Paid</strong></td>
              <td>₹${amount}</td>
            </tr>
            <tr>
              <td style="padding:8px;"><strong>Payment ID</strong></td>
              <td>${paymentId}</td>
            </tr>
            <tr>
              <td style="padding:8px;"><strong>Order ID</strong></td>
              <td>${orderId}</td>
            </tr>
            <tr>
              <td style="padding:8px;"><strong>Date</strong></td>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <br/>

          <p>Thank you for choosing <strong>RTube Premium</strong>.</p>
          <p>Enjoy your premium features!</p>
        </div>

        <div style="background:#f5f5f5; padding:15px; text-align:center; color:#777;">
          © ${new Date().getFullYear()} RTube
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"RTube" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "RTube Login Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h2>Login Verification</h2>

        <p>We detected a login from a new device.</p>

        <p>Your One-Time Password (OTP) is:</p>

        <h1 style="letter-spacing:6px; color:#2563eb;">${otp}</h1>

        <p>This OTP is valid for <strong>5 minutes</strong>.</p>

        <p>If you did not attempt this login, you can safely ignore this email.</p>

        <hr />

        <small>© RTube</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};