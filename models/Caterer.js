/* ============================================================
   Caterer Model
   ============================================================ */
const db = require('../config/database');

const Caterer = {
  /** Get published caterers for public site with filtering */
  async getPublished(filters = {}) {
    let where = "WHERE c.is_published = TRUE AND c.status = 'active'";
    const params = [];

    if (filters.search) {
      where += " AND (c.business_name LIKE ? OR c.suburb LIKE ? OR c.cuisine_type LIKE ?)";
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }
    if (filters.cuisine) {
      where += " AND c.cuisine_type LIKE ?";
      params.push(`%${filters.cuisine}%`);
    }
    if (filters.suburb) {
      where += " AND c.suburb LIKE ?";
      params.push(`%${filters.suburb}%`);
    }
    if (filters.occasion) {
      where += " AND c.id IN (SELECT caterer_id FROM caterer_occasions WHERE occasion = ?)";
      params.push(filters.occasion);
    }
    if (filters.minGuests) {
      where += " AND c.max_guests >= ?";
      params.push(parseInt(filters.minGuests));
    }
    if (filters.maxPrice) {
      where += " AND c.price_from <= ?";
      params.push(parseFloat(filters.maxPrice));
    }

    // Count
    const [countRows] = await db.query(`SELECT COUNT(DISTINCT c.id) AS total FROM caterers c ${where}`, params);
    const total = countRows[0].total;

    // Sort
    let orderBy = 'ORDER BY c.is_featured DESC, c.rating_avg DESC';
    if (filters.sort === 'price_asc') orderBy = 'ORDER BY c.price_from ASC';
    else if (filters.sort === 'price_desc') orderBy = 'ORDER BY c.price_from DESC';
    else if (filters.sort === 'rating') orderBy = 'ORDER BY c.rating_avg DESC';
    else if (filters.sort === 'reviews') orderBy = 'ORDER BY c.review_count DESC';
    else if (filters.sort === 'newest') orderBy = 'ORDER BY c.created_at DESC';

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, parseInt(filters.limit) || 20);
    const offset = (page - 1) * limit;

    const [caterers] = await db.query(
      `SELECT c.* FROM caterers c ${where} ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Load tags for each caterer
    for (const cat of caterers) {
      const [tags] = await db.query('SELECT tag FROM caterer_tags WHERE caterer_id = ?', [cat.id]);
      cat.tags = tags.map(t => t.tag);
      const [occasions] = await db.query('SELECT occasion FROM caterer_occasions WHERE caterer_id = ?', [cat.id]);
      cat.occasions = occasions.map(o => o.occasion);
    }

    return { caterers, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },

  /** Get all caterers for admin with filtering */
  async findAll(filters = {}) {
    let where = 'WHERE 1=1';
    const params = [];

    if (filters.status) {
      where += ' AND c.status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      where += ' AND (c.business_name LIKE ? OR c.suburb LIKE ? OR c.cuisine_type LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s);
    }

    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM caterers c ${where}`, params);
    const total = countRows[0].total;

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const [caterers] = await db.query(
      `SELECT c.* FROM caterers c ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { caterers, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM caterers WHERE id = ?', [id]);
    if (!rows[0]) return null;
    const cat = rows[0];
    cat.tags = (await db.query('SELECT tag FROM caterer_tags WHERE caterer_id = ?', [id]))[0].map(r => r.tag);
    cat.occasions = (await db.query('SELECT occasion FROM caterer_occasions WHERE caterer_id = ?', [id]))[0].map(r => r.occasion);
    cat.specialties = (await db.query('SELECT specialty FROM caterer_specialties WHERE caterer_id = ?', [id]))[0].map(r => r.specialty);
    cat.inclusions = (await db.query('SELECT * FROM caterer_inclusions WHERE caterer_id = ? ORDER BY sort_order', [id]))[0];
    return cat;
  },

  async findBySlug(slug) {
    const [rows] = await db.query('SELECT * FROM caterers WHERE slug = ?', [slug]);
    if (!rows[0]) return null;
    const cat = rows[0];
    const id = cat.id;
    cat.tags = (await db.query('SELECT tag FROM caterer_tags WHERE caterer_id = ?', [id]))[0].map(r => r.tag);
    cat.occasions = (await db.query('SELECT occasion FROM caterer_occasions WHERE caterer_id = ?', [id]))[0].map(r => r.occasion);
    cat.specialties = (await db.query('SELECT specialty FROM caterer_specialties WHERE caterer_id = ?', [id]))[0].map(r => r.specialty);
    cat.inclusions = (await db.query('SELECT * FROM caterer_inclusions WHERE caterer_id = ? ORDER BY sort_order', [id]))[0];
    return cat;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO caterers (slug, business_name, tagline, description, cuisine_type, suburb, city, postcode, state, contact_name, contact_email, contact_phone, abn, price_from, min_guests, max_guests, min_notice_days, response_time, featured_image, is_published, is_featured, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.slug, data.business_name, data.tagline, data.description, data.cuisine_type, data.suburb, data.city || 'Melbourne', data.postcode, data.state || 'VIC', data.contact_name, data.contact_email, data.contact_phone, data.abn, data.price_from, data.min_guests || 20, data.max_guests || 500, data.min_notice_days || 7, data.response_time || '~2 hours', data.featured_image, data.is_published ? 1 : 0, data.is_featured ? 1 : 0, data.status || 'draft']
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    const allowed = ['slug', 'business_name', 'tagline', 'description', 'cuisine_type', 'suburb', 'city', 'postcode', 'state', 'contact_name', 'contact_email', 'contact_phone', 'abn', 'price_from', 'min_guests', 'max_guests', 'min_notice_days', 'response_time', 'featured_image', 'is_published', 'is_featured', 'is_promoted', 'status'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return;
    params.push(id);
    await db.query(`UPDATE caterers SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async delete(id) {
    await db.query('DELETE FROM caterers WHERE id = ?', [id]);
  },

  /* is_unlisted=true: page stays live but gets noindex; is_published stays unchanged */
  async setUnlisted(id, unlisted) {
    await db.query('UPDATE caterers SET is_unlisted = ? WHERE id = ?', [unlisted ? 1 : 0, id]);
  },

  async updateSeo(id, data) {
    const allowed = ['meta_title', 'meta_description'];
    const fields  = [];
    const params  = [];
    for (const k of allowed) {
      if (data[k] !== undefined) { fields.push(`${k} = ?`); params.push(data[k]); }
    }
    if (fields.length === 0) return;
    params.push(id);
    await db.query(`UPDATE caterers SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async updateRating(catererId) {
    const [rows] = await db.query(
      "SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE caterer_id = ? AND status = 'approved'",
      [catererId]
    );
    const avg = Math.round(rows[0].avg_rating * 100) / 100;
    const cnt = rows[0].cnt;
    await db.query('UPDATE caterers SET rating_avg = ?, review_count = ? WHERE id = ?', [avg, cnt, catererId]);
  },

  async getImages(catererId) {
    const [rows] = await db.query('SELECT * FROM caterer_images WHERE caterer_id = ? ORDER BY sort_order', [catererId]);
    return rows;
  },

  async addImage(catererId, path, alt, sortOrder = 0) {
    const [result] = await db.query('INSERT INTO caterer_images (caterer_id, image_path, alt_text, sort_order) VALUES (?, ?, ?, ?)', [catererId, path, alt, sortOrder]);
    return result.insertId;
  },

  async deleteImage(imageId) {
    await db.query('DELETE FROM caterer_images WHERE id = ?', [imageId]);
  },

  async setTags(catererId, tags) {
    await db.query('DELETE FROM caterer_tags WHERE caterer_id = ?', [catererId]);
    if (tags && tags.length) {
      const values = tags.map(t => [catererId, t.trim()]).filter(t => t[1]);
      if (values.length) await db.query('INSERT INTO caterer_tags (caterer_id, tag) VALUES ?', [values]);
    }
  },

  async setOccasions(catererId, occasions) {
    await db.query('DELETE FROM caterer_occasions WHERE caterer_id = ?', [catererId]);
    if (occasions && occasions.length) {
      const values = occasions.map(o => [catererId, o.trim()]).filter(o => o[1]);
      if (values.length) await db.query('INSERT INTO caterer_occasions (caterer_id, occasion) VALUES ?', [values]);
    }
  },

  async setSpecialties(catererId, specialties) {
    await db.query('DELETE FROM caterer_specialties WHERE caterer_id = ?', [catererId]);
    if (specialties && specialties.length) {
      const values = specialties.map(s => [catererId, s.trim()]).filter(s => s[1]);
      if (values.length) await db.query('INSERT INTO caterer_specialties (caterer_id, specialty) VALUES ?', [values]);
    }
  },

  async setInclusions(catererId, inclusions) {
    await db.query('DELETE FROM caterer_inclusions WHERE caterer_id = ?', [catererId]);
    if (inclusions && inclusions.length) {
      const values = inclusions.filter(i => i.title).map((i, idx) => [catererId, i.title, i.description || '', idx]);
      if (values.length) await db.query('INSERT INTO caterer_inclusions (caterer_id, title, description, sort_order) VALUES ?', [values]);
    }
  },

  async getStats() {
    const [total] = await db.query('SELECT COUNT(*) AS cnt FROM caterers');
    const [active] = await db.query("SELECT COUNT(*) AS cnt FROM caterers WHERE status = 'active' AND is_published = TRUE");
    const [reviews] = await db.query("SELECT COUNT(*) AS cnt FROM reviews WHERE status = 'approved'");
    const [avgRating] = await db.query("SELECT COALESCE(AVG(rating), 0) AS avg FROM reviews WHERE status = 'approved'");
    return {
      totalCaterers: total[0].cnt,
      activeCaterers: active[0].cnt,
      totalReviews: reviews[0].cnt,
      avgRating: Math.round(avgRating[0].avg * 10) / 10,
    };
  },
};

module.exports = Caterer;
