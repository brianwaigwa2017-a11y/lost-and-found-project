
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function sendVerificationEmail(email, name, verificationUrl) {
  if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
    throw new Error('Email configuration is missing. Check your server .env file.');
  }

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || 'School Lost and Found'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
    to: email,
    subject: 'Verify Your School Lost and Found Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>School Lost and Found</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with our School Lost and Found Management System.</p>
        <p>Please use the verification link provided to verify your email address.</p>
        <p><a href="${verificationUrl}">Verify My Email</a></p>
      </div>
    `,
  });
}

async function sendClaimConfirmationEmail(email, name, itemTitle) {
  if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
    throw new Error('Email configuration is missing. Check your server .env file.');
  }

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || 'School Lost and Found'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
    to: email,
    subject: 'Your Lost and Found Claim Has Been Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1f2937;">
        <h2 style="color: #0f766e;">School Lost and Found</h2>

        <p>Hello ${escapeHtml(name)},</p>

        <p>We have successfully received your claim.</p>

        <div style="padding: 16px; background: #f0fdfa; border-radius: 8px;">
          <p><strong>Item:</strong> ${escapeHtml(itemTitle)}</p>
          <p><strong>Claim status:</strong> Pending Review</p>
        </div>

        <p>An administrator will review your claim and decide whether the item can be returned to you.</p>

        <p>Please wait for an update from the School Lost and Found team.</p>

        <p>Thank you for using our system.</p>
      </div>
    `,
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

module.exports = {
  sendVerificationEmail,
  sendClaimConfirmationEmail,
};


