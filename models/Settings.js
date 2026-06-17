/* Settings Model */
const db = require('../config/database');
module.exports = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return settings;
  },
  async getByGroup(group) {
    const [rows] = await db.query('SELECT * FROM settings WHERE setting_group = ?', [group]);
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return settings;
  },
  async get(key) {
    const [rows] = await db.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    return rows[0] ? rows[0].setting_value : null;
  },
  async set(key, value, group) {
    await db.query(
      'INSERT INTO settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()',
      [key, value, group, value]
    );
  },
  async setMultiple(settings, group) {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value, group);
    }
  },
};
