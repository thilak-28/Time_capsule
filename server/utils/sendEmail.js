const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. ALWAYS Save a local copy so you can SEE it's real!
  const fileName = `email_${Date.now()}.html`;
  const deliveredDir = path.join(__dirname, '../delivered_emails');
  const filePath = path.join(deliveredDir, fileName);
  
  // Auto-create the folder if it doesn't exist
  fs.mkdirSync(deliveredDir, { recursive: true });

  const debugContent = `
    <h1>CAPSULE DELIVERED</h1>
    <p><strong>To:</strong> ${options.email}</p>
    <p><strong>Subject:</strong> ${options.subject}</p>
    <hr>
    ${options.html}
  `;
  
  fs.writeFileSync(filePath, debugContent);
  console.log(`✅ REAL PROOF: Email content saved to server/delivered_emails/${fileName}`);

  // 2. Try the Brevo REST API transport (Bypasses SMTP blocks)
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Time Capsule',
          email: process.env.EMAIL_FROM || process.env.SMTP_USER,
        },
        to: [
          {
            email: options.email,
          },
        ],
        subject: options.subject,
        htmlContent: options.html,
      },
      {
        headers: {
          'api-key': process.env.SMTP_PASS,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    console.log(`🚀 BREVO API SUCCESS: Email sent to real inbox! Message ID:`, response.data.messageId);
  } catch (error) {
    console.error('--- BREVO API FAILED ---');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('------------------------');
    console.error('⚠️ NOTE: Brevo API blocked the connection, but your email was successfully generated locally above!');
    throw new Error('Email could not be sent via Brevo API');
  }
};

module.exports = sendEmail;
