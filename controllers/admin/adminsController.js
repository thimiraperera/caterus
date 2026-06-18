/* Admin Management Controller */
const bcrypt = require('bcryptjs');
const Admin  = require('../../models/Admin');

module.exports = {
  async index(req, res) {
    try {
      const admins = await Admin.findAll();
      res.render('admin/admins/index', {
        title: 'Admins',
        currentPage: 'admins',
        admins,
        currentAdminId: req.session.adminId,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (err) {
      console.error('Admins index error:', err);
      req.flash('error', 'Failed to load admins.');
      res.redirect('/admin');
    }
  },

  async store(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        req.flash('error', 'Name, email and password are required.');
        return res.redirect('/admin/admins');
      }
      if (password.length < 8) {
        req.flash('error', 'Password must be at least 8 characters.');
        return res.redirect('/admin/admins');
      }
      const existing = await Admin.findByEmail(email.trim());
      if (existing) {
        req.flash('error', 'An admin with that email already exists.');
        return res.redirect('/admin/admins');
      }
      const hash = await bcrypt.hash(password, 12);
      await Admin.create({ name: name.trim(), email: email.trim(), password_hash: hash, role: role || 'admin' });
      req.flash('success', 'Admin created.');
      res.redirect('/admin/admins');
    } catch (err) {
      console.error('Admin store error:', err);
      req.flash('error', 'Failed to create admin.');
      res.redirect('/admin/admins');
    }
  },

  async destroy(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (id === req.session.adminId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/admins');
      }
      await Admin.deleteAdmin(id);
      req.flash('success', 'Admin deleted.');
      res.redirect('/admin/admins');
    } catch (err) {
      console.error('Admin delete error:', err);
      req.flash('error', 'Failed to delete admin.');
      res.redirect('/admin/admins');
    }
  },
};
