/* ============================================================
   Public Page Routes
   ============================================================ */
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Home — rendered dynamically with caterers from DB
router.get('/', pageController.home);

// Dynamic caterer profile (data from DB)
router.get('/caterer/:slug', pageController.caterer);

// Booking success (data from DB)
router.get('/booking/success', pageController.bookingSuccess);

module.exports = router;
