/* Admin Enquiry Controller */
const Enquiry = require('../../models/Enquiry');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 20, status } = req.query;
      const result = await Enquiry.findAll({ status, page, limit: per_page });
      const qp = [];
      if (status) qp.push('status=' + encodeURIComponent(status));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');
      res.render('admin/enquiries', {
        title: 'Enquiries', currentPage: 'enquiries',
        ...result, formatDate,
        per_page: parseInt(per_page) || 20, queryExtra,
      });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load enquiries.'); res.redirect('/admin'); }
  },
  async updateStatus(req, res) {
    try {
      await Enquiry.updateStatus(req.params.id, req.body.status);
      req.flash('success', 'Enquiry updated.');
      res.redirect('/admin/enquiries');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update.'); res.redirect('/admin/enquiries'); }
  },
};
