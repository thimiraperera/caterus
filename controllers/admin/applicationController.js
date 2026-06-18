/* Admin Application Controller */
const Application = require('../../models/Application');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 20, status, search, cuisine, area } = req.query;
      const result = await Application.findAll({ status, search, cuisine, area, page, limit: per_page });
      const qp = [];
      if (status) qp.push('status=' + encodeURIComponent(status));
      if (search) qp.push('search=' + encodeURIComponent(search));
      if (cuisine) qp.push('cuisine=' + encodeURIComponent(cuisine));
      if (area) qp.push('area=' + encodeURIComponent(area));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');
      res.render('admin/applications', {
        title: 'Caterer Applications', currentPage: 'applications',
        ...result, formatDate,
        per_page: parseInt(per_page) || 20, queryExtra,
        currentStatus: status || '',
        afSearch: search || '', afCuisine: cuisine || '', afArea: area || '',
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
