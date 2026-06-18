/* Admin Payout Controller */
const Payout  = require('../../models/Payout');
const Booking = require('../../models/Booking');
const Caterer = require('../../models/Caterer');
const { formatCurrency } = require('../../utils/helpers');
const { sendPayoutNotification } = require('../../utils/email');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 20, status, caterer_search, booking_search,
              amount_min, amount_max, date_from, date_to } = req.query;
      const [result, stats] = await Promise.all([
        Payout.findAll({ status, caterer_search, booking_search, amount_min, amount_max, date_from, date_to, page, limit: per_page }),
        Payout.getStats(),
      ]);
      const qp = [];
      if (status) qp.push('status=' + encodeURIComponent(status));
      if (caterer_search) qp.push('caterer_search=' + encodeURIComponent(caterer_search));
      if (booking_search) qp.push('booking_search=' + encodeURIComponent(booking_search));
      if (amount_min) qp.push('amount_min=' + amount_min);
      if (amount_max) qp.push('amount_max=' + amount_max);
      if (date_from) qp.push('date_from=' + encodeURIComponent(date_from));
      if (date_to) qp.push('date_to=' + encodeURIComponent(date_to));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');

      if (req.headers['x-partial'] === '1') {
        const ejs  = require('ejs');
        const path = require('path');
        const html = await ejs.renderFile(
          path.join(req.app.get('views'), 'admin/payouts/_table.ejs'),
          { ...result, formatCurrency, per_page: parseInt(per_page) || 20, queryExtra });
        return res.send(html);
      }

      res.render('admin/payouts/index', {
        title: 'Payouts', currentPage: 'payouts',
        ...result, stats, formatCurrency,
        per_page: parseInt(per_page) || 20, queryExtra,
        currentStatus: status || '',
        pfCaterer: caterer_search || '', pfBooking: booking_search || '',
        pfAmountMin: amount_min || '', pfAmountMax: amount_max || '',
        pfDateFrom: date_from || '', pfDateTo: date_to || '',
      });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load payouts.'); res.redirect('/admin'); }
  },

  async store(req, res) {
    try {
      const { booking_id, caterer_id, amount, payout_date, notes } = req.body;
      await Payout.create({ booking_id, caterer_id, amount, payout_date, notes, processed_by: req.session.adminId });
      req.flash('success', 'Payout created.');
      res.redirect('/admin/payouts');
    } catch (err) { console.error(err); req.flash('error', 'Failed to create payout.'); res.redirect('/admin/payouts'); }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      await Payout.updateStatus(req.params.id, status, req.session.adminId);
      if (status === 'completed') {
        const payout = await Payout.findById(req.params.id);
        if (payout) {
          const caterer = await Caterer.findById(payout.caterer_id);
          if (caterer) sendPayoutNotification(payout, caterer).catch(() => {});
        }
      }
      req.flash('success', `Payout marked as ${status}.`);
      res.redirect('/admin/payouts');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update payout.'); res.redirect('/admin/payouts'); }
  },
};
