/* ============================================================
   Menu Model
   ============================================================ */
const db = require('../config/database');

const Menu = {
  async findByCaterer(catererId) {
    const [menus] = await db.query('SELECT * FROM menus WHERE caterer_id = ? AND is_active = TRUE ORDER BY sort_order', [catererId]);
    for (const menu of menus) {
      const [items] = await db.query('SELECT * FROM menu_items WHERE menu_id = ? ORDER BY sort_order', [menu.id]);
      menu.items = items;
    }
    return menus;
  },

  async findById(menuId) {
    const [rows] = await db.query('SELECT * FROM menus WHERE id = ?', [menuId]);
    if (!rows[0]) return null;
    const menu = rows[0];
    const [items] = await db.query('SELECT * FROM menu_items WHERE menu_id = ? ORDER BY sort_order', [menuId]);
    menu.items = items;
    return menu;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO menus (caterer_id, name, slug, description, price_per_head, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.caterer_id, data.name, data.slug, data.description, data.price_per_head, data.is_featured ? 1 : 0, data.sort_order || 0]
    );
    return result.insertId;
  },

  async update(id, data) {
    await db.query(
      'UPDATE menus SET name = ?, slug = ?, description = ?, price_per_head = ?, is_featured = ?, sort_order = ? WHERE id = ?',
      [data.name, data.slug, data.description, data.price_per_head, data.is_featured ? 1 : 0, data.sort_order || 0, id]
    );
  },

  async delete(id) {
    await db.query('DELETE FROM menus WHERE id = ?', [id]);
  },

  async setItems(menuId, items) {
    await db.query('DELETE FROM menu_items WHERE menu_id = ?', [menuId]);
    if (items && items.length) {
      const values = items.filter(i => i.name).map((item, idx) => [menuId, item.name, item.is_vegetarian ? 1 : 0, idx]);
      if (values.length) await db.query('INSERT INTO menu_items (menu_id, name, is_vegetarian, sort_order) VALUES ?', [values]);
    }
  },

  async getAddons(catererId) {
    const [rows] = await db.query('SELECT * FROM addons WHERE caterer_id = ? AND is_active = TRUE', [catererId]);
    return rows;
  },

  async createAddon(data) {
    const [result] = await db.query(
      'INSERT INTO addons (caterer_id, name, price_per_head, description) VALUES (?, ?, ?, ?)',
      [data.caterer_id, data.name, data.price_per_head, data.description]
    );
    return result.insertId;
  },

  async updateAddon(id, data) {
    await db.query('UPDATE addons SET name = ?, price_per_head = ?, description = ? WHERE id = ?',
      [data.name, data.price_per_head, data.description, id]);
  },

  async deleteAddon(id) {
    await db.query('UPDATE addons SET is_active = FALSE WHERE id = ?', [id]);
  },
};

module.exports = Menu;
