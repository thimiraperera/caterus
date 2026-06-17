/* Admin Booking Controller */
const Booking = require('../../models/Booking');
const Caterer = require('../../models/Caterer');
const Payment = require('../../models/Payment');
const { formatCurrency, formatDate } = require('../../utils/helpers');
const { sendBookingConfirmation } = require('../../utils/email');

module.exports = {
  async index(req, res) {
    try {
      const result = await Booking.findAll({ status: req.query.status, search: req.query.search, page: req.query.page });
      res.render('admin/bookings/index', { title: 'Bookings', currentPage: 'bookings', ...result, formatCurrency, formatDate });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load bookings.'); res.redirect('/admin'); }
  },

  async show(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) { req.flash('error', 'Booking not found.'); return res.redirect('/admin/bookings'); }
      const payments = await Payment.findByBooking(booking.id);
      res.render('admin/bookings/detail', { title: `Booking ${booking.reference}`, currentPage: 'bookings', booking, payments, formatCurrency, formatDate });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load booking.'); res.redirect('/admin/bookings'); }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      await Booking.updateStatus(req.params.id, status);

      if (status === 'confirmed') {
        const booking = await Booking.findById(req.params.id);
        if (booking) {
          const caterer = await Caterer.findById(booking.caterer_id);
          if (caterer) sendBookingConfirmation(booking, caterer).catch(() => {});
        }
      }

      req.flash('success', `Booking status updated to ${status}.`);
      res.redirect(`/admin/bookings/${req.params.id}`);
    } catch (err) { console.error(err); req.flash('error', 'Failed to update status.'); res.redirect(`/admin/bookings/${req.params.id}`); }
  },

  async updateNotes(req, res) {
    try {
      await Booking.update(req.params.id, { admin_notes: req.body.admin_notes });
      req.flash('success', 'Notes saved.');
      res.redirect(`/admin/bookings/${req.params.id}`);
    } catch (err) { console.error(err); req.flash('error', 'Failed to save notes.'); res.redirect(`/admin/bookings/${req.params.id}`); }
  },
};
