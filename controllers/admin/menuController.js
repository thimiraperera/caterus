/* Admin Menu Controller */
const Menu    = require('../../models/Menu');
const Caterer = require('../../models/Caterer');
const { slugify } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const caterer = await Caterer.findById(req.params.id);
      if (!caterer) { req.flash('error', 'Caterer not found.'); return res.redirect('/admin/caterers'); }
      const menus = await Menu.findByCaterer(caterer.id);
      const addons = await Menu.getAddons(caterer.id);
      res.render('admin/menus/index', { title: `Menus: ${caterer.business_name}`, currentPage: 'caterers', caterer, menus, addons });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load menus.'); res.redirect('/admin/caterers'); }
  },

  async store(req, res) {
    try {
      const data = req.body;
      data.caterer_id = req.params.id;
      data.slug = slugify(data.name);
      data.is_featured = data.is_featured === 'on';
      const menuId = await Menu.create(data);
      if (data.item_names) {
        const names = Array.isArray(data.item_names) ? data.item_names : [data.item_names];
        const vegetarian = Array.isArray(data.item_vegetarian) ? data.item_vegetarian : [data.item_vegetarian || ''];
        const items = names.filter(n => n).map((name, i) => ({ name, is_vegetarian: vegetarian[i] === 'on' }));
        await Menu.setItems(menuId, items);
      }
      req.flash('success', 'Menu created!');
      res.redirect(`/admin/caterers/${req.params.id}/menus`);
    } catch (err) { console.error(err); req.flash('error', 'Failed to create menu.'); res.redirect(`/admin/caterers/${req.params.id}/menus`); }
  },

  async update(req, res) {
    try {
      const data = req.body;
      data.slug = slugify(data.name);
      data.is_featured = data.is_featured === 'on';
      await Menu.update(req.params.id, data);
      if (data.item_names) {
        const names = Array.isArray(data.item_names) ? data.item_names : [data.item_names];
        const items = names.filter(n => n).map(name => ({ name, is_vegetarian: false }));
        await Menu.setItems(req.params.id, items);
      }
      req.flash('success', 'Menu updated!');
      res.redirect('back');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update menu.'); res.redirect('back'); }
  },

  async destroy(req, res) {
    try {
      const menu = await Menu.findById(req.params.id);
      await Menu.delete(req.params.id);
      req.flash('success', 'Menu deleted.');
      res.redirect('back');
    } catch (err) { console.error(err); req.flash('error', 'Failed to delete menu.'); res.redirect('back'); }
  },
};
