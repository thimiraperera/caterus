/* Admin Settings Controller */
const path     = require('path');
const fs       = require('fs');
const Settings = require('../../models/Settings');
const Admin    = require('../../models/Admin');
const bcrypt   = require('bcryptjs');
const { sendTestEmail } = require('../../utils/email');

module.exports = {
  async general(req, res) {
    const settings = await Settings.getByGroup('general');
    const logoSetting = await Settings.get('logo_path').catch(() => null);
    res.render('admin/settings/general', { title: 'General Settings', currentPage: 'settings-general', settings, logoPath: logoSetting || '' });
  },
  async smtp(req, res) {
    const settings = await Settings.getByGroup('smtp');
    res.render('admin/settings/smtp', { title: 'SMTP Settings', currentPage: 'settings-smtp', settings });
  },
  async stripe(req, res) {
    const settings = await Settings.getByGroup('stripe');
    res.render('admin/settings/stripe', { title: 'Stripe Settings', currentPage: 'settings-stripe', settings });
  },
  async profile(req, res) {
    const admin = await Admin.findById(req.session.adminId);
    res.render('admin/settings/profile', { title: 'Profile', currentPage: 'settings-profile', adminProfile: admin });
  },

  async update(req, res) {
    try {
      const { group, ...settings } = req.body;
      await Settings.setMultiple(settings, group);
      req.flash('success', 'Settings saved!');
      res.redirect(`/admin/settings/${group}`);
    } catch (err) { console.error(err); req.flash('error', 'Failed to save settings.'); res.redirect('back'); }
  },

  async uploadLogo(req, res) {
    try {
      if (!req.file) {
        req.flash('error', 'No file selected.');
        return res.redirect('/admin/settings/general');
      }
      const logoPath = 'assets/uploads/' + req.file.filename;
      await Settings.set('logo_path', logoPath, 'general');
      req.flash('success', 'Logo uploaded successfully!');
      res.redirect('/admin/settings/general');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Logo upload failed.');
      res.redirect('/admin/settings/general');
    }
  },

  async testSmtp(req, res) {
    try {
      const { test_email } = req.body;
      const result = await sendTestEmail(test_email);
      if (result.success) {
        req.flash('success', `Test email sent to ${test_email}!`);
      } else {
        req.flash('error', `Failed: ${result.error}`);
      }
      res.redirect('/admin/settings/smtp');
    } catch (err) { console.error(err); req.flash('error', 'SMTP test failed.'); res.redirect('/admin/settings/smtp'); }
  },

  async updateProfile(req, res) {
    try {
      const { current_password, new_password, confirm_password } = req.body;
      if (new_password !== confirm_password) {
        req.flash('error', 'New passwords do not match.');
        return res.redirect('/admin/settings/profile');
      }
      const admin = await Admin.findByEmail(req.session.admin.email);
      const match = await bcrypt.compare(current_password, admin.password_hash);
      if (!match) {
        req.flash('error', 'Current password is incorrect.');
        return res.redirect('/admin/settings/profile');
      }
      const hash = await bcrypt.hash(new_password, 12);
      await Admin.updatePassword(req.session.adminId, hash);
      req.flash('success', 'Password updated!');
      res.redirect('/admin/settings/profile');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update password.'); res.redirect('/admin/settings/profile'); }
  },
};
