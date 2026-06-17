/* ============================================================
   Stripe Webhook Routes
   ============================================================ */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/stripe', paymentController.handleWebhook);

module.exports = router;
