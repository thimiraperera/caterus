/* ============================================================
   Page Controller — renders public pages with dynamic data
   ============================================================ */
const Caterer  = require('../models/Caterer');
const Menu     = require('../models/Menu');
const Review   = require('../models/Review');
const Booking  = require('../models/Booking');
const Faq      = require('../models/Faq');
const Settings = require('../models/Settings');
const { formatCurrency, formatDate } = require('../utils/helpers');

async function getSiteLogo() {
  return Settings.get('logo_path').catch(() => null);
}

module.exports = {
  /** Home page */
  async home(req, res) {
    try {
      const [{ caterers }, catererStats, faqs, siteLogo] = await Promise.all([
        Caterer.getPublished({ limit: 20 }),
        Caterer.getStats(),
        Faq.findPublished(),
        getSiteLogo(),
      ]);
      const stats = {
        totalEvents: 12000,
        totalCaterers: catererStats.activeCaterers || 150,
        satisfactionRate: 98,
        cities: 3,
      };
      res.render('index', { layout: false, caterers, stats, faqs, siteLogo: siteLogo || '', formatCurrency });
    } catch (err) {
      console.error('Home page error:', err);
      res.render('index', { layout: false, caterers: [], faqs: [], stats: { totalEvents: 12000, totalCaterers: 150, satisfactionRate: 98, cities: 3 }, siteLogo: '', formatCurrency });
    }
  },

  /** Caterer detail page */
  async caterer(req, res) {
    try {
      const caterer = await Caterer.findBySlug(req.params.slug);
      if (!caterer) return res.status(404).render('404', { layout: false, siteLogo: await getSiteLogo() || '' });

      const [menus, reviews, images, ratingDist, siteLogo] = await Promise.all([
        Menu.findByCaterer(caterer.id),
        Review.findByCaterer(caterer.id),
        Caterer.getImages(caterer.id),
        Review.getRatingDistribution(caterer.id),
        getSiteLogo(),
      ]);
      const totalReviews = Object.values(ratingDist).reduce((a, b) => a + b, 0);
      const reviewStats = {
        average: caterer.rating_avg,
        total: totalReviews,
        distribution: ratingDist,
      };

      res.render('caterer', { layout: false, caterer, menus, reviews, reviewStats, images, siteLogo: siteLogo || '', formatCurrency, formatDate });
    } catch (err) {
      console.error('Caterer page error:', err);
      res.status(500).render('404', { layout: false, siteLogo: '' });
    }
  },

  /** Booking success page */
  async bookingSuccess(req, res) {
    try {
      const sessionId = req.query.session_id;
      const [booking, siteLogo] = await Promise.all([
        sessionId ? Booking.getByStripeSession(sessionId) : null,
        getSiteLogo(),
      ]);
      res.render('booking-success', { layout: false, booking, siteLogo: siteLogo || '', formatCurrency, formatDate });
    } catch (err) {
      console.error('Booking success error:', err);
      res.render('booking-success', { layout: false, booking: null, siteLogo: '', formatCurrency, formatDate });
    }
  },

  /** 404 page */
  async notFound(req, res) {
    const siteLogo = await getSiteLogo().catch(() => null);
    res.status(404).render('404', { layout: false, siteLogo: siteLogo || '' });
  },
};
