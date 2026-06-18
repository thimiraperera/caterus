/* Admin Dashboard Controller */
const path = require('path');
const ejs  = require('ejs');
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
      const { page = 1, per_page = 10, search, caterer_search, date_from, date_to, total_min, total_max, status } = req.query;
      const [bookingStats, catererStats, reviewStats, payoutStats, bookingsResult, newEnquiries, newApplications] = await Promise.all([
        Booking.getStats(),
        Caterer.getStats(),
        Review.getStats(),
        Payout.getStats(),
        Booking.findAll({ page, limit: per_page, search, caterer_search, date_from, date_to, total_min, total_max, status }),
        Enquiry.getCount('new'),
        Application.getCount('new'),
      ]);

      const qp = [];
      if (search) qp.push('search=' + encodeURIComponent(search));
      if (caterer_search) qp.push('caterer_search=' + encodeURIComponent(caterer_search));
      if (date_from) qp.push('date_from=' + encodeURIComponent(date_from));
      if (date_to) qp.push('date_to=' + encodeURIComponent(date_to));
      if (total_min) qp.push('total_min=' + total_min);
      if (total_max) qp.push('total_max=' + total_max);
      if (status)  qp.push('status=' + encodeURIComponent(status));
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');

      const tplVars = {
        bookings: bookingsResult.bookings,
        bookingPage: bookingsResult.page,
        bookingTotalPages: bookingsResult.totalPages,
        per_page: parseInt(per_page) || 10,
        queryExtra, formatCurrency, formatDate,
      };

      if (req.headers['x-partial'] === '1') {
        const html = await ejs.renderFile(
          path.join(req.app.get('views'), 'admin/dashboard/_bookings.ejs'), tplVars);
        return res.send(html);
      }

      res.render('admin/dashboard', {
        title: 'Dashboard', currentPage: 'dashboard',
        bookingStats, catererStats, reviewStats, payoutStats,
        ...tplVars,
        newEnquiries, newApplications,
        dfSearch: search || '', dfCaterer: caterer_search || '',
        dfDateFrom: date_from || '', dfDateTo: date_to || '',
        dfTotalMin: total_min || '', dfTotalMax: total_max || '',
        dfStatus: status || '',
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      req.flash('error', 'Failed to load dashboard data.');
      res.render('admin/dashboard', {
        title: 'Dashboard', currentPage: 'dashboard',
        bookingStats: {}, catererStats: {}, reviewStats: {}, payoutStats: {},
        bookings: [], bookingPage: 1, bookingTotalPages: 1,
        newEnquiries: 0, newApplications: 0,
        per_page: 10, queryExtra: 'per_page=10',
        formatCurrency, formatDate,
        dfSearch: '', dfCaterer: '', dfDateFrom: '', dfDateTo: '', dfTotalMin: '', dfTotalMax: '', dfStatus: '',
      });
    }
  },
};
