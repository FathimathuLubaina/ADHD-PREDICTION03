/**
 * Nodemailer Integration Example
 * Shows how to send the ADHD report email with placeholder replacement.
 */

const nodemailer = require('nodemailer');
const { buildReportHtml, EMAIL_SUBJECT } = require('../services/emailService');

// 1. Create transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// 2. Build HTML with real values (replaces placeholders)
const html = buildReportHtml({
  userName: 'John Doe',
  testDate: 'March 18, 2026, 2:30 PM',
  score: 35,
  result: 'Possible ADHD traits',
  ageGroup: 'Adult',
  percentage: 58
});

// 3. Send mail
const mailOptions = {
  from: `"ADHD AWARE" <${process.env.EMAIL_USER}>`,
  to: 'recipient@example.com',
  subject: EMAIL_SUBJECT,
  html
};

// Example: Send (uncomment to test)
// transporter.sendMail(mailOptions)
//   .then(() => console.log('Email sent'))
//   .catch(err => console.error(err));

/**
 * Placeholder mapping (used by buildReportHtml):
 * {{name}}     -> userName
 * {{date}}     -> testDate
 * {{score}}    -> score / maxScore
 * {{result}}   -> result (e.g. "High likelihood of ADHD")
 * {{percentage}} -> percentage%
 */
