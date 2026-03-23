/**
 * Email service for sending ADHD assessment reports.
 * Uses Nodemailer with Gmail SMTP.
 * Premium medical/hospital themed template with inline CSS (Gmail-friendly).
 * Env: EMAIL_USER, EMAIL_APP_PASSWORD
 */

const nodemailer = require('nodemailer');

// Max scores for percentage calculation (Adult: 20 q × 3 = 60, Kid: 15 q × 3 = 45)
const MAX_SCORE = { Adult: 60, Kid: 45 };

// Best subject line for deliverability and clarity
const EMAIL_SUBJECT = 'Your ADHD Prediction Report – Sri Kanyaka Parameswari College';

// Result-based badge styling (medical theme: soft blue, teal, green)
function getResultBadgeStyle(result) {
  if (!result || typeof result !== 'string') {
    return { bg: '#f1f5f9', border: '#64748b', labelColor: '#334155' };
  }
  const r = result.toLowerCase();
  if (r.includes('unlikely')) return { bg: '#ecfdf5', border: '#10b981', labelColor: '#047857' };
  if (r.includes('possible')) return { bg: '#fffbeb', border: '#f59e0b', labelColor: '#b45309' };
  return { bg: '#f0fdfa', border: '#14b8a6', labelColor: '#0f766e' };
}

/**
 * Build premium HTML email with inline CSS (Gmail-friendly, responsive).
 * Replaces placeholders: {{name}}, {{score}}, {{result}}, {{percentage}}, {{date}}
 */
