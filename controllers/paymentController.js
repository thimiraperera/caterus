/* Payment Controller — Stripe webhook handler */
const Booking = require('../models/Booking');
const Caterer = require('../models/Caterer');
const Payment = require('../models/Payment');
const { getStripe, getWebhookSecret } = require('../utils/stripe');
const { sendBookingConfirmation, sendNewBookingNotification, sendCatererBookingNotification } = require('../utils/email');

module.exports = {
  async handleWebhook(req, res) {
    try {
      const stripe = await getStripe();
      if (!stripe) return res.status(400).send('Stripe not configured');

      const sig = req.headers['stripe-signature'];
      const webhookSecret = await getWebhookSecret();
      let event;

      if (webhookSecret) {
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
          console.error('Webhook signature verification failed:', err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        event = JSON.parse(req.body);
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const booking = await Booking.getByStripeSession(session.id);

        if (booking) {
          // Update booking status
          await Booking.updateStatus(booking.id, 'confirmed');
          await Booking.updatePaymentStatus(booking.id, 'paid', {
            payment_intent: session.payment_intent,
          });

          // Create payment record
          await Payment.create({
            booking_id: booking.id,
            stripe_payment_intent: session.payment_intent,
            amount: booking.total,
            currency: 'aud',
            status: 'succeeded',
            method: 'card',
          });

          // Send emails
          const caterer = await Caterer.findById(booking.caterer_id);
          if (caterer) {
            sendBookingConfirmation(booking, caterer).catch(() => {});
            sendNewBookingNotification(booking, caterer).catch(() => {});
            sendCatererBookingNotification(booking, caterer).catch(() => {});
          }

          console.log(`  ✓ Payment completed for booking ${booking.reference}`);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  },
};
