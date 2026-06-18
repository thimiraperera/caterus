/* Admin Booking Controller */
const Booking = require('../../models/Booking');
const Caterer = require('../../models/Caterer');
const Payment = require('../../models/Payment');
const { formatCurrency, formatDate } = require('../../utils/helpers');
const { sendBookingConfirmation } = require('../../utils/email');

module.exports = {
  async index(req, res) {
    try {
      const { status, search, caterer_search, date_from, date_to, total_min, total_max,
              guest_min, guest_max, payment_status, page = 1, per_page = 20 } = req.query;
      const result = await Booking.findAll({
        status, search, caterer_search, date_from, date_to,
        total_min, total_max, guest_min, guest_max, payment_status,
        page, limit: per_page,
      });
      const qp = [];
      if (status) qp.push('status=' + encodeURIComponent(status));
      if (search) qp.push('search=' + encodeURIComponent(search));
      if (caterer_search) qp.push('caterer_search=' + encodeURIComponent(caterer_search));
      if (date_from) qp.push('date_from=' + encodeURIComponent(date_from));
      if (date_to) qp.push('date_to=' + encodeURIComponent(date_to));
      if (total_min) qp.push('total_min=' + total_min);
      if (total_max) qp.push('total_max=' + total_max);
      if (guest_min) qp.push('guest_min=' + guest_min);
      if (guest_max) qp.push('guest_max=' + guest_max);
      if (payment_status) qp.push('payment_status=' + encodeURIComponent(payment_status));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');

      if (req.headers['x-partial'] === '1') {
        const ejs  = require('ejs');
        const path = require('path');
        const html = await ejs.renderFile(
          path.join(req.app.get('views'), 'admin/bookings/_table.ejs'),
          { ...result, formatCurrency, formatDate, per_page: parseInt(per_page) || 20, queryExtra });
        return res.send(html);
      }

      res.render('admin/bookings/index', {
        title: 'Bookings', currentPage: 'bookings',
        ...result, formatCurrency, formatDate,
        per_page: parseInt(per_page) || 20, queryExtra,
        currentStatus: status || '',
        bfSearch: search || '', bfCaterer: caterer_search || '',
        bfDateFrom: date_from || '', bfDateTo: date_to || '',
        bfTotalMin: total_min || '', bfTotalMax: total_max || '',
        bfGuestMin: guest_min || '', bfGuestMax: guest_max || '',
        bfPayment: payment_status || '',
      });
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
