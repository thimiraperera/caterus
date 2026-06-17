/* Admin Payout Controller */
const Payout  = require('../../models/Payout');
const Booking = require('../../models/Booking');
const Caterer = require('../../models/Caterer');
const { formatCurrency } = require('../../utils/helpers');
const { sendPayoutNotification } = require('../../utils/email');

module.exports = {
  async index(req, res) {
    try {
      const result = await Payout.findAll({ status: req.query.status, page: req.query.page });
      const stats = await Payout.getStats();
      res.render('admin/payouts/index', { title: 'Payouts', currentPage: 'payouts', ...result, stats, formatCurrency });
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
