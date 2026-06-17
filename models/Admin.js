/* Admin Model */
const db = require('../config/database');
module.exports = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    return rows[0] || null;
  },
  async findById(id) {
    const [rows] = await db.query('SELECT id, email, name, role, created_at FROM admins WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async updatePassword(id, hash) {
    await db.query('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, id]);
  },
};
