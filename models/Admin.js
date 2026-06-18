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
};