function buildReportHtml({ userName, testDate, score, result, ageGroup, percentage }) {
  const name = userName || 'User';
  const pctText = percentage != null ? `${percentage}%` : 'N/A';
  const maxScore = MAX_SCORE[ageGroup] || 60;
  const badge = getResultBadgeStyle(result);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ADHD Prediction Report</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#e8f4f8;line-height:1.5;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#e8f4f8;">
<tr>
<td align="center" style="padding:24px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(13,148,136,0.12);">

<tr>
<td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:32px 28px;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td align="center">
<div style="width:56px;height:56px;margin:0 auto 12px;background-color:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;font-size:28px;color:#ffffff;display:inline-block;">&#10003;</div>
<h1 style="margin:0;color:#ffffff;font-size:1.5rem;font-weight:700;letter-spacing:0.03em;">ADHD Prediction Report</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:0.9rem;">Sri Kanyaka Parameswari College</p>
<p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:0.8rem;">Clinical Screening Summary</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:28px 28px 0;">
<p style="margin:0;font-size:1rem;color:#1e3a5f;">Dear <strong>${name}</strong>,</p>
<p style="margin:12px 0 0;font-size:0.95rem;color:#475569;">Thank you for completing the ADHD awareness screening. Please find your report summary below.</p>
</td>
</tr>

<tr>
<td style="padding:24px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
<tr>
<td style="padding:20px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="50%" style="padding:8px 0;">
<p style="margin:0;font-size:0.7rem;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Name</p>
<p style="margin:4px 0 0;font-size:1rem;font-weight:600;color:#0f172a;">${name}</p>
</td>
<td width="50%" style="padding:8px 0;">
<p style="margin:0;font-size:0.7rem;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Test Date</p>
<p style="margin:4px 0 0;font-size:1rem;font-weight:600;color:#0f172a;">${testDate}</p>
</td>
</tr>
<tr>
<td width="50%" style="padding:8px 0;">
<p style="margin:0;font-size:0.7rem;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Screening Score</p>
<p style="margin:4px 0 0;font-size:1rem;font-weight:600;color:#0f172a;">${score} / ${maxScore}</p>
</td>
<td width="50%" style="padding:8px 0;">
<p style="margin:0;font-size:0.7rem;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Percentage</p>
<p style="margin:4px 0 0;font-size:1rem;font-weight:600;color:#0f172a;">${pctText}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 28px 24px;" align="center">
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="background-color:${badge.bg};border:2px solid ${badge.border};border-radius:12px;padding:24px 32px;">
<tr>
<td align="center">
<p style="margin:0;font-size:0.75rem;color:${badge.labelColor};text-transform:uppercase;letter-spacing:0.1em;">Screening Result</p>
<p style="margin:8px 0 0;font-size:1.25rem;font-weight:700;color:#0f172a;">${result}</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 28px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;border-left:4px solid #0ea5e9;border-radius:0 8px 8px 0;">
<tr>
<td style="padding:20px 24px;">
<p style="margin:0;font-size:0.8rem;color:#0369a1;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Summary</p>
<p style="margin:12px 0 0;font-size:0.95rem;color:#334155;line-height:1.6;">This result is based on your responses to the ADHD awareness questionnaire. It reflects patterns that may be associated with attention and hyperactivity traits. Lower scores suggest fewer reported traits; higher scores suggest more reported traits that may warrant further exploration. This screening is for awareness purposes only.</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 28px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ecfdf5;border:2px solid #10b981;border-radius:8px;">
<tr>
<td style="padding:24px;">
<p style="margin:0;font-size:0.85rem;color:#047857;font-weight:700;">&#9733; Important Recommendation</p>
<p style="margin:12px 0 0;font-size:0.95rem;color:#064e3b;line-height:1.6;"><strong>We strongly advise you to consult a qualified doctor, psychologist, or mental health professional</strong> for actual diagnosis, proper clinical evaluation, and treatment if needed. A licensed healthcare provider can conduct a comprehensive assessment and provide appropriate support. Do not rely on this screening alone for any medical decisions.</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 28px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fef3c7;border:1px solid #fcd34d;border-radius:8px;">
<tr>
<td style="padding:20px 24px;">
<p style="margin:0;font-size:0.8rem;color:#92400e;font-weight:700;">&#9888; Disclaimer</p>
<p style="margin:8px 0 0;font-size:0.9rem;color:#78350f;line-height:1.5;">This assessment is only a <strong>screening tool</strong> and is <strong>not a medical diagnosis</strong>. It is designed for awareness purposes only and cannot replace a professional clinical evaluation.</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="background-color:#f1f5f9;padding:24px 28px;text-align:center;border-top:1px solid #e2e8f0;">
<p style="margin:0;font-size:0.75rem;color:#64748b;">ADHD AWARE &middot; Sri Kanyaka Parameswari College</p>
<p style="margin:6px 0 0;font-size:0.7rem;color:#94a3b8;">This report was generated automatically after you completed the screening.</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Send ADHD assessment report to user's email.
 * @param {Object} params
 * @param {string} params.to - Recipient email (from logged-in user)
 * @param {string} [params.userName] - User's name from auth
 * @param {number} params.score - Total ADHD score
 * @param {string} params.result - Prediction result (e.g. "High likelihood of ADHD")
 * @param {string} params.ageGroup - "Adult" or "Kid"
 * @param {string} params.testDate - Formatted test date
 * @returns {Promise<boolean>} true if sent, false if skipped/failed
 */
async function sendAssessmentReport({ to, userName, score, result, ageGroup, testDate }) {
  const emailUser = process.env.EMAIL_USER;
  const appPassword = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !appPassword) {
    console.log('Email not configured (EMAIL_USER/EMAIL_APP_PASSWORD). Report not sent.');
    return false;
  }

  if (!to || typeof to !== 'string' || !to.includes('@')) {
    console.warn('Invalid recipient email for report:', to);
    return false;
  }

  const maxScore = MAX_SCORE[ageGroup] || 60;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : null;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: appPassword
    }
  });

  const html = buildReportHtml({
    userName: userName || 'User',
    testDate,
    score,
    result,
    ageGroup,
    percentage
  });

  const mailOptions = {
    from: `"ADHD AWARE" <${emailUser}>`,
    to,
    subject: EMAIL_SUBJECT,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Assessment report emailed to', to);
    return true;
  } catch (err) {
    console.error('Failed to send assessment report email:', err.message);
    return false;
  }
}

module.exports = { sendAssessmentReport, buildReportHtml, EMAIL_SUBJECT };
