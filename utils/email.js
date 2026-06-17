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
    host = s.smtp_host || process.env.SMTP_HOST;
    port = parseInt(s.smtp_port || process.env.SMTP_PORT) || 587;
    user = s.smtp_user || process.env.SMTP_USER;
    pass = s.smtp_pass || process.env.SMTP_PASS;
    fromEmail = s.smtp_from_email || process.env.SMTP_FROM_EMAIL || 'hello@caterus.com.au';
    fromName = s.smtp_from_name || process.env.SMTP_FROM_NAME || 'Caterus';
  } catch {
    host = process.env.SMTP_HOST;
    port = parseInt(process.env.SMTP_PORT) || 587;
    user = process.env.SMTP_USER;
    pass = process.env.SMTP_PASS;
    fromEmail = process.env.SMTP_FROM_EMAIL || 'hello@caterus.com.au';
    fromName = process.env.SMTP_FROM_NAME || 'Caterus';
  }

  if (!host || !user || !pass) return null;

  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
  });

  transporter._fromAddress = `"${fromName}" <${fromEmail}>`;
  return transporter;
};

/** Send a generic email */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log('  ⚠ SMTP not configured — email skipped:', subject);
      return { success: false, error: 'SMTP not configured' };
    }
    await transporter.sendMail({ from: transporter._fromAddress, to, subject, html });
    console.log('  ✉ Email sent:', subject, '→', to);
    return { success: true };
  } catch (err) {
    console.error('  ✗ Email failed:', err.message);
    return { success: false, error: err.message };
  }
};

/** Booking confirmation to customer */
const sendBookingConfirmation = async (booking, caterer) => {
  const html = `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#75896d;color:#fff;padding:24px 32px;border-radius:16px 16px 0 0">
        <h1 style="margin:0;font-size:20px">Booking Confirmed ✓</h1>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px">
        <p>Hi ${booking.customer_first_name},</p>
        <p>Your booking with <strong>${caterer.business_name}</strong> has been confirmed!</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px 0;color:#666">Reference</td><td style="padding:8px 0;font-weight:600">${booking.reference}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Event date</td><td style="padding:8px 0">${formatDate(booking.event_date)}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Guests</td><td style="padding:8px 0">${booking.guest_count}</td></tr>
          <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Total</td><td style="padding:8px 0;font-weight:700;font-size:18px;border-bottom:1px solid #eee">${formatCurrency(booking.total)}</td></tr>
        </table>
        <p style="color:#666;font-size:14px">We'll be in touch with more details closer to the date.</p>
        <p style="margin-top:24px">— The Caterus Team</p>
      </div>
    </div>`;
  return sendEmail(booking.customer_email, `Booking Confirmed — ${booking.reference}`, html);
};

/** New booking notification to admin */
const sendNewBookingNotification = async (booking, caterer) => {
  const html = `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2>New Booking Received</h2>
      <p><strong>Reference:</strong> ${booking.reference}</p>
      <p><strong>Customer:</strong> ${booking.customer_first_name} ${booking.customer_last_name} (${booking.customer_email})</p>
      <p><strong>Caterer:</strong> ${caterer.business_name}</p>
      <p><strong>Date:</strong> ${formatDate(booking.event_date)}</p>
      <p><strong>Guests:</strong> ${booking.guest_count}</p>
      <p><strong>Total:</strong> ${formatCurrency(booking.total)}</p>
      <p><a href="${process.env.BASE_URL}/admin/bookings/${booking.id}">View in dashboard →</a></p>
    </div>`;
  return sendEmail(process.env.SMTP_FROM_EMAIL || 'admin@caterus.com.au', `New Booking — ${booking.reference}`, html);
};

/** Booking notification to caterer */
const sendCatererBookingNotification = async (booking, caterer) => {
  if (!caterer.contact_email) return { success: false, error: 'No caterer email' };
  const html = `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2>You have a new booking!</h2>
      <p><strong>Reference:</strong> ${booking.reference}</p>
      <p><strong>Event date:</strong> ${formatDate(booking.event_date)}</p>
      <p><strong>Guests:</strong> ${booking.guest_count}</p>
      <p><strong>Your payout:</strong> ${formatCurrency(booking.caterer_payout)}</p>
      <p style="color:#666;font-size:14px">The Caterus team will be in touch with full details.</p>
    </div>`;
  return sendEmail(caterer.contact_email, `New Booking via Caterus — ${booking.reference}`, html);
};

/** Payout notification to caterer */
const sendPayoutNotification = async (payout, caterer) => {
  if (!caterer.contact_email) return { success: false, error: 'No caterer email' };
  const html = `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2>Payout Processed</h2>
      <p>Hi ${caterer.contact_name || caterer.business_name},</p>
      <p>A payout of <strong>${formatCurrency(payout.amount)}</strong> has been processed to your account.</p>
      <p><strong>Reference:</strong> ${payout.reference || 'N/A'}</p>
      <p style="color:#666;font-size:14px">— The Caterus Team</p>
    </div>`;
  return sendEmail(caterer.contact_email, `Payout Processed — ${formatCurrency(payout.amount)}`, html);
};

/** Test email */
const sendTestEmail = async (to) => {
  const html = `
    <div style="font-family:'Helvetica Neue',sans-serif;max-width:500px;margin:0 auto;padding:32px;text-align:center">
      <div style="width:48px;height:48px;border-radius:50%;background:#75896d;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px">✓</div>
      <h2>SMTP Working!</h2>
      <p style="color:#666">Your Caterus email settings are configured correctly.</p>
    </div>`;
  return sendEmail(to, 'Caterus — SMTP Test Email', html);
};

module.exports = {
  sendEmail, sendBookingConfirmation, sendNewBookingNotification,
  sendCatererBookingNotification, sendPayoutNotification, sendTestEmail,
};
