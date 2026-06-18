/* Admin Settings Controller */
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const Settings = require('../../models/Settings');
const Admin    = require('../../models/Admin');
const bcrypt   = require('bcryptjs');
const { sendTestEmail } = require('../../utils/email');

let speakeasy, qrcode;
try { speakeasy = require('speakeasy'); } catch (_) {}
try { qrcode   = require('qrcode'); }    catch (_) {}

module.exports = {
  async general(req, res) {
    const [settings, captchaSettings, logoSetting] = await Promise.all([
      Settings.getByGroup('general'),
      Settings.getByGroup('captcha'),
      Settings.get('logo_path').catch(() => null),
    ]);
    res.render('admin/settings/general', {
      title: 'Site Settings', currentPage: 'settings-general',
      settings: { ...settings, ...captchaSettings },
      logoPath: logoSetting || '',
    });
  },

  async smtp(req, res) {
    const settings = await Settings.getByGroup('smtp');
    res.render('admin/settings/smtp', { title: 'SMTP Settings', currentPage: 'settings-smtp', settings });
  },

  async stripe(req, res) {
    const settings = await Settings.getByGroup('stripe');
    res.render('admin/settings/stripe', { title: 'Stripe Settings', currentPage: 'settings-stripe', settings });
  },

  async seo(req, res) {
    const allSeo = await Settings.getByGroup('seo');
    const seo = {};
    Object.keys(allSeo).forEach(k => {
      const withoutPrefix = k.replace(/^seo_/, '');
      seo[withoutPrefix] = allSeo[k];
    });
    res.render('admin/settings/seo', { title: 'SEO Settings', currentPage: 'settings-seo', seo });
  },

  async saveSeo(req, res) {
    try {
      const pageId = req.query.page || 'home';
      const data = req.body;
      const toSave = {};
      const allowedFields = [
        'title', 'focus_keyphrase', 'meta_description', 'breadcrumbs_title',
        'canonical_url', 'page_type', 'article_type', 'is_cornerstone',
        'social_title', 'social_description', 'twitter_title', 'twitter_description',
        'business_name', 'business_type', 'business_description', 'business_phone', 'business_email',
        'address_street', 'address_city', 'address_state', 'address_postcode', 'address_country',
        'geo_lat', 'geo_lng', 'price_range',
        'social_facebook', 'social_instagram', 'social_twitter', 'social_linkedin',
      ];
      allowedFields.forEach(f => {
        if (data[f] !== undefined) {
          toSave['seo_' + pageId + '_' + f] = data[f] || '';
        }
      });
      if (data.is_cornerstone === undefined) toSave['seo_' + pageId + '_is_cornerstone'] = '0';

      if (req.file) {
        const imgPath = 'assets/uploads/seo_' + pageId + '_' + Date.now() + '.webp';
        await sharp(req.file.path).resize(1200, 630, { fit: 'cover' }).webp({ quality: 85 }).toFile('public/' + imgPath);
        fs.unlink(req.file.path, () => {});
        toSave['seo_' + pageId + '_featured_image'] = imgPath;
      }

      for (const [k, v] of Object.entries(toSave)) {
        await Settings.set(k, v, 'seo');
      }
      req.flash('success', 'SEO settings saved.');
      res.redirect('/admin/settings/seo');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to save SEO settings.');
      res.redirect('/admin/settings/seo');
    }
  },

  async profile(req, res) {
    const admin = await Admin.findById(req.session.adminId);
    res.render('admin/settings/profile', {
      title: 'Profile', currentPage: 'settings-profile',
      adminProfile: admin,
      totpSetup: req.session.totpSetup || null,
    });
    delete req.session.totpSetup;
  },

  async update(req, res) {
    try {
      const { group, _redirect, ...settings } = req.body;
      await Settings.setMultiple(settings, group);
      req.flash('success', 'Settings saved.');
      const known = ['general', 'smtp', 'stripe', 'profile'];
      const redirect = _redirect || (known.includes(group) ? `/admin/settings/${group}` : '/admin/settings/general');
      res.redirect(redirect);
    } catch (err) { console.error(err); req.flash('error', 'Failed to save settings.'); res.redirect('back'); }
  },

  async uploadLogo(req, res) {
    try {
      if (!req.file) { req.flash('error', 'No file selected.'); return res.redirect('/admin/settings/general'); }
      const logoPath = 'assets/uploads/' + req.file.filename;
      await Settings.set('logo_path', logoPath, 'general');
      req.flash('success', 'Logo uploaded.');
      res.redirect('/admin/settings/general');
    } catch (err) { console.error(err); req.flash('error', 'Logo upload failed.'); res.redirect('/admin/settings/general'); }
  },

  async testSmtp(req, res) {
    try {
      const { test_email } = req.body;
      const result = await sendTestEmail(test_email);
      if (result.success) { req.flash('success', `Test email sent to ${test_email}.`); }
      else { req.flash('error', `Failed: ${result.error}`); }
      res.redirect('/admin/settings/smtp');
    } catch (err) { console.error(err); req.flash('error', 'SMTP test failed.'); res.redirect('/admin/settings/smtp'); }
  },

  async updateProfileInfo(req, res) {
    try {
      const { first_name, last_name, email, phone, phone_country } = req.body;
      await Admin.updateProfileInfo(req.session.adminId, { first_name, last_name, email, phone, phone_country });
      if (email && email !== req.session.admin.email) {
        req.session.admin.email = email;
      }
      const fullName = [first_name, last_name].filter(Boolean).join(' ');
      if (fullName) req.session.admin.name = fullName;
      req.flash('success', 'Profile updated.');
      res.redirect('/admin/settings/profile');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update profile.'); res.redirect('/admin/settings/profile'); }
  },

  async uploadAvatar(req, res) {
    try {
      if (!req.file) { req.flash('error', 'No file selected.'); return res.redirect('/admin/settings/profile'); }
      const dir = path.join(__dirname, '../../public/assets/uploads/admin');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filename = 'avatar_' + req.session.adminId + '.webp';
      const outPath = path.join(dir, filename);
      await sharp(req.file.path)
        .resize(256, 256, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toFile(outPath);
      fs.unlink(req.file.path, () => {});
      const imgPath = 'assets/uploads/admin/' + filename;
      await Admin.updateProfileInfo(req.session.adminId, { profile_image: imgPath });
      req.flash('success', 'Profile picture updated.');
      res.redirect('/admin/settings/profile');
    } catch (err) { console.error(err); req.flash('error', 'Failed to upload picture.'); res.redirect('/admin/settings/profile'); }
  },

  async updateProfile(req, res) {
    try {
      const { current_password, new_password, confirm_password } = req.body;
      if (new_password !== confirm_password) { req.flash('error', 'New passwords do not match.'); return res.redirect('/admin/settings/profile'); }
      const admin = await Admin.findByEmail(req.session.admin.email);
      const match = await bcrypt.compare(current_password, admin.password_hash);
      if (!match) { req.flash('error', 'Current password is incorrect.'); return res.redirect('/admin/settings/profile'); }
      const hash = await bcrypt.hash(new_password, 12);
      await Admin.updatePassword(req.session.adminId, hash);
      req.flash('success', 'Password updated.');
      res.redirect('/admin/settings/profile');
    } catch (err) { console.error(err); req.flash('error', 'Failed to update password.'); res.redirect('/admin/settings/profile'); }
  },

  async setup2fa(req, res) {
    try {
      if (!speakeasy || !qrcode) { req.flash('error', 'Run: npm install speakeasy qrcode on the server first.'); return res.redirect('/admin/settings/profile'); }
      const admin = await Admin.findById(req.session.adminId);
      const secret = speakeasy.generateSecret({ name: `Caterus Admin (${admin.email})`, length: 20 });
      const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
      req.session.totpSetup = { secret: secret.base32, qrDataUrl };
      await Admin.setTotpSecret(req.session.adminId, secret.base32);
      res.redirect('/admin/settings/profile');
    } catch (err) { console.error(err); req.flash('error', 'Failed to set up 2FA.'); res.redirect('/admin/settings/profile'); }
  },

  async enable2fa(req, res) {
    try {
      if (!speakeasy) { req.flash('error', 'speakeasy package not installed.'); return res.redirect('/admin/settings/profile'); }
      const { totp_token } = req.body;
      const admin = await Admin.findById(req.session.adminId);
      const valid = speakeasy.totp.verify({ secret: admin.totp_secret, encoding: 'base32', token: totp_token, window: 1 });
      if (!valid) { req.flash('error', 'Invalid code. Try again.'); return res.redirect('/admin/settings/profile'); }
      await Admin.enableTotp(req.session.adminId);
      req.flash('success', 'Two-factor authentication enabled.');
      res.redirect('/admin/settings/profile');
    } catch (err) { console.error(err); req.flash('error', 'Failed to enable 2FA.'); res.redirect('/admin/settings/profile'); }
  },

  async disable2fa(req, res) {
    try {
      await Admin.disableTotp(req.session.adminId);
      req.flash('success', 'Two-factor authentication disabled.');
      res.redirect('/admin/settings/profile');
    } catch (err) { console.error(err); req.flash('error', 'Failed to disable 2FA.'); res.redirect('/admin/settings/profile'); }
  },
};
