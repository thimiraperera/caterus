/* Admin Enquiry Controller */
const Enquiry = require('../../models/Enquiry');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const result = await Enquiry.findAll({ status: req.query.status, page: req.query.page });
      res.render('admin/enquiries', { title: 'Enquiries', currentPage: 'enquiries', ...result, formatDate });
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
