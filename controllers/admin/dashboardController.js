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
      const bookingStats = await Booking.getStats();
      const catererStats = await Caterer.getStats();
      const reviewStats  = await Review.getStats();
      const payoutStats  = await Payout.getStats();
      const recentBookings = await Booking.getRecent(10);
      const newEnquiries = await Enquiry.getCount('new');
      const newApplications = await Application.getCount('new');

      res.render('admin/dashboard', {
        title: 'Dashboard',
        currentPage: 'dashboard',
        bookingStats, catererStats, reviewStats, payoutStats,
        recentBookings, newEnquiries, newApplications,
        formatCurrency, formatDate,
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      req.flash('error', 'Failed to load dashboard data.');
      res.render('admin/dashboard', {
        title: 'Dashboard', currentPage: 'dashboard',
        bookingStats: {}, catererStats: {}, reviewStats: {}, payoutStats: {},
        recentBookings: [], newEnquiries: 0, newApplications: 0,
        formatCurrency, formatDate,
      });
    }
  },
};
