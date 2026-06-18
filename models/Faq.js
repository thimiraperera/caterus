/* FAQ Model */
const db = require('../config/database');

const Faq = {
  async findAll() {
    const [rows] = await db.query('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC');
    return rows;
  },

  async findPublished() {
    const [rows] = await db.query('SELECT * FROM faqs WHERE is_published = 1 ORDER BY sort_order ASC, id ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM faqs WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      'INSERT INTO faqs (question, answer, sort_order, is_published) VALUES (?, ?, ?, ?)',
      [data.question, data.answer, parseInt(data.sort_order) || 0, data.is_published ? 1 : 0]
    );
    return result.insertId;
  },

  async update(id, data) {
    await db.query(
      'UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_published = ? WHERE id = ?',
      [data.question, data.answer, parseInt(data.sort_order) || 0, data.is_published ? 1 : 0, id]
    );
  },

  async destroy(id) {
    await db.query('DELETE FROM faqs WHERE id = ?', [id]);
  },
};

module.exports = Faq;
