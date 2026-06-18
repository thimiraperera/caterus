/* ============================================================
   Customer-Facing API Routes
   ============================================================ */
const express = require('express');
const router = express.Router();
const searchController  = require('../controllers/searchController');
const bookingController = require('../controllers/bookingController');
const reviewController  = require('../controllers/reviewController');
const Enquiry     = require('../models/Enquiry');
const Application = require('../models/Application');
const { sendEmail }     = require('../utils/email');
const { verifyCaptcha } = require('../utils/captcha');

// Search & browse
router.get('/caterers',             searchController.search);
router.get('/caterers/:slug',       searchController.getCaterer);
router.get('/suggestions',          searchController.suggestions);

// Booking
router.post('/bookings/create-checkout', bookingController.createCheckout);

// Reviews
router.post('/reviews', reviewController.create);

// Contact enquiry
router.post('/contact', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, message, caterer_id, captcha_token } = req.body;
    if (!first_name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    const captchaOk = await verifyCaptcha(captcha_token || '');
    if (!captchaOk) return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
    await Enquiry.create({ first_name, last_name, email, phone, message, caterer_id });
    // Try to send notification email (non-blocking)
    sendEmail(process.env.SMTP_FROM_EMAIL || 'admin@caterus.com.au',
      `New Enquiry from ${first_name}`,
      `<p><strong>${first_name} ${last_name || ''}</strong> (${email}) sent an enquiry:</p><p>${message || 'No message'}</p>`
    ).catch(() => {});
    res.json({ success: true, message: 'Thank you! We\'ll be in touch within 24 hours.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Caterer application
router.post('/apply', async (req, res) => {
  try {
    const { business_name, contact_name, email, phone, cuisine, service_area, captcha_token } = req.body;
    if (!business_name || !email) return res.status(400).json({ error: 'Business name and email are required.' });
    const captchaOk = await verifyCaptcha(captcha_token || '');
    if (!captchaOk) return res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
    await Application.create({ business_name, contact_name, email, phone, cuisine, service_area });
    sendEmail(process.env.SMTP_FROM_EMAIL || 'admin@caterus.com.au',
      `New Caterer Application — ${business_name}`,
      `<p><strong>${business_name}</strong> applied to join Caterus.</p><p>Contact: ${contact_name} (${email})</p><p>Cuisine: ${cuisine || 'Not specified'}</p>`
    ).catch(() => {});
    res.json({ success: true, message: 'Application received! We review new caterers within 3 business days.' });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
