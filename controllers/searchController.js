/* Search Controller — JSON API for caterer search */
const Caterer = require('../models/Caterer');
const Menu    = require('../models/Menu');
const Review  = require('../models/Review');

module.exports = {
  async search(req, res) {
    try {
      const filters = {
        search: req.query.search || req.query.suburb,
        occasion: req.query.occasion,
        cuisine: req.query.cuisine,
        minGuests: req.query.guests,
        maxPrice: req.query.budget,
        sort: req.query.sort,
        page: req.query.page,
        limit: req.query.limit,
      };
      const result = await Caterer.getPublished(filters);
      res.json(result);
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Search failed' });
    }
  },

  async getCaterer(req, res) {
    try {
      const caterer = await Caterer.findBySlug(req.params.slug);
      if (!caterer) return res.status(404).json({ error: 'Caterer not found' });
      const menus = await Menu.findByCaterer(caterer.id);
      const reviews = await Review.findByCaterer(caterer.id);
      res.json({ caterer, menus, reviews });
    } catch (err) {
      console.error('Get caterer error:', err);
      res.status(500).json({ error: 'Failed to load caterer' });
    }
  },
};
