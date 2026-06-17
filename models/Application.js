/* Application Model */
const db = require('../config/database');
module.exports = {
  async findAll(filters = {}) {
    let where = 'WHERE 1=1';
    const params = [];
    if (filters.status) { where += ' AND status = ?'; params.push(filters.status); }
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM caterer_applications ${where}`, params);
    const total = countRows[0].total;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    const [applications] = await db.query(
      `SELECT * FROM caterer_applications ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { applications, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },
  async create(data) {
    const [result] = await db.query(
      'INSERT INTO caterer_applications (business_name, contact_name, email, phone, cuisine, service_area) VALUES (?, ?, ?, ?, ?, ?)',
      [data.business_name, data.contact_name, data.email, data.phone, data.cuisine, data.service_area]
    );
    return result.insertId;
  },
  async updateStatus(id, status, notes) {
    await db.query('UPDATE caterer_applications SET status = ?, admin_notes = ? WHERE id = ?', [status, notes, id]);
  },
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM caterer_applications WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async getCount(status = 'new') {
    const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM caterer_applications WHERE status = ?', [status]);
    return rows[0].cnt;
  },
};
