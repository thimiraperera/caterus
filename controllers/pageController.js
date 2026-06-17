/* ============================================================
   Page Controller — renders public pages with dynamic data
   ============================================================ */
const Caterer = require('../models/Caterer');
const Menu    = require('../models/Menu');
const Review  = require('../models/Review');
const Booking = require('../models/Booking');
const { formatCurrency, formatDate } = require('../utils/helpers');

module.exports = {
  /** Home page */
  async home(req, res) {
    try {
      const { caterers } = await Caterer.getPublished({ limit: 20 });
      const catererStats = await Caterer.getStats();
      const stats = {
        totalEvents: 12000,
        totalCaterers: catererStats.activeCaterers || 150,
        satisfactionRate: 98,
        cities: 3,
      };
      res.render('index', { layout: false, caterers, stats, formatCurrency });
    } catch (err) {
      console.error('Home page error:', err);
      res.render('index', { layout: false, caterers: [], stats: { totalEvents: 12000, totalCaterers: 150, satisfactionRate: 98, cities: 3 }, formatCurrency });
    }
  },

  /** Caterer detail page */
  async caterer(req, res) {
    try {
      const caterer = await Caterer.findBySlug(req.params.slug);
      if (!caterer) return res.status(404).render('404', { layout: false });

      const menus   = await Menu.findByCaterer(caterer.id);
      const reviews = await Review.findByCaterer(caterer.id);
      const images  = await Caterer.getImages(caterer.id);
      const ratingDist = await Review.getRatingDistribution(caterer.id);
      const totalReviews = Object.values(ratingDist).reduce((a, b) => a + b, 0);
      const reviewStats = {
        average: caterer.rating_avg,
        total: totalReviews,
        distribution: ratingDist,
      };

      res.render('caterer', { layout: false, caterer, menus, reviews, reviewStats, images, formatCurrency, formatDate });
    } catch (err) {
      console.error('Caterer page error:', err);
      res.status(500).render('404', { layout: false });
    }
  },

  /** Booking success page */
  async bookingSuccess(req, res) {
    try {
      const sessionId = req.query.session_id;
      let booking = null;
      if (sessionId) {
        booking = await Booking.getByStripeSession(sessionId);
      }
      res.render('booking-success', { layout: false, booking, formatCurrency, formatDate });
    } catch (err) {
      console.error('Booking success error:', err);
      res.render('booking-success', { layout: false, booking: null, formatCurrency, formatDate });
    }
  },

  /** 404 page */
  notFound(req, res) {
    res.status(404).render('404', { layout: false });
  },
};
