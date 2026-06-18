/* ============================================================
   Page Controller — renders public pages with dynamic data
   ============================================================ */
const Caterer  = require('../models/Caterer');
const Menu     = require('../models/Menu');
const Review   = require('../models/Review');
const Booking  = require('../models/Booking');
const Faq      = require('../models/Faq');
const Settings = require('../models/Settings');
const db       = require('../config/database');
const { formatCurrency, formatDate } = require('../utils/helpers');

async function getSiteLogo() {
  return Settings.get('logo_path').catch(() => null);
}

/** Load footer data: logo, contact info, social links, tagline */
async function getFooterData() {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_group IN ('general','contact')"
    );
    const s = {};
    rows.forEach(r => { s[r.setting_key] = r.setting_value; });
    let socialLinks = [];
    try { socialLinks = JSON.parse(s.social_links || '[]'); } catch (_) {}
    return {
      siteLogo:        s.logo_path         || '',
      contactEmail:    s.contact_email     || '',
      contactPhone:    s.contact_phone     || '',
      contactPhoneCountry: s.contact_phone_country || '',
      footerTagline:   s.footer_tagline    || 'Caterus Pty Ltd · Melbourne, Victoria, Australia',
      socialLinks,
    };
  } catch { return { siteLogo: '', contactEmail: '', contactPhone: '', contactPhoneCountry: '', footerTagline: 'Caterus Pty Ltd · Melbourne, Victoria, Australia', socialLinks: [] }; }
}

const SOCIAL_ICONS = {
  facebook:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
  instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  linkedin:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  twitter:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  youtube:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>',
  tiktok:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>',
  pinterest: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>',
};

module.exports = {
  /** Home page */
  async home(req, res) {
    try {
      const [{ caterers, total: catTotal }, catererStats, faqs, footerData, occasionsRaw] = await Promise.all([
        Caterer.getPublished({ limit: 9, sort: 'reviews' }),
        Caterer.getStats(),
        Faq.findPublished(),
        getFooterData(),
        Settings.get('occasions_list').catch(() => null),
      ]);
      const stats = {
        totalEvents: 12000,
        totalCaterers: catererStats.activeCaterers || 150,
        satisfactionRate: 98,
        cities: 3,
      };
      let occasions = [];
      try { occasions = occasionsRaw ? JSON.parse(occasionsRaw) : []; } catch (_) {}
      occasions = occasions.map(o => typeof o === 'string' ? o : o.name);
      if (!occasions.length) occasions = ['Wedding', 'Corporate', 'Birthday', 'Christmas', 'Conference', 'Cocktail Party', 'Gala Dinner', 'School Event'];
      res.render('index', { layout: false, caterers, catTotal, stats, faqs, occasions, ...footerData, formatCurrency, SOCIAL_ICONS });
    } catch (err) {
      console.error('Home page error:', err);
      res.render('index', { layout: false, caterers: [], catTotal: 0, faqs: [], occasions: [], stats: { totalEvents: 12000, totalCaterers: 150, satisfactionRate: 98, cities: 3 }, siteLogo: '', contactEmail: '', contactPhone: '', contactPhoneCountry: '', footerTagline: 'Caterus Pty Ltd · Melbourne, Victoria, Australia', socialLinks: [], formatCurrency, SOCIAL_ICONS });
    }
  },

  /** Caterer detail page */
  async caterer(req, res) {
    try {
      const caterer = await Caterer.findBySlug(req.params.slug);
      if (!caterer) {
        const fd = await getFooterData();
        return res.status(404).render('404', { layout: false, ...fd, SOCIAL_ICONS });
      }

      const [menus, reviews, images, ratingDist, footerData] = await Promise.all([
        Menu.findByCaterer(caterer.id),
        Review.findByCaterer(caterer.id),
        Caterer.getImages(caterer.id),
        Review.getRatingDistribution(caterer.id),
        getFooterData(),
      ]);
      const totalReviews = Object.values(ratingDist).reduce((a, b) => a + b, 0);
      const reviewStats = {
        average: caterer.rating_avg,
        total: totalReviews,
        distribution: ratingDist,
      };

      res.render('caterer', { layout: false, caterer, menus, reviews, reviewStats, images, ...footerData, formatCurrency, formatDate, SOCIAL_ICONS });
    } catch (err) {
      console.error('Caterer page error:', err);
      res.status(500).render('404', { layout: false, siteLogo: '', contactEmail: '', contactPhone: '', contactPhoneCountry: '', footerTagline: 'Caterus Pty Ltd · Melbourne, Victoria, Australia', socialLinks: [], SOCIAL_ICONS });
    }
  },

  /** Booking success page */
  async bookingSuccess(req, res) {
    try {
      const sessionId = req.query.session_id;
      const [booking, footerData] = await Promise.all([
        sessionId ? Booking.getByStripeSession(sessionId) : null,
        getFooterData(),
      ]);
      res.render('booking-success', { layout: false, booking, ...footerData, formatCurrency, formatDate, SOCIAL_ICONS });
    } catch (err) {
      console.error('Booking success error:', err);
      res.render('booking-success', { layout: false, booking: null, siteLogo: '', contactEmail: '', contactPhone: '', contactPhoneCountry: '', footerTagline: 'Caterus Pty Ltd · Melbourne, Victoria, Australia', socialLinks: [], formatCurrency, formatDate, SOCIAL_ICONS });
    }
  },

  /** Caterers listing page */
  async caterersList(req, res) {
    try {
      const { occasion, suburb, cuisine, guests, max_price, sort, page = 1 } = req.query;
      const [result, footerData] = await Promise.all([
        Caterer.getPublished({ occasion, suburb, cuisine, minGuests: guests, maxPrice: max_price, sort, page, limit: 24 }),
        getFooterData(),
      ]);
      res.render('caterers', { layout: false, ...result, ...footerData, query: req.query, formatCurrency, SOCIAL_ICONS });
    } catch (err) {
      console.error('Caterers list error:', err);
      res.status(500).render('404', { layout: false, siteLogo: '', contactEmail: '', contactPhone: '', contactPhoneCountry: '', footerTagline: 'Caterus Pty Ltd · Melbourne, Victoria, Australia', socialLinks: [], SOCIAL_ICONS });
    }
  },

  /** 404 page */
  async notFound(req, res) {
    const footerData = await getFooterData().catch(() => ({ siteLogo: '', contactEmail: '', contactPhone: '', contactPhoneCountry: '', footerTagline: 'Caterus Pty Ltd · Melbourne, Victoria, Australia', socialLinks: [] }));
    res.status(404).render('404', { layout: false, ...footerData, SOCIAL_ICONS });
  },
};
