
// Load environment variables from the server's .env file.
require('dotenv').config();

const nodemailer = require('nodemailer');

// Create a connection to Gmail's SMTP server.
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,

  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// Test whether Gmail accepts the SMTP configuration.
async function testEmailConnection() {
  try {
    await transporter.verify();

    console.log('SUCCESS: Gmail SMTP connection is working.');
  } catch (error) {
    console.error('FAILED: Gmail SMTP connection could not be verified.');
    console.error('Error:', error.message);
  }
}

testEmailConnection();

