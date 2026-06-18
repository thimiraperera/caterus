/* Admin controller — caterer-specific contact messages */
const Enquiry    = require('../../models/Enquiry');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const page     = Math.max(1, parseInt(req.query.page) || 1);
      const per_page = parseInt(req.query.per_page) || 20;
      const status   = req.query.status || '';

      const { enquiries, total, totalPages } = await Enquiry.findAll({
        hasCaterer: true,
        status: status || undefined,
        page,
        limit: per_page,
      });

      const queryExtra = status ? `&status=${encodeURIComponent(status)}` : '';
      res.render('admin/caterer-messages', {
        title: 'Caterer Messages',
        currentPage: 'caterer-messages',
        enquiries, total, page, totalPages, per_page, status, queryExtra, formatDate,
      });
    } catch (err) {
      console.error('Caterer messages error:', err);
      req.flash('error', 'Failed to load caterer messages.');
      res.redirect('/admin');
    }
  },
};
