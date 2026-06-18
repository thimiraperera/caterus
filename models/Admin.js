/* Admin Model */
const db = require('../config/database');

module.exports = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, email, name, role, first_name, last_name, phone, phone_country, profile_image, totp_enabled, created_at FROM admins WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async updatePassword(id, hash) {
    await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, id]);
  },

  async updateProfileInfo(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['first_name', 'last_name', 'email', 'phone', 'phone_country', 'profile_image'];
    allowed.forEach(f => {
      if (data[f] !== undefined) {
        fields.push(`${f} = ?`);
        values.push(data[f]);
      }
    });
    if (fields.length === 0) return;
    if (data.first_name !== undefined || data.last_name !== undefined) {
      const firstName = data.first_name || '';
      const lastName  = data.last_name  || '';
      const name = [firstName, lastName].filter(Boolean).join(' ');
      if (name) { fields.push('name = ?'); values.push(name); }
    }
    values.push(id);
    await db.query(`UPDATE admins SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async setTotpSecret(id, secret) {
    await db.query('UPDATE admins SET totp_secret = ?, totp_enabled = 0 WHERE id = ?', [secret, id]);
  },

  async enableTotp(id) {
    await db.query('UPDATE admins SET totp_enabled = 1 WHERE id = ?', [id]);
  },

  async disableTotp(id) {
    await db.query('UPDATE admins SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?', [id]);
  },

  async findAll() {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC'
    );
    return rows;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [data.name, data.email, data.password_hash, data.role || 'admin']
    );
    return result.insertId;
  },

  async deleteAdmin(id) {
    await db.query('DELETE FROM admins WHERE id = ?', [id]);
  },

  async storeResetToken(id, token, expires) {
    await db.query(
      "INSERT INTO settings (setting_key, setting_value, setting_group) VALUES (?, ?, 'admin') ON DUPLICATE KEY UPDATE setting_value = ?",
      [`admin_pwreset_${id}`, JSON.stringify({ token, expires }), JSON.stringify({ token, expires })]
    );
  },

  async findByResetToken(token) {
    const [rows] = await db.query(
      "SELECT * FROM settings WHERE setting_group='admin' AND setting_key LIKE 'admin_pwreset_%' AND setting_value LIKE ?",
      [`%"token":"${token}"%`]
    );
    if (!rows[0]) return null;
    const adminId = parseInt(rows[0].setting_key.replace('admin_pwreset_', ''));
    let tokenData;
    try { tokenData = JSON.parse(rows[0].setting_value); } catch (_) { return null; }
    const [adminRows] = await db.query('SELECT id, email, name FROM admins WHERE id = ?', [adminId]);
    if (!adminRows[0]) return null;
    return { ...adminRows[0], tokenData };
  },

  async clearResetToken(id) {
    await db.query("DELETE FROM settings WHERE setting_key = ?", [`admin_pwreset_${id}`]);
  },
};
