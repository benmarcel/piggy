import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendActivationEmail = async (to: string, token: string) => {
  const activationUrl = `${process.env.Activation_URL}?token=${token}`;

  await transporter.sendMail({
    from: '"Piggy App" <noreply@piggy.com>',
    to,
    subject: "Activate your Piggy Account",
    html: `
      <h1>Welcome to Piggy!</h1>
      <p>Click the link below to activate your account and start managing your farm:</p>
      <a href="${activationUrl}">Activate Account</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};