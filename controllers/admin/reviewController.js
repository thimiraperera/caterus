/* Admin Review Controller */
const Review  = require('../../models/Review');
const Caterer = require('../../models/Caterer');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 20, status = 'pending', rating } = req.query;
      const result = await Review.findAll({ status, rating: rating || undefined, page, limit: per_page });
      const qp = ['status=' + encodeURIComponent(status)];
      if (rating) qp.push('rating=' + rating);
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');
      res.render('admin/reviews/index', {
        title: 'Reviews', currentPage: 'reviews',
        ...result, currentStatus: status,
        per_page: parseInt(per_page) || 20, queryExtra,
        currentRating: rating || '',
      });
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
