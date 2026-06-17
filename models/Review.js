/* ============================================================
   Review Model
   ============================================================ */
const db = require('../config/database');

const Review = {
  async findAll(filters = {}) {
    let where = 'WHERE 1=1';
    const params = [];
    if (filters.status) { where += ' AND r.status = ?'; params.push(filters.status); }
    if (filters.caterer_id) { where += ' AND r.caterer_id = ?'; params.push(filters.caterer_id); }

    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM reviews r ${where}`, params);
    const total = countRows[0].total;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const [reviews] = await db.query(
      `SELECT r.*, c.business_name AS caterer_name FROM reviews r
       LEFT JOIN caterers c ON r.caterer_id = c.id
       ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { reviews, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },

  async findByCaterer(catererId, status = 'approved') {
    const [rows] = await db.query(
      'SELECT * FROM reviews WHERE caterer_id = ? AND status = ? ORDER BY created_at DESC', [catererId, status]);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT r.*, c.business_name AS caterer_name FROM reviews r LEFT JOIN caterers c ON r.caterer_id = c.id WHERE r.id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO reviews (caterer_id, booking_id, reviewer_name, reviewer_initials, event_type, event_date, rating, comment, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.caterer_id, data.booking_id || null, data.reviewer_name, data.reviewer_initials, data.event_type, data.event_date, data.rating, data.comment, 'pending']
    );
    return result.insertId;
  },

  async updateStatus(id, status) {
    await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id) {
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
  },

  async getRatingDistribution(catererId) {
    const [rows] = await db.query(
      "SELECT rating, COUNT(*) AS cnt FROM reviews WHERE caterer_id = ? AND status = 'approved' GROUP BY rating ORDER BY rating DESC",
      [catererId]
    );
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    rows.forEach(r => { dist[r.rating] = r.cnt; });
    return dist;
  },

  async getStats() {
    const [total] = await db.query('SELECT COUNT(*) AS cnt FROM reviews');
    const [pending] = await db.query("SELECT COUNT(*) AS cnt FROM reviews WHERE status = 'pending'");
    const [approved] = await db.query("SELECT COUNT(*) AS cnt FROM reviews WHERE status = 'approved'");
    return { total: total[0].cnt, pending: pending[0].cnt, approved: approved[0].cnt };
  },
};

module.exports = Review;
