/* Enquiry Model */
const db = require('../config/database');
module.exports = {
  async findAll(filters = {}) {
    let where = 'WHERE 1=1';
    const params = [];
    if (filters.status) { where += ' AND e.status = ?'; params.push(filters.status); }
    if (filters.hasCaterer === true)  { where += ' AND e.caterer_id IS NOT NULL'; }
    if (filters.hasCaterer === false) { where += ' AND e.caterer_id IS NULL'; }
    if (filters.search) {
      where += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)';
      const s = `%${filters.search}%`; params.push(s, s, s);
    }
    if (filters.caterer_search) { where += ' AND c.business_name LIKE ?'; params.push(`%${filters.caterer_search}%`); }
    if (filters.date_from) { where += ' AND DATE(e.created_at) >= ?'; params.push(filters.date_from); }
    if (filters.date_to) { where += ' AND DATE(e.created_at) <= ?'; params.push(filters.date_to); }
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM contact_enquiries e LEFT JOIN caterers c ON e.caterer_id = c.id ${where}`, params);
    const total = countRows[0].total;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    const [enquiries] = await db.query(
      `SELECT e.*, c.business_name AS caterer_name FROM contact_enquiries e
       LEFT JOIN caterers c ON e.caterer_id = c.id ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { enquiries, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },
  async create(data) {
    const [result] = await db.query(
      'INSERT INTO contact_enquiries (first_name, last_name, email, phone, message, caterer_id) VALUES (?, ?, ?, ?, ?, ?)',
      [data.first_name, data.last_name, data.email, data.phone, data.message, data.caterer_id || null]
    );
    return result.insertId;
  },
  async findById(id) {
    const [rows] = await db.query(
      `SELECT e.*, c.business_name AS caterer_name
       FROM contact_enquiries e
       LEFT JOIN caterers c ON e.caterer_id = c.id
       WHERE e.id = ?`, [id]
    );
    return rows[0] || null;
  },
  async updateStatus(id, status) {
    await db.query('UPDATE contact_enquiries SET status = ? WHERE id = ?', [status, id]);
  },
  async getCount(status = 'new') {
    const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM contact_enquiries WHERE status = ?', [status]);
    return rows[0].cnt;
  },
};
