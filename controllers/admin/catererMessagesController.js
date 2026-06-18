/* Admin controller — caterer-specific contact messages */
const Enquiry    = require('../../models/Enquiry');
const { formatDate } = require('../../utils/helpers');
const path       = require('path');

module.exports = {
  async index(req, res) {
    try {
      const page     = Math.max(1, parseInt(req.query.page) || 1);
      const per_page = parseInt(req.query.per_page) || 20;
      const status         = req.query.status || '';
      const caterer_search = req.query.caterer_search || '';
      const from_search    = req.query.from_search || '';
      const date_from      = req.query.date_from || '';
      const date_to        = req.query.date_to || '';

      const { enquiries, total, totalPages } = await Enquiry.findAll({
        hasCaterer: true,
        status: status || undefined,
        caterer_search: caterer_search || undefined,
        search: from_search || undefined,
        date_from: date_from || undefined,
        date_to: date_to || undefined,
        page,
        limit: per_page,
      });

      const qp = [];
      if (status)         qp.push('status=' + encodeURIComponent(status));
      if (caterer_search) qp.push('caterer_search=' + encodeURIComponent(caterer_search));
      if (from_search)    qp.push('from_search=' + encodeURIComponent(from_search));
      if (date_from)      qp.push('date_from=' + encodeURIComponent(date_from));
      if (date_to)        qp.push('date_to=' + encodeURIComponent(date_to));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');

      if (req.headers['x-partial'] === '1') {
        const ejs = require('ejs');
        const html = await ejs.renderFile(
          path.join(req.app.get('views'), 'admin/caterer-messages/_table.ejs'),
          { enquiries, page, totalPages, per_page, queryExtra, formatDate }
        );
        return res.send(html);
      }

      res.render('admin/caterer-messages', {
        title: 'Caterer Messages',
        currentPage: 'caterer-messages',
        enquiries, total, page, totalPages, per_page,
        status, caterer_search, from_search, date_from, date_to, queryExtra, formatDate,
      });
    } catch (err) {
      console.error('Caterer messages error:', err);
      req.flash('error', 'Failed to load caterer messages.');
      res.redirect('/admin');
    }
  },

  async show(req, res) {
    try {
      const enquiry = await Enquiry.findById(req.params.id);
      if (!enquiry) { req.flash('error', 'Message not found.'); return res.redirect('/admin/caterer-messages'); }
      if (enquiry.status === 'new') await Enquiry.updateStatus(enquiry.id, 'read');
      res.render('admin/enquiries/show', {
        title: 'Caterer Message',
        currentPage: 'caterer-messages',
        enquiry, formatDate,
        backUrl: '/admin/caterer-messages',
        backLabel: 'Back to Caterer Messages',
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to load message.');
      res.redirect('/admin/caterer-messages');
    }
  },
};
