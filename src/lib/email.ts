import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (options: EmailOptions) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};
