/* Admin authentication middleware */
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  req.flash('error', 'Please log in to access the admin area.');
  res.redirect('/admin/login');
};

module.exports = { requireAdmin };
