/* Admin Caterer Controller */
const Caterer        = require('../../models/Caterer');
const Settings       = require('../../models/Settings');
const { slugify }    = require('../../utils/helpers');
const convertToWebp  = require('../../utils/convertToWebp');
const path           = require('path');
const fs             = require('fs');

module.exports = {
  async index(req, res) {
    try {
      const { page = 1, per_page = 20, status, search, cuisine, suburb, rating_min } = req.query;
      const result = await Caterer.findAll({ status, search, cuisine, suburb, rating_min, page, limit: per_page });
      const qp = [];
      if (status) qp.push('status=' + encodeURIComponent(status));
      if (search) qp.push('search=' + encodeURIComponent(search));
      if (cuisine) qp.push('cuisine=' + encodeURIComponent(cuisine));
      if (suburb) qp.push('suburb=' + encodeURIComponent(suburb));
      if (rating_min) qp.push('rating_min=' + rating_min);
      qp.push('per_page=' + per_page);
      const queryExtra = qp.join('&');

      if (req.headers['x-partial'] === '1') {
        const ejs = require('ejs');
        const html = await ejs.renderFile(
          path.join(req.app.get('views'), 'admin/caterers/_table.ejs'),
          { ...result, per_page: parseInt(per_page) || 20, queryExtra, status: status || '' }
        );
        return res.send(html);
      }

      res.render('admin/caterers/index', {
        title: 'Caterers', currentPage: 'caterers',
        ...result, per_page: parseInt(per_page) || 20, queryExtra,
        currentStatus: status || '', searchQuery: search || '',
        cfCuisine: cuisine || '', cfSuburb: suburb || '', cfRating: rating_min || '',
      });
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
      if (req.file) {
        data.featured_image = await convertToWebp(req.file.path);
      }
      data.is_published = data.is_published === 'on' || data.is_published === '1';
      data.is_featured  = data.is_featured  === 'on' || data.is_featured  === '1';

      const id = await Caterer.create(data);

      if (data.tags) {
        const tags = typeof data.tags === 'string' ? data.tags.split(',') : data.tags;
        await Caterer.setTags(id, tags);
      }
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
      const [images, occasionsRaw] = await Promise.all([
        Caterer.getImages(caterer.id),
        Settings.get('occasions_list').catch(() => null),
      ]);
      const DEFAULT_OCCASIONS = ['Wedding', 'Corporate', 'Birthday', 'Christmas', 'Conference', 'Cocktail Party', 'Gala Dinner', 'School Event', 'Funeral', 'Other'];
      let allOccasions = DEFAULT_OCCASIONS;
      try {
        if (occasionsRaw) {
          const parsed = JSON.parse(occasionsRaw);
          allOccasions = parsed.map(o => typeof o === 'string' ? o : o.name);
        }
      } catch (_) {}
      res.render('admin/caterers/edit', { title: `Edit: ${caterer.business_name}`, currentPage: 'caterers', caterer, images, allOccasions });
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
      if (req.file) {
        data.featured_image = await convertToWebp(req.file.path);
      }
      data.is_published = data.is_published === 'on' || data.is_published === '1';
      data.is_featured  = data.is_featured  === 'on' || data.is_featured  === '1';

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
        const descs  = Array.isArray(data.inclusion_descriptions) ? data.inclusion_descriptions : [data.inclusion_descriptions || ''];
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
          const imgPath = await convertToWebp(file.path);
          await Caterer.addImage(req.params.id, imgPath, '', 0);
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

  /* Unlist a caterer - sets is_published=false, page stays live with noindex */
  async unlist(req, res) {
    try {
      await Caterer.setUnlisted(req.params.id, true);
      req.flash('success', 'Caterer unlisted. Page stays live but will not be indexed by search engines.');
      res.redirect('/admin/caterers');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to unlist caterer.');
      res.redirect('/admin/caterers');
    }
  },

  /* Relist a caterer */
  async relist(req, res) {
    try {
      await Caterer.setUnlisted(req.params.id, false);
      req.flash('success', 'Caterer relisted and visible to search engines.');
      res.redirect('/admin/caterers');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to relist caterer.');
      res.redirect('/admin/caterers');
    }
  },

  /* Save caterer-specific SEO from edit page */
  async saveSeo(req, res) {
    try {
      const { meta_title, meta_description } = req.body;
      await Caterer.updateSeo(req.params.id, { meta_title, meta_description });
      req.flash('success', 'SEO saved.');
      res.redirect(`/admin/caterers/${req.params.id}/edit#caterer-seo`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to save SEO.');
      res.redirect(`/admin/caterers/${req.params.id}/edit`);
    }
  },
};
