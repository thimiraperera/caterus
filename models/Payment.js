/* Payment Model */
const db = require('../config/database');
module.exports = {
  async create(data) {
    const [result] = await db.query(
      'INSERT INTO payments (booking_id, stripe_payment_intent, amount, currency, status, method, receipt_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.booking_id, data.stripe_payment_intent, data.amount, data.currency || 'aud', data.status, data.method || 'card', data.receipt_url]
    );
    return result.insertId;
  },
  async findByBooking(bookingId) {
    const [rows] = await db.query('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC', [bookingId]);
    return rows;
  },
};
