/* Admin Auth Controller */
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const Admin    = require('../../models/Admin');
const Settings = require('../../models/Settings');
const { sendEmail } = require('../../utils/email');

const BASE_URL = process.env.BASE_URL || 'https://caterus.com.au';

module.exports = {
  async showLogin(req, res) {
    try {
      const [logoLight, logoDark, logoChoice] = await Promise.all([
        Settings.get('logo_path').catch(() => null),
        Settings.get('logo_path_dark').catch(() => null),
        Settings.get('login_logo_choice').catch(() => 'light'),
      ]);
      const choice = logoChoice || 'light';
      let loginLogo = '';
      if (choice === 'light') loginLogo = logoLight || '';
      else if (choice === 'dark') loginLogo = logoDark || '';
      res.render('admin/login', {
        layout: false,
        error: req.flash('error'),
        success: req.flash('success'),
        loginLogo,
        logoChoice: choice,
      });
    } catch (_) {
      res.render('admin/login', {
        layout: false,
        error: req.flash('error'),
        success: req.flash('success'),
        loginLogo: '',
        logoChoice: 'text',
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password, remember_me } = req.body;
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
      if (remember_me === '1') {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      }
      req.session.adminId = admin.id;
      req.session.admin = {
        id: admin.id, email: admin.email, name: admin.name,
        role: admin.role, profile_image: admin.profile_image || null,
      };
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          req.flash('error', 'Login failed. Please try again.');
          return res.redirect('/admin/login');
        }
        res.redirect('/admin');
      });
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

  showForgotPassword(req, res) {
    res.render('admin/forgot-password', {
      layout: false,
      error: req.flash('error'),
      success: req.flash('success'),
    });
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const admin = email ? await Admin.findByEmail(email.trim()).catch(() => null) : null;
      if (admin) {
        const token   = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await Admin.storeResetToken(admin.id, token, expires);
        const resetLink = `${BASE_URL}/admin/reset-password/${token}`;
        const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
<h2 style="margin:0 0 16px">Reset your password</h2>
<p>Hi ${admin.name || 'Admin'},</p>
<p>Click the button below to reset your Caterus admin password. This link expires in 1 hour.</p>
<p style="margin:24px 0"><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#75896d;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a></p>
<p style="font-size:13px;color:#999">If you didn't request this, you can safely ignore this email.</p>
</body></html>`;
        await sendEmail(admin.email, 'Reset your Caterus admin password', html);
      }
      req.flash('success', 'If that email is in our system, a reset link has been sent.');
      res.redirect('/admin/forgot-password');
    } catch (err) {
      console.error('Forgot password error:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/admin/forgot-password');
    }
  },

  async showResetPassword(req, res) {
    try {
      const { token } = req.params;
      const record = token ? await Admin.findByResetToken(token).catch(() => null) : null;
      if (!record || new Date(record.tokenData.expires) < new Date()) {
        req.flash('error', 'This password reset link is invalid or has expired.');
        return res.redirect('/admin/forgot-password');
      }
      res.render('admin/reset-password', { layout: false, token, error: req.flash('error') });
    } catch (err) {
      console.error('Show reset password error:', err);
      req.flash('error', 'Invalid or expired link.');
      res.redirect('/admin/forgot-password');
    }
  },

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password, password_confirm } = req.body;
      const record = token ? await Admin.findByResetToken(token).catch(() => null) : null;
      if (!record || new Date(record.tokenData.expires) < new Date()) {
        req.flash('error', 'This password reset link is invalid or has expired.');
        return res.redirect('/admin/forgot-password');
      }
      if (!password || password.length < 8) {
        req.flash('error', 'Password must be at least 8 characters.');
        return res.redirect(`/admin/reset-password/${token}`);
      }
      if (password !== password_confirm) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect(`/admin/reset-password/${token}`);
      }
      const hash = await bcrypt.hash(password, 12);
      await Admin.updatePassword(record.id, hash);
      await Admin.clearResetToken(record.id);
      req.flash('success', 'Password updated. Please log in.');
      res.redirect('/admin/login');
    } catch (err) {
      console.error('Reset password error:', err);
      req.flash('error', 'Something went wrong. Please try again.');
      res.redirect('/admin/forgot-password');
    }
  },
};
