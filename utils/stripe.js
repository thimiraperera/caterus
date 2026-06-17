/* ============================================================
   Stripe Utility
   ============================================================ */
const db = require('../config/database');

/** Get Stripe instance from DB settings or env */
const getStripe = async () => {
  let secretKey;
  try {
    const [rows] = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_secret_key'");
    secretKey = (rows[0] && rows[0].setting_value) || process.env.STRIPE_SECRET_KEY;
  } catch {
    secretKey = process.env.STRIPE_SECRET_KEY;
  }
  if (!secretKey) return null;
  return require('stripe')(secretKey);
};

/** Get publishable key */
const getPublishableKey = async () => {
  try {
    const [rows] = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_publishable_key'");
    return (rows[0] && rows[0].setting_value) || process.env.STRIPE_PUBLISHABLE_KEY || '';
  } catch {
    return process.env.STRIPE_PUBLISHABLE_KEY || '';
  }
};

/** Get webhook secret */
const getWebhookSecret = async () => {
  try {
    const [rows] = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_webhook_secret'");
    return (rows[0] && rows[0].setting_value) || process.env.STRIPE_WEBHOOK_SECRET || '';
  } catch {
    return process.env.STRIPE_WEBHOOK_SECRET || '';
  }
};

/** Create Checkout Session */
const createCheckoutSession = async (booking, caterer, menu) => {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe is not configured. Add your keys in Admin → Settings → Stripe.');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const lineItems = [{
    price_data: {
      currency: 'aud',
      product_data: {
        name: `${caterer.business_name} — ${menu.name}`,
        description: `${booking.guest_count} guests · ${new Date(booking.event_date).toLocaleDateString('en-AU')}`,
      },
      unit_amount: Math.round(booking.total * 100), // cents
    },
    quantity: 1,
  }];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    customer_email: booking.customer_email,
    metadata: {
      booking_id: booking.id.toString(),
      booking_reference: booking.reference,
    },
    success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/caterer/${caterer.slug}?booking=cancelled`,
  });

  return session;
};

module.exports = { getStripe, getPublishableKey, getWebhookSecret, createCheckoutSession };
