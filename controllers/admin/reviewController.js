/* Admin Review Controller */
const Review  = require('../../models/Review');
const Caterer = require('../../models/Caterer');

module.exports = {
  async index(req, res) {
    try {
      const result = await Review.findAll({ status: req.query.status || 'pending', page: req.query.page });
      res.render('admin/reviews/index', { title: 'Reviews', currentPage: 'reviews', ...result, currentStatus: req.query.status || 'pending' });
    } catch (err) { console.error(err); req.flash('error', 'Failed to load reviews.'); res.redirect('/admin'); }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const review = await Review.findById(req.params.id);
      await Review.updateStatus(req.params.id, status);
      if (review) await Caterer.updateRating(review.caterer_id);
      req.flash('success', `Review ${status}.`);
      res.redirect('/admin/reviews');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update review.'); res.redirect('/admin/reviews'); }
  },
};
