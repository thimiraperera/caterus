/* Admin Dashboard Controller */
const Booking = require('../../models/Booking');
const Caterer = require('../../models/Caterer');
const Review  = require('../../models/Review');
const Payout  = require('../../models/Payout');
const Enquiry = require('../../models/Enquiry');
const Application = require('../../models/Application');
const { formatCurrency, formatDate } = require('../../utils/helpers');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 10 } = req.query;
      const [bookingStats, catererStats, reviewStats, payoutStats, bookingsResult, newEnquiries, newApplications] = await Promise.all([
        Booking.getStats(),
        Caterer.getStats(),
        Review.getStats(),
        Payout.getStats(),
        Booking.findAll({ page, limit: per_page }),
        Enquiry.getCount('new'),
        Application.getCount('new'),
      ]);
      const queryExtra = 'per_page=' + per_page;

      res.render('admin/dashboard', {
        title: 'Dashboard',
        currentPage: 'dashboard',
        bookingStats, catererStats, reviewStats, payoutStats,
        recentBookings: bookingsResult.bookings,
        bookingPage: bookingsResult.page,
        bookingTotalPages: bookingsResult.totalPages,
        newEnquiries, newApplications,
        per_page: parseInt(per_page) || 10, queryExtra,
        formatCurrency, formatDate,
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      req.flash('error', 'Failed to load dashboard data.');
      res.render('admin/dashboard', {
        title: 'Dashboard', currentPage: 'dashboard',
        bookingStats: {}, catererStats: {}, reviewStats: {}, payoutStats: {},
        recentBookings: [], bookingPage: 1, bookingTotalPages: 1,
        newEnquiries: 0, newApplications: 0,
        per_page: 10, queryExtra: 'per_page=10',
        formatCurrency, formatDate,
      });
    }
  },
};
