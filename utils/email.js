/* ============================================================
   Email Utility — Nodemailer with dynamic SMTP from DB
   ============================================================ */
const nodemailer = require('nodemailer');
const db = require('../config/database');
const { formatCurrency, formatDate } = require('./helpers');

/** Load SMTP settings from DB, fall back to env vars */
const getTransporter = async () => {
  let host, port, user, pass, fromEmail, fromName;
  try {
    const [rows] = await db.query("SELECT setting_key, setting_value FROM settings WHERE setting_group = 'smtp'");
    const s = {};
    rows.forEach(r => { s[r.setting_key] = r.setting_value; });
    host      = s.smtp_host      || process.env.SMTP_HOST;
    port      = parseInt(s.smtp_port || process.env.SMTP_PORT) || 587;
    user      = s.smtp_user      || process.env.SMTP_USER;
    pass      = s.smtp_pass      || process.env.SMTP_PASS;
    fromEmail = s.smtp_from_email || process.env.SMTP_FROM_EMAIL || 'hello@caterus.com.au';
    fromName  = s.smtp_from_name  || process.env.SMTP_FROM_NAME  || 'Caterus';
  } catch {
    host      = process.env.SMTP_HOST;
    port      = parseInt(process.env.SMTP_PORT) || 587;
    user      = process.env.SMTP_USER;
    pass      = process.env.SMTP_PASS;
    fromEmail = process.env.SMTP_FROM_EMAIL || 'hello@caterus.com.au';
    fromName  = process.env.SMTP_FROM_NAME  || 'Caterus';
  }

  if (!host || !user || !pass) return null;

  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
  });

  transporter._fromAddress = `"${fromName}" <${fromEmail}>`;
  return transporter;
};

/** Load branding for emails (logo + site name) */
const getEmailBranding = async () => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('logo_path','logo_path_dark','email_logo_type','site_name')"
    );
    const s = {};
    rows.forEach(r => { s[r.setting_key] = r.setting_value; });
    const type     = s.email_logo_type || 'light';
    const logoPath = type === 'dark' ? (s.logo_path_dark || s.logo_path) : (s.logo_path || s.logo_path_dark);
    const base     = process.env.BASE_URL || 'https://caterus.com.au';
    return {
      logoUrl:  logoPath && type !== 'none' ? `${base}/${logoPath}` : '',
      siteName: s.site_name || 'Caterus',
      base,
    };
  } catch { return { logoUrl: '', siteName: 'Caterus', base: process.env.BASE_URL || 'https://caterus.com.au' }; }
};

/** Build a branded HTML email wrapper */
const buildEmailTemplate = (bodyHtml, { logoUrl = '', siteName = 'Caterus', accentColor = '#75896d' } = {}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${siteName}</title>
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede8;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:${accentColor};border-radius:14px 14px 0 0;padding:28px 36px">
            ${logoUrl
              ? `<img src="${logoUrl}" alt="${siteName}" style="height:36px;width:auto;object-fit:contain;display:block;max-width:160px">`
              : `<span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">${siteName}</span>`
            }
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px;border:1px solid #e4e0d8;border-top:none;border-radius:0 0 14px 14px;color:#1a1a1a;font-size:15px;line-height:1.65">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;text-align:center">
            <p style="margin:0;font-size:12px;color:#999;line-height:1.6">
              &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.<br>
              <a href="${process.env.BASE_URL || 'https://caterus.com.au'}" style="color:#999;text-decoration:underline">${siteName}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

/** Send a generic email */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log('  SMTP not configured — email skipped:', subject);
      return { success: false, error: 'SMTP not configured' };
    }
    await transporter.sendMail({ from: transporter._fromAddress, to, subject, html });
    console.log('  Email sent:', subject, '->', to);
    return { success: true };
  } catch (err) {
    console.error('  Email failed:', err.message);
    return { success: false, error: err.message };
  }
};

/** Booking confirmation to customer */
const sendBookingConfirmation = async (booking, caterer) => {
  const { logoUrl, siteName } = await getEmailBranding();
  const body = `
    <p style="margin:0 0 20px">Hi <strong>${booking.customer_first_name}</strong>,</p>
    <p style="margin:0 0 20px">Your booking with <strong>${caterer.business_name}</strong> is confirmed. Here are your details:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse">
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Reference</td><td style="padding:10px 0;font-weight:700;font-size:14px">${booking.reference}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Caterer</td><td style="padding:10px 0;font-size:14px">${caterer.business_name}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Event date</td><td style="padding:10px 0;font-size:14px">${formatDate(booking.event_date)}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Guests</td><td style="padding:10px 0;font-size:14px">${booking.guest_count}</td></tr>
      <tr><td style="padding:12px 0;color:#666;font-size:14px">Total paid</td><td style="padding:12px 0;font-size:18px;font-weight:800;color:#75896d">${formatCurrency(booking.total)}</td></tr>
    </table>
    <p style="margin:0 0 24px;font-size:14px;color:#666">We will be in touch with more details closer to the date. If you have any questions, reply to this email.</p>
    <p style="margin:0;font-size:14px;color:#999">The ${siteName} Team</p>`;
  return sendEmail(booking.customer_email, `Booking Confirmed — ${booking.reference}`, buildEmailTemplate(body, { logoUrl, siteName }));
};

