import { orderPlacedAdmin, orderPlacedUser } from "@/templates/Email";
import nodemailer from "nodemailer";

// Validate email configuration at startup
if (!process.env.ADMIN_EMAIL || !process.env.GOOGLE_APP_PASSWORD) {
  console.warn(
    "⚠️  WARNING: Email credentials not configured!\n" +
      "   ADMIN_EMAIL: " +
      (process.env.ADMIN_EMAIL ? "✓ Set" : "✗ Missing") +
      "\n" +
      "   GOOGLE_APP_PASSWORD: " +
      (process.env.GOOGLE_APP_PASSWORD ? "✓ Set" : "✗ Missing") +
      "\n" +
      "   See GMAIL_SETUP_GUIDE.md for setup instructions."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export const sendMail = async (
  to: string,
  emailContent: { subject: string; text: string; html: string }
) => {
  try {
    // Check if credentials are configured
    if (!process.env.ADMIN_EMAIL || !process.env.GOOGLE_APP_PASSWORD) {
      const errorMsg =
        "Email credentials not configured. Please set ADMIN_EMAIL and GOOGLE_APP_PASSWORD in .env file. " +
        "See GMAIL_SETUP_GUIDE.md for instructions.";
      console.error("❌ " + errorMsg);
      throw new Error(errorMsg);
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId, "to", to);
    return result;
  } catch (error: any) {
    // Provide helpful error messages based on error type
    if (error.code === "EAUTH") {
      console.error(
        "\n❌ Gmail Authentication Failed!\n" +
          "   This usually means:\n" +
          "   1. GOOGLE_APP_PASSWORD is incorrect or missing\n" +
          "   2. You haven't created a Gmail App Password yet\n" +
          "   3. You're using your regular password (won't work)\n" +
          "\n📖 Solution: See GMAIL_SETUP_GUIDE.md for step-by-step instructions\n" +
          "   Quick link: https://myaccount.google.com/apppasswords\n"
      );
    } else if (error.code === "ECONNECTION") {
      console.error("❌ Cannot connect to Gmail. Check your internet connection.");
    } else {
      console.error("❌ Error sending email:", error.message);
    }

    throw error;
  }
};

// Helper function to send order confirmation to user
export const sendOrderConfirmationToUser = async (
  orderDetails: Parameters<typeof orderPlacedUser>[0]
) => {
  const emailContent = orderPlacedUser(orderDetails);
  return await sendMail(orderDetails.customerEmail, emailContent);
};

// Helper function to send order notification to admin
export const sendOrderNotificationToAdmin = async (
  adminEmail: string,
  orderDetails: Parameters<typeof orderPlacedAdmin>[0]
) => {
  const emailContent = orderPlacedAdmin(orderDetails);
  return await sendMail(adminEmail, emailContent);
};
