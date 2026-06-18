/* Payout Model */
const db = require('../config/database');
module.exports = {
  async findAll(filters = {}) {
    let where = 'WHERE 1=1';
    const params = [];
    if (filters.status) { where += ' AND p.status = ?'; params.push(filters.status); }
    if (filters.caterer_search) { where += ' AND c.business_name LIKE ?'; params.push(`%${filters.caterer_search}%`); }
    if (filters.booking_search) { where += ' AND b.reference LIKE ?'; params.push(`%${filters.booking_search}%`); }
    if (filters.amount_min != null && filters.amount_min !== '') { where += ' AND p.amount >= ?'; params.push(parseFloat(filters.amount_min)); }
    if (filters.amount_max != null && filters.amount_max !== '') { where += ' AND p.amount <= ?'; params.push(parseFloat(filters.amount_max)); }
    if (filters.date_from) { where += ' AND DATE(p.created_at) >= ?'; params.push(filters.date_from); }
    if (filters.date_to) { where += ' AND DATE(p.created_at) <= ?'; params.push(filters.date_to); }
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM payouts p LEFT JOIN caterers c ON p.caterer_id = c.id LEFT JOIN bookings b ON p.booking_id = b.id ${where}`, params);
    const total = countRows[0].total;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    const [payouts] = await db.query(
      `SELECT p.*, c.business_name AS caterer_name, b.reference AS booking_reference
       FROM payouts p LEFT JOIN caterers c ON p.caterer_id = c.id LEFT JOIN bookings b ON p.booking_id = b.id
       ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { payouts, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },
  async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.business_name AS caterer_name FROM payouts p LEFT JOIN caterers c ON p.caterer_id = c.id WHERE p.id = ?`, [id]);
    return rows[0] || null;
  },
  async create(data) {
    const [result] = await db.query(
      'INSERT INTO payouts (caterer_id, booking_id, amount, status, payout_date, reference, notes, processed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.caterer_id, data.booking_id, data.amount, data.status || 'pending', data.payout_date, data.reference, data.notes, data.processed_by]
    );
    return result.insertId;
  },
  async updateStatus(id, status, processedBy) {
    await db.query('UPDATE payouts SET status = ?, processed_by = ? WHERE id = ?', [status, processedBy, id]);
  },
  async getStats() {
    const [pending] = await db.query("SELECT COALESCE(SUM(amount), 0) AS total FROM payouts WHERE status = 'pending'");
    const [completed] = await db.query("SELECT COALESCE(SUM(amount), 0) AS total FROM payouts WHERE status = 'completed'");
    const [monthly] = await db.query("SELECT COALESCE(SUM(amount), 0) AS total FROM payouts WHERE status = 'completed' AND MONTH(created_at) = MONTH(NOW())");
    return { pendingTotal: pending[0].total, completedTotal: completed[0].total, monthlyTotal: monthly[0].total };
  },
};
