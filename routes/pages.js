/* ============================================================
   Public Page Routes
   ============================================================ */
const express = require('express');
const router = express.Router();
const path = require('path');
const pageController = require('../controllers/pageController');

// Home — serve the existing static index.html from public/
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Dynamic caterer profile (data from DB)
router.get('/caterer/:slug', pageController.caterer);

// Booking success (data from DB)
router.get('/booking/success', pageController.bookingSuccess);

module.exports = router;
