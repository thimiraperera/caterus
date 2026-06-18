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

  async seed(req, res) {
    try {
      const defaults = [
        { question: 'How does Caterus vet caterers?', answer: 'Every application is reviewed by our team. We verify food safety certifications, public liability insurance, ABN registration and conduct quality checks. Only approved caterers are listed.', sort_order: 1 },
        { question: 'How much does it cost?', answer: 'Searching and browsing is completely free. You only pay when you confirm a booking. The price shown is always the final price - no hidden fees, no surprise charges.', sort_order: 2 },
        { question: 'Can I customise my menu?', answer: 'Yes. When building your order you can choose menu items, add dietary requirements (vegan, gluten-free, halal etc.), select add-ons and specify delivery or setup instructions - all before you pay.', sort_order: 3 },
        { question: 'How do payments work?', answer: 'All payments are processed securely via Stripe. You pay Caterus when you book. After the event is completed, we release payment to the caterer minus our commission. This protects both parties.', sort_order: 4 },
        { question: 'What if I need to cancel?', answer: 'Cancellation policies are shown on each caterer\'s profile. Generally, 14+ days before the event receives a full refund. For emergencies, contact our support team.', sort_order: 5 },
        { question: 'Which cities do you serve?', answer: 'We currently serve Melbourne, Sydney and Brisbane. We\'re expanding to Adelaide and Perth in 2026. Enter your suburb in the search to see available caterers near you.', sort_order: 6 },
      ];
      for (const faq of defaults) {
        await Faq.create({ ...faq, is_published: 1 });
      }
      req.flash('success', 'Default FAQs imported. Edit them to customise.');
      res.redirect('/admin/faqs');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to seed FAQs.');
      res.redirect('/admin/faqs');
    }
  },
};
