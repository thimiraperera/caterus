/* ============================================================
   Booking Model
   ============================================================ */
const db = require('../config/database');
const { generateReference } = require('../utils/helpers');

const Booking = {
  async findAll(filters = {}) {
    let where = 'WHERE 1=1';
    const params = [];

    if (filters.status) { where += ' AND b.status = ?'; params.push(filters.status); }
    if (filters.payment_status) { where += ' AND b.payment_status = ?'; params.push(filters.payment_status); }
    if (filters.search) {
      where += ' AND (b.reference LIKE ? OR b.customer_first_name LIKE ? OR b.customer_last_name LIKE ? OR b.customer_email LIKE ?)';
      const s = `%${filters.search}%`; params.push(s, s, s, s);
    }
    if (filters.caterer_search) { where += ' AND c.business_name LIKE ?'; params.push(`%${filters.caterer_search}%`); }
    if (filters.date_from) { where += ' AND b.event_date >= ?'; params.push(filters.date_from); }
    if (filters.date_to) { where += ' AND b.event_date <= ?'; params.push(filters.date_to); }
    if (filters.total_min != null && filters.total_min !== '') { where += ' AND b.total >= ?'; params.push(parseFloat(filters.total_min)); }
    if (filters.total_max != null && filters.total_max !== '') { where += ' AND b.total <= ?'; params.push(parseFloat(filters.total_max)); }
    if (filters.guest_min != null && filters.guest_min !== '') { where += ' AND b.guest_count >= ?'; params.push(parseInt(filters.guest_min)); }
    if (filters.guest_max != null && filters.guest_max !== '') { where += ' AND b.guest_count <= ?'; params.push(parseInt(filters.guest_max)); }

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM bookings b LEFT JOIN caterers c ON b.caterer_id = c.id ${where}`, params);
    const total = countRows[0].total;
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const [bookings] = await db.query(
      `SELECT b.*, c.business_name AS caterer_name, m.name AS menu_name
       FROM bookings b
       LEFT JOIN caterers c ON b.caterer_id = c.id
       LEFT JOIN menus m ON b.menu_id = m.id
       ${where} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { bookings, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT b.*, c.business_name AS caterer_name, c.contact_email AS caterer_email, m.name AS menu_name
       FROM bookings b LEFT JOIN caterers c ON b.caterer_id = c.id LEFT JOIN menus m ON b.menu_id = m.id WHERE b.id = ?`, [id]);
    if (!rows[0]) return null;
    const booking = rows[0];
    const [addons] = await db.query('SELECT * FROM booking_addons WHERE booking_id = ?', [id]);
    booking.addons = addons;
    return booking;
  },

  async findByReference(ref) {
    const [rows] = await db.query('SELECT * FROM bookings WHERE reference = ?', [ref]);
    return rows[0] || null;
  },

  async getByStripeSession(sessionId) {
    const [rows] = await db.query(
      `SELECT b.*, c.business_name AS caterer_name, m.name AS menu_name
       FROM bookings b LEFT JOIN caterers c ON b.caterer_id = c.id LEFT JOIN menus m ON b.menu_id = m.id
       WHERE b.stripe_session_id = ?`, [sessionId]);
    return rows[0] || null;
  },

  async create(data) {
    const reference = generateReference();
    const [result] = await db.query(
      `INSERT INTO bookings (reference, caterer_id, menu_id, customer_first_name, customer_last_name, customer_email, customer_phone, event_date, guest_count, price_per_head, addons_total, subtotal, gst, total, commission_rate, commission_amount, caterer_payout, dietary_requirements, special_requests, status, payment_status, stripe_session_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference, data.caterer_id, data.menu_id, data.customer_first_name, data.customer_last_name, data.customer_email, data.customer_phone, data.event_date, data.guest_count, data.price_per_head, data.addons_total || 0, data.subtotal, data.gst, data.total, data.commission_rate, data.commission_amount, data.caterer_payout, data.dietary_requirements, data.special_requests, 'pending', 'unpaid', data.stripe_session_id]
    );
    return { id: result.insertId, reference };
  },

  async updateStatus(id, status) {
    const timestamps = {};
    if (status === 'confirmed') timestamps.confirmed_at = new Date();
    if (status === 'completed') timestamps.completed_at = new Date();
    if (status === 'cancelled') timestamps.cancelled_at = new Date();

    let sql = 'UPDATE bookings SET status = ?';
    const params = [status];
    for (const [key, val] of Object.entries(timestamps)) {
      sql += `, ${key} = ?`; params.push(val);
    }
    sql += ' WHERE id = ?'; params.push(id);
    await db.query(sql, params);
  },

  async updatePaymentStatus(id, paymentStatus, stripeData = {}) {
    let sql = 'UPDATE bookings SET payment_status = ?';
    const params = [paymentStatus];
    if (stripeData.payment_intent) { sql += ', stripe_payment_intent = ?'; params.push(stripeData.payment_intent); }
    sql += ' WHERE id = ?'; params.push(id);
    await db.query(sql, params);
  },

  async update(id, data) {
    const fields = []; const params = [];
    const allowed = ['admin_notes', 'status', 'cancellation_reason'];
    for (const key of allowed) {
      if (data[key] !== undefined) { fields.push(`${key} = ?`); params.push(data[key]); }
    }
    if (!fields.length) return;
    params.push(id);
    await db.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async getRecent(limit = 10) {
    const [rows] = await db.query(
      `SELECT b.*, c.business_name AS caterer_name FROM bookings b
       LEFT JOIN caterers c ON b.caterer_id = c.id ORDER BY b.created_at DESC LIMIT ?`, [limit]);
    return rows;
  },

  async getStats() {
    const [total] = await db.query('SELECT COUNT(*) AS cnt FROM bookings');
    const [byStatus] = await db.query('SELECT status, COUNT(*) AS cnt FROM bookings GROUP BY status');
    const [revenue] = await db.query("SELECT COALESCE(SUM(total), 0) AS total_revenue FROM bookings WHERE payment_status = 'paid'");
    const [monthly] = await db.query("SELECT COALESCE(SUM(total), 0) AS monthly_revenue, COUNT(*) AS monthly_count FROM bookings WHERE payment_status = 'paid' AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())");
    const statusMap = {};
    byStatus.forEach(r => { statusMap[r.status] = r.cnt; });
    return {
      totalBookings: total[0].cnt,
      byStatus: statusMap,
      totalRevenue: revenue[0].total_revenue,
      monthlyRevenue: monthly[0].monthly_revenue,
      monthlyCount: monthly[0].monthly_count,
    };
  },
};

module.exports = Booking;
