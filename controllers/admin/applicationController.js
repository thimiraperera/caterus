/* Admin Application Controller */
const Application = require('../../models/Application');
const { formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const result = await Application.findAll({ status: req.query.status, page: req.query.page });
      res.render('admin/applications', { title: 'Caterer Applications', currentPage: 'applications', ...result, formatDate });
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
