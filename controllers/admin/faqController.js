/* Admin FAQ Controller */
const Faq = require('../../models/Faq');

module.exports = {
  async index(req, res) {
    try {
      const faqs = await Faq.findAll();
      res.render('admin/faqs/index', { title: 'FAQs', currentPage: 'faqs', faqs });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to load FAQs.');
      res.redirect('/admin');
    }
  },

  create(req, res) {
    res.render('admin/faqs/form', { title: 'New FAQ', currentPage: 'faqs', faq: null });
  },

  async store(req, res) {
    try {
      const { question, answer, sort_order, is_published } = req.body;
      if (!question || !answer) {
        req.flash('error', 'Question and answer are required.');
        return res.redirect('/admin/faqs/create');
      }
      await Faq.create({ question, answer, sort_order, is_published });
      req.flash('success', 'FAQ added.');
      res.redirect('/admin/faqs');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to create FAQ.');
      res.redirect('/admin/faqs/create');
    }
  },

  async edit(req, res) {
    try {
      const faq = await Faq.findById(req.params.id);
      if (!faq) { req.flash('error', 'FAQ not found.'); return res.redirect('/admin/faqs'); }
      res.render('admin/faqs/form', { title: 'Edit FAQ', currentPage: 'faqs', faq });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to load FAQ.');
      res.redirect('/admin/faqs');
    }
  },

  async update(req, res) {
    try {
      const { question, answer, sort_order, is_published } = req.body;
      if (!question || !answer) {
        req.flash('error', 'Question and answer are required.');
        return res.redirect(`/admin/faqs/${req.params.id}/edit`);
      }
      await Faq.update(req.params.id, { question, answer, sort_order, is_published });
      req.flash('success', 'FAQ updated.');
      res.redirect('/admin/faqs');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to update FAQ.');
      res.redirect(`/admin/faqs/${req.params.id}/edit`);
    }
  },

  async destroy(req, res) {
    try {
      await Faq.destroy(req.params.id);
      req.flash('success', 'FAQ deleted.');
      res.redirect('/admin/faqs');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to delete FAQ.');
      res.redirect('/admin/faqs');
    }
  },
};
