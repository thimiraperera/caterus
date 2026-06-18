/* Admin Application Controller */
const Application = require('../../models/Application');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 20, status } = req.query;
      const result = await Application.findAll({ status, page, limit: per_page });
      const qp = [];
      if (status) qp.push('status=' + encodeURIComponent(status));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');
      res.render('admin/applications', {
        title: 'Caterer Applications', currentPage: 'applications',
        ...result, formatDate,
        per_page: parseInt(per_page) || 20, queryExtra,
      });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load applications.'); res.redirect('/admin'); }
  },
  async updateStatus(req, res) {
    try {
      await Application.updateStatus(req.params.id, req.body.status, req.body.admin_notes);
      req.flash('success', 'Application updated.');
      res.redirect('/admin/applications');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update.'); res.redirect('/admin/applications'); }
  },
};
