/* Admin Caterer Controller */
const Caterer = require('../../models/Caterer');
const { slugify } = require('../../utils/helpers');
const path = require('path');
const fs = require('fs');

module.exports = {
  async index(req, res) {
    try {
      const result = await Caterer.findAll({ status: req.query.status, search: req.query.search, page: req.query.page });
      res.render('admin/caterers/index', { title: 'Caterers', currentPage: 'caterers', ...result });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to load caterers.');
      res.redirect('/admin');
    }
  },

  create(req, res) {
    res.render('admin/caterers/create', { title: 'Add Caterer', currentPage: 'caterers' });
  },

  async store(req, res) {
    try {
      const data = req.body;
      data.slug = slugify(data.business_name);
      if (req.file) data.featured_image = 'assets/uploads/' + req.file.filename;
      data.is_published = data.is_published === 'on' || data.is_published === '1';
      data.is_featured = data.is_featured === 'on' || data.is_featured === '1';

      const id = await Caterer.create(data);

      // Tags
      if (data.tags) {
        const tags = typeof data.tags === 'string' ? data.tags.split(',') : data.tags;
        await Caterer.setTags(id, tags);
      }
      // Occasions
      if (data.occasions) {
        const occasions = Array.isArray(data.occasions) ? data.occasions : [data.occasions];
        await Caterer.setOccasions(id, occasions);
      }

      req.flash('success', 'Caterer created successfully!');
      res.redirect(`/admin/caterers/${id}/edit`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to create caterer.');
      res.redirect('/admin/caterers/create');
    }
  },

  async edit(req, res) {
    try {
      const caterer = await Caterer.findById(req.params.id);
      if (!caterer) { req.flash('error', 'Caterer not found.'); return res.redirect('/admin/caterers'); }
      const images = await Caterer.getImages(caterer.id);
      res.render('admin/caterers/edit', { title: `Edit — ${caterer.business_name}`, currentPage: 'caterers', caterer, images });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to load caterer.');
      res.redirect('/admin/caterers');
    }
  },

  async update(req, res) {
    try {
      const data = req.body;
      if (data.business_name) data.slug = slugify(data.business_name);
      if (req.file) data.featured_image = 'assets/uploads/' + req.file.filename;
      data.is_published = data.is_published === 'on' || data.is_published === '1';
      data.is_featured = data.is_featured === 'on' || data.is_featured === '1';

      await Caterer.update(req.params.id, data);

      if (data.tags) {
        const tags = typeof data.tags === 'string' ? data.tags.split(',') : data.tags;
        await Caterer.setTags(req.params.id, tags);
      }
      if (data.occasions) {
        const occasions = Array.isArray(data.occasions) ? data.occasions : [data.occasions];
        await Caterer.setOccasions(req.params.id, occasions);
      }
      if (data.specialties) {
        const specs = typeof data.specialties === 'string' ? data.specialties.split(',') : data.specialties;
        await Caterer.setSpecialties(req.params.id, specs);
      }
      if (data.inclusion_titles) {
        const titles = Array.isArray(data.inclusion_titles) ? data.inclusion_titles : [data.inclusion_titles];
        const descs = Array.isArray(data.inclusion_descriptions) ? data.inclusion_descriptions : [data.inclusion_descriptions || ''];
        const inclusions = titles.map((t, i) => ({ title: t, description: descs[i] || '' }));
        await Caterer.setInclusions(req.params.id, inclusions);
      }

      req.flash('success', 'Caterer updated successfully!');
      res.redirect(`/admin/caterers/${req.params.id}/edit`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to update caterer.');
      res.redirect(`/admin/caterers/${req.params.id}/edit`);
    }
  },

  async destroy(req, res) {
    try {
      await Caterer.delete(req.params.id);
      req.flash('success', 'Caterer deleted.');
      res.redirect('/admin/caterers');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to delete caterer.');
      res.redirect('/admin/caterers');
    }
  },

  async uploadImages(req, res) {
    try {
      if (req.files) {
        for (const file of req.files) {
          await Caterer.addImage(req.params.id, 'assets/uploads/' + file.filename, '', 0);
        }
      }
      req.flash('success', 'Images uploaded!');
      res.redirect(`/admin/caterers/${req.params.id}/edit`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to upload images.');
      res.redirect(`/admin/caterers/${req.params.id}/edit`);
    }
  },

  async deleteImage(req, res) {
    try {
      await Caterer.deleteImage(req.params.imgId);
      req.flash('success', 'Image deleted.');
      res.redirect(`/admin/caterers/${req.params.id}/edit`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to delete image.');
      res.redirect(`/admin/caterers/${req.params.id}/edit`);
    }
  },
};
