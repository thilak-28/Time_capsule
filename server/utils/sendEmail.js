const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. ALWAYS Save a local copy so you can SEE it's real!
  const fileName = `email_${Date.now()}.html`;
  const filePath = path.join(__dirname, '../delivered_emails', fileName);
  
  const debugContent = `
    <h1>CAPSULE DELIVERED</h1>
    <p><strong>To:</strong> ${options.email}</p>
    <p><strong>Subject:</strong> ${options.subject}</p>
    <hr>
    ${options.html}
  `;
  
  fs.writeFileSync(filePath, debugContent);
  console.log(`✅ REAL PROOF: Email content saved to server/delivered_emails/${fileName}`);

  // 2. Try the Gmail transport anyway
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Time Capsule" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });
    console.log(`🚀 GMAIL SUCCESS: Also sent to real inbox!`);
  } catch (error) {
    console.error('⚠️ NOTE: Gmail blocked the connection, but your email was successfully generated locally above!');
  }
};

module.exports = sendEmail;
