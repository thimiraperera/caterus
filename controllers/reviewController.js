/* Review Controller — public submission */
const Review  = require('../models/Review');
const { generateInitials } = require('../utils/helpers');

module.exports = {
  async create(req, res) {
    try {
      const { caterer_id, reviewer_name, event_type, event_date, rating, comment } = req.body;
      if (!caterer_id || !reviewer_name || !rating || !comment) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
      }
      const reviewer_initials = generateInitials(reviewer_name);
      await Review.create({ caterer_id, reviewer_name, reviewer_initials, event_type, event_date, rating: parseInt(rating), comment });
      res.json({ success: true, message: 'Thank you! Your review has been submitted and is pending approval.' });
    } catch (err) {
      console.error('Review error:', err);
      res.status(500).json({ error: 'Failed to submit review.' });
    }
  },
};
