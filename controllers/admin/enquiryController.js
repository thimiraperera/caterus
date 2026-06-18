/* Admin Enquiry Controller */
const Enquiry = require('../../models/Enquiry');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 20, status, search, caterer_search, date_from, date_to } = req.query;
      const result = await Enquiry.findAll({ status, search, caterer_search, date_from, date_to, page, limit: per_page });
      const qp = [];
      if (status) qp.push('status=' + encodeURIComponent(status));
      if (search) qp.push('search=' + encodeURIComponent(search));
      if (caterer_search) qp.push('caterer_search=' + encodeURIComponent(caterer_search));
      if (date_from) qp.push('date_from=' + encodeURIComponent(date_from));
      if (date_to) qp.push('date_to=' + encodeURIComponent(date_to));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');
      res.render('admin/enquiries', {
        title: 'Enquiries', currentPage: 'enquiries',
        ...result, formatDate,
        per_page: parseInt(per_page) || 20, queryExtra,
        currentStatus: status || '',
        efSearch: search || '', efCaterer: caterer_search || '',
        efDateFrom: date_from || '', efDateTo: date_to || '',
      });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load enquiries.'); res.redirect('/admin'); }
  },
  async show(req, res) {
    try {
      const enquiry = await Enquiry.findById(req.params.id);
      if (!enquiry) { req.flash('error', 'Enquiry not found.'); return res.redirect('/admin/enquiries'); }
      if (enquiry.status === 'new') await Enquiry.updateStatus(enquiry.id, 'read');
      res.render('admin/enquiries/show', { title: 'Enquiry', currentPage: 'enquiries', enquiry, formatDate });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load enquiry.'); res.redirect('/admin/enquiries'); }
  },
  async updateStatus(req, res) {
    try {
      await Enquiry.updateStatus(req.params.id, req.body.status);
      req.flash('success', 'Enquiry updated.');
      res.redirect('/admin/enquiries');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update.'); res.redirect('/admin/enquiries'); }
  },
};
