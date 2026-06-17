/* Booking Controller — create Stripe checkout */
const Booking  = require('../models/Booking');
const Caterer  = require('../models/Caterer');
const Menu     = require('../models/Menu');
const Settings = require('../models/Settings');
const { calculateBookingTotals } = require('../utils/helpers');
const { createCheckoutSession }  = require('../utils/stripe');

module.exports = {
  async createCheckout(req, res) {
    try {
      const { caterer_id, menu_id, event_date, guest_count, dietary_requirements, special_requests,
              customer_first_name, customer_last_name, customer_email, customer_phone } = req.body;

      if (!caterer_id || !menu_id || !event_date || !guest_count || !customer_email || !customer_first_name) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
      }

      const caterer = await Caterer.findById(caterer_id);
      if (!caterer) return res.status(404).json({ error: 'Caterer not found.' });

      const menu = await Menu.findById(menu_id);
      if (!menu) return res.status(404).json({ error: 'Menu package not found.' });

      const commissionRate = parseFloat(await Settings.get('commission_rate') || '12');
      const gstRate = parseFloat(await Settings.get('gst_rate') || '10');

      const totals = calculateBookingTotals(menu.price_per_head, parseInt(guest_count), 0, commissionRate, gstRate);

      const bookingData = {
        caterer_id, menu_id,
        customer_first_name, customer_last_name, customer_email, customer_phone,
        event_date, guest_count: parseInt(guest_count),
        price_per_head: menu.price_per_head,
        ...totals,
        commission_rate: commissionRate,
        dietary_requirements: Array.isArray(dietary_requirements) ? JSON.stringify(dietary_requirements) : dietary_requirements,
        special_requests,
        stripe_session_id: '', // will be updated
      };

      const { id, reference } = await Booking.create(bookingData);
      bookingData.id = id;
      bookingData.reference = reference;

      // Create Stripe Checkout session
      try {
        const session = await createCheckoutSession(bookingData, caterer, menu);
        // Update booking with session ID
        await require('../config/database').query(
          'UPDATE bookings SET stripe_session_id = ? WHERE id = ?', [session.id, id]
        );
        res.json({ success: true, url: session.url, reference });
      } catch (stripeErr) {
        // If Stripe fails, still create booking but return without redirect
        console.error('Stripe error:', stripeErr.message);
        // Mark as confirmed without payment for dev/testing
        await Booking.updateStatus(id, 'confirmed');
        await Booking.updatePaymentStatus(id, 'unpaid');
        res.json({
          success: true,
          url: `/booking/success?ref=${reference}`,
          reference,
          note: 'Stripe not configured — booking created without payment.'
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      res.status(500).json({ error: 'Failed to create booking. Please try again.' });
    }
  },
};
