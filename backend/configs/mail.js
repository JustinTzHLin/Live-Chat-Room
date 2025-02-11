import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import nodemailer from "nodemailer";

const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

export default transporter;
