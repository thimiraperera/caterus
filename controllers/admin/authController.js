/* Admin Auth Controller */
const bcrypt = require('bcryptjs');
const Admin  = require('../../models/Admin');

module.exports = {
  showLogin(req, res) {
    res.render('admin/login', { layout: false, error: req.flash('error') });
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('error', 'Please enter email and password.');
        return res.redirect('/admin/login');
      }
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/admin/login');
      }
      const match = await bcrypt.compare(password, admin.password_hash);
      if (!match) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/admin/login');
      }
      req.session.adminId = admin.id;
      req.session.admin = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
      req.flash('success', `Welcome back, ${admin.name || 'Admin'}!`);
      res.redirect('/admin');
    } catch (err) {
      console.error('Login error:', err);
      req.flash('error', 'Login failed. Please try again.');
      res.redirect('/admin/login');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  },
};
