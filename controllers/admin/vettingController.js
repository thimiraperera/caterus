/* Admin Vetting Controller */
const Vetting = require('../../models/Vetting');
const Caterer = require('../../models/Caterer');

module.exports = {
  async show(req, res) {
    try {
      const caterer = await Caterer.findById(req.params.id);
      if (!caterer) { req.flash('error', 'Caterer not found.'); return res.redirect('/admin/caterers'); }
      const vetting = await Vetting.findByCaterer(req.params.id);
      res.render('admin/caterers/vetting', { title: `Vetting: ${caterer.business_name}`, currentPage: 'caterers', caterer, vetting });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load vetting.'); res.redirect('/admin/caterers'); }
  },

  async update(req, res) {
    try {
      const data = req.body;
      data.food_safety_cert = data.food_safety_cert === 'on';
      data.public_liability = data.public_liability === 'on';
      data.abn_verified = data.abn_verified === 'on';
      data.quality_check = data.quality_check === 'on';
      if (data.food_safety_cert && data.public_liability && data.abn_verified) {
        data.approved_by = req.session.adminId;
        data.approved_at = new Date();
      }
      await Vetting.upsert(req.params.id, data);
      req.flash('success', 'Vetting checklist updated!');
      res.redirect(`/admin/caterers/${req.params.id}/vetting`);
    } catch (err) { console.error(err); req.flash('error', 'Failed to update vetting.'); res.redirect(`/admin/caterers/${req.params.id}/vetting`); }
  },
};