/** New booking notification to admin */
const sendNewBookingNotification = async (booking, caterer) => {
  const { logoUrl, siteName, base } = await getEmailBranding();
  const adminEmail = process.env.SMTP_FROM_EMAIL || 'admin@caterus.com.au';
  const body = `
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:700">New Booking Received</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse">
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Reference</td><td style="padding:10px 0;font-weight:700;font-size:14px">${booking.reference}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Customer</td><td style="padding:10px 0;font-size:14px">${booking.customer_first_name} ${booking.customer_last_name} (${booking.customer_email})</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Caterer</td><td style="padding:10px 0;font-size:14px">${caterer.business_name}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Event date</td><td style="padding:10px 0;font-size:14px">${formatDate(booking.event_date)}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Guests</td><td style="padding:10px 0;font-size:14px">${booking.guest_count}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px">Total</td><td style="padding:10px 0;font-size:16px;font-weight:700">${formatCurrency(booking.total)}</td></tr>
    </table>
    <a href="${base}/admin/bookings/${booking.id}" style="display:inline-block;background:#75896d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">View in Dashboard</a>`;
  return sendEmail(adminEmail, `New Booking — ${booking.reference}`, buildEmailTemplate(body, { logoUrl, siteName }));
};

/** Booking notification to caterer */
const sendCatererBookingNotification = async (booking, caterer) => {
  if (!caterer.contact_email) return { success: false, error: 'No caterer email' };
  const { logoUrl, siteName } = await getEmailBranding();
  const body = `
    <p style="margin:0 0 20px">Hi <strong>${caterer.contact_name || caterer.business_name}</strong>,</p>
    <p style="margin:0 0 20px">Great news! You have a new booking through ${siteName}.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse">
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Reference</td><td style="padding:10px 0;font-weight:700;font-size:14px">${booking.reference}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Event date</td><td style="padding:10px 0;font-size:14px">${formatDate(booking.event_date)}</td></tr>
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Guests</td><td style="padding:10px 0;font-size:14px">${booking.guest_count}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px">Your payout</td><td style="padding:10px 0;font-size:18px;font-weight:800;color:#75896d">${formatCurrency(booking.caterer_payout)}</td></tr>
    </table>
    <p style="margin:0 0 0;font-size:13px;color:#999">The ${siteName} team will be in touch with full customer details.</p>`;
  return sendEmail(caterer.contact_email, `New Booking via ${siteName} — ${booking.reference}`, buildEmailTemplate(body, { logoUrl, siteName }));
};

/** Payout notification to caterer */
const sendPayoutNotification = async (payout, caterer) => {
  if (!caterer.contact_email) return { success: false, error: 'No caterer email' };
  const { logoUrl, siteName } = await getEmailBranding();
  const body = `
    <p style="margin:0 0 20px">Hi <strong>${caterer.contact_name || caterer.business_name}</strong>,</p>
    <p style="margin:0 0 24px">Your payout has been processed.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse">
      <tr style="border-bottom:1px solid #f0ede8"><td style="padding:10px 0;color:#666;font-size:14px">Amount</td><td style="padding:10px 0;font-size:22px;font-weight:800;color:#75896d">${formatCurrency(payout.amount)}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px">Reference</td><td style="padding:10px 0;font-size:14px">${payout.reference || 'N/A'}</td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#999">The ${siteName} Team</p>`;
  return sendEmail(caterer.contact_email, `Payout Processed — ${formatCurrency(payout.amount)}`, buildEmailTemplate(body, { logoUrl, siteName }));
};

/** Test email */
const sendTestEmail = async (to) => {
  const { logoUrl, siteName } = await getEmailBranding();
  const body = `
    <div style="text-align:center;padding:20px 0">
      <div style="width:56px;height:56px;border-radius:50%;background:#75896d;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:20px;line-height:1">&#10003;</div>
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700">SMTP is working!</h2>
      <p style="margin:0 0 8px;color:#555;font-size:15px">Your ${siteName} email settings are configured correctly.</p>
      <p style="margin:0;font-size:13px;color:#999">This test was sent from the admin dashboard.</p>
    </div>`;
  return sendEmail(to, `${siteName} — SMTP Test`, buildEmailTemplate(body, { logoUrl, siteName }));
};

module.exports = {
  sendEmail, sendBookingConfirmation, sendNewBookingNotification,
  sendCatererBookingNotification, sendPayoutNotification, sendTestEmail,
};
