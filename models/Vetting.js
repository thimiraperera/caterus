/* Vetting Model */
const db = require('../config/database');
module.exports = {
  async findByCaterer(catererId) {
    const [rows] = await db.query('SELECT v.*, a.name AS approved_by_name FROM vetting_checklists v LEFT JOIN admins a ON v.approved_by = a.id WHERE v.caterer_id = ?', [catererId]);
    return rows[0] || null;
  },
  async upsert(catererId, data) {
    const existing = await this.findByCaterer(catererId);
    if (existing) {
      await db.query(
        `UPDATE vetting_checklists SET food_safety_cert = ?, food_safety_expiry = ?, public_liability = ?, liability_amount = ?, liability_expiry = ?, abn_verified = ?, quality_check = ?, quality_notes = ?, approved_by = ?, approved_at = ? WHERE caterer_id = ?`,
        [data.food_safety_cert ? 1 : 0, data.food_safety_expiry || null, data.public_liability ? 1 : 0, data.liability_amount, data.liability_expiry || null, data.abn_verified ? 1 : 0, data.quality_check ? 1 : 0, data.quality_notes, data.approved_by, data.approved_at || null, catererId]
      );
    } else {
      await db.query(
        `INSERT INTO vetting_checklists (caterer_id, food_safety_cert, food_safety_expiry, public_liability, liability_amount, liability_expiry, abn_verified, quality_check, quality_notes, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [catererId, data.food_safety_cert ? 1 : 0, data.food_safety_expiry || null, data.public_liability ? 1 : 0, data.liability_amount, data.liability_expiry || null, data.abn_verified ? 1 : 0, data.quality_check ? 1 : 0, data.quality_notes, data.approved_by, data.approved_at || null]
      );
    }
  },
};
