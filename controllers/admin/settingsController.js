/* Admin Settings Controller */
const path         = require('path');
const fs           = require('fs');
const sharp        = require('sharp');
const Settings     = require('../../models/Settings');
const Admin        = require('../../models/Admin');
const bcrypt       = require('bcryptjs');
const { sendTestEmail } = require('../../utils/email');
const convertToWebp = require('../../utils/convertToWebp');
const db           = require('../../config/database');

let speakeasy, qrcode, archiver, unzipper;
try { speakeasy = require('speakeasy'); } catch (_) {}
try { qrcode    = require('qrcode');    } catch (_) {}
try { archiver  = require('archiver');  } catch (_) {}
try { unzipper  = require('unzipper'); } catch (_) {}

module.exports = {
  async general(req, res) {
    const [settings, captchaSettings, logoSetting] = await Promise.all([
      Settings.getByGroup('general'),
      Settings.getByGroup('captcha'),
      Settings.get('logo_path').catch(() => null),
    ]);
    res.render('admin/settings/general', {
      title: 'Settings', currentPage: 'settings-general',
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
      seo[k.replace(/^seo_/, '')] = allSeo[k];
    });
    res.render('admin/settings/seo', { title: 'SEO Settings', currentPage: 'settings-seo', seo });
  },

  async saveSeo(req, res) {
    try {
      const pageId = req.query.page || 'home';
      const data   = req.body;
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
        if (data[f] !== undefined) toSave['seo_' + pageId + '_' + f] = data[f] || '';
      });
      if (data.is_cornerstone === undefined) toSave['seo_' + pageId + '_is_cornerstone'] = '0';

      if (req.file) {
        const imgPath = await convertToWebp(req.file.path, { maxWidth: 1200, maxHeight: 630, quality: 85, fit: 'cover' });
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
      // Normalize array values (e.g. hidden+checkbox sends ['0','1']) - take last value
      for (const k of Object.keys(settings)) {
        if (Array.isArray(settings[k])) settings[k] = settings[k][settings[k].length - 1];
      }
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
      const logoPath = await convertToWebp(req.file.path, { maxWidth: 800, maxHeight: 400, quality: 90, fit: 'inside' });
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
      if (email && email !== req.session.admin.email) req.session.admin.email = email;
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
      const outPath  = path.join(dir, filename);
      await sharp(req.file.path)
        .resize(256, 256, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toFile(outPath);
      fs.unlink(req.file.path, () => {});
      const imgPath = 'assets/uploads/admin/' + filename;
      await Admin.updateProfileInfo(req.session.adminId, { profile_image: imgPath });
      req.session.admin.profile_image = imgPath;
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

  /* Erase test data - keeps admins, settings, faqs */
  async eraseTestData(req, res) {
    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 0');
      const tables = [
        'booking_addons', 'payments', 'bookings', 'reviews', 'payouts',
        'contact_enquiries', 'caterer_applications', 'sessions',
        'caterer_images', 'caterer_tags', 'caterer_occasions', 'caterer_specialties',
        'caterer_inclusions', 'vetting_checklists', 'menu_items', 'menus', 'addons',
        'caterers',
      ];
      for (const t of tables) {
        await db.query(`TRUNCATE TABLE \`${t}\``);
      }
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
      req.flash('success', 'All test data erased. Admin accounts and settings are untouched.');
      res.redirect('/admin/settings/general');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Erase failed: ' + err.message);
      res.redirect('/admin/settings/general');
    }
  },

  /* Occasions list management */
  async occasions(req, res) {
    const raw = await Settings.get('occasions_list').catch(() => null);
    let occasions = [];
    try { occasions = raw ? JSON.parse(raw) : []; } catch (_) {}
    if (!occasions.length) {
      occasions = ['Wedding', 'Corporate', 'Birthday', 'Christmas', 'Conference', 'Cocktail Party', 'Gala Dinner', 'School Event', 'Funeral', 'Other'];
      await Settings.set('occasions_list', JSON.stringify(occasions), 'general');
    }
    res.render('admin/settings/occasions', { title: 'Occasions', currentPage: 'settings-occasions', occasions });
  },

  async addOccasion(req, res) {
    const raw = await Settings.get('occasions_list').catch(() => null);
    let occasions = [];
    try { occasions = raw ? JSON.parse(raw) : []; } catch (_) {}
    const name = (req.body.name || '').trim();
    if (name && !occasions.includes(name)) {
      occasions.push(name);
      await Settings.set('occasions_list', JSON.stringify(occasions), 'general');
    }
    req.flash('success', `Occasion "${name}" added.`);
    res.redirect('/admin/settings/occasions');
  },

  async deleteOccasion(req, res) {
    const raw = await Settings.get('occasions_list').catch(() => null);
    let occasions = [];
    try { occasions = raw ? JSON.parse(raw) : []; } catch (_) {}
    const name = req.body.name || '';
    occasions = occasions.filter(o => o !== name);
    await Settings.set('occasions_list', JSON.stringify(occasions), 'general');
    req.flash('success', `Occasion "${name}" removed.`);
    res.redirect('/admin/settings/occasions');
  },

  /* Backup: download DB as SQL */
  async backupDb(req, res) {
    try {
      const { exec } = require('child_process');
      const dbName   = process.env.DB_NAME;
      const dbUser   = process.env.DB_USER;
      const dbPass   = process.env.DB_PASSWORD || '';
      const dbHost   = process.env.DB_HOST || 'localhost';
      const dbPort   = process.env.DB_PORT || '3306';

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename  = `caterus-db-${timestamp}.sql`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/sql');

      const passArg = dbPass ? `-p${dbPass}` : '';
      const cmd     = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${passArg} ${dbName}`;
      const proc    = exec(cmd);
      proc.stdout.pipe(res);
      proc.stderr.on('data', d => console.error('mysqldump:', d));
      proc.on('error', err => {
        console.error(err);
        if (!res.headersSent) res.status(500).send('Backup failed: ' + err.message);
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'DB backup failed: ' + err.message);
      res.redirect('/admin/settings/general');
    }
  },

  /* Backup: download media as zip */
  async backupMedia(req, res) {
    try {
      if (!archiver) {
        req.flash('error', 'Run: npm install archiver on the server first.');
        return res.redirect('/admin/settings/general');
      }
      const uploadsDir = path.join(__dirname, '../../public/assets/uploads');
      const timestamp  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename   = `caterus-media-${timestamp}.zip`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/zip');

      const archive = archiver('zip', { zlib: { level: 5 } });
      archive.pipe(res);
      archive.directory(uploadsDir, 'uploads');
      archive.finalize();
    } catch (err) {
      console.error(err);
      req.flash('error', 'Media backup failed: ' + err.message);
      res.redirect('/admin/settings/general');
    }
  },

  /* Restore: upload .sql and run against DB */
  async restoreDb(req, res) {
    try {
      if (!req.file) { req.flash('error', 'No file uploaded.'); return res.redirect('/admin/settings/general'); }
      const { exec } = require('child_process');
      const dbName   = process.env.DB_NAME;
      const dbUser   = process.env.DB_USER;
      const dbPass   = process.env.DB_PASSWORD || '';
      const dbHost   = process.env.DB_HOST || 'localhost';
      const dbPort   = process.env.DB_PORT || '3306';

      const passArg = dbPass ? `-p${dbPass}` : '';
      const cmd     = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} ${passArg} ${dbName} < "${req.file.path}"`;
      exec(cmd, (err) => {
        fs.unlink(req.file.path, () => {});
        if (err) {
          req.flash('error', 'DB restore failed: ' + err.message);
        } else {
          req.flash('success', 'Database restored successfully.');
        }
        res.redirect('/admin/settings/general');
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'DB restore failed: ' + err.message);
      res.redirect('/admin/settings/general');
    }
  },

  /* Restore: upload media zip and extract */
  async restoreMedia(req, res) {
    try {
      if (!req.file) { req.flash('error', 'No file uploaded.'); return res.redirect('/admin/settings/general'); }
      if (!unzipper) {
        req.flash('error', 'Run: npm install unzipper on the server first.');
        fs.unlink(req.file.path, () => {});
        return res.redirect('/admin/settings/general');
      }
      const uploadsDir = path.join(__dirname, '../../public/assets/uploads');
      fs.createReadStream(req.file.path)
        .pipe(unzipper.Extract({ path: path.join(__dirname, '../../public/assets') }))
        .on('close', () => {
          fs.unlink(req.file.path, () => {});
          req.flash('success', 'Media restored successfully.');
          res.redirect('/admin/settings/general');
        })
        .on('error', err => {
          fs.unlink(req.file.path, () => {});
          req.flash('error', 'Media restore failed: ' + err.message);
          res.redirect('/admin/settings/general');
        });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Media restore failed: ' + err.message);
      res.redirect('/admin/settings/general');
    }
  },

  /* Generate sitemap.xml string from DB */
  async getSitemapXml(baseUrl) {
    const Caterer = require('../../models/Caterer');
    const Faq     = require('../../models/Faq');
    const [caterers] = await db.query(
      "SELECT slug, updated_at FROM caterers WHERE is_published = 1 AND status = 'active' AND (is_unlisted = 0 OR is_unlisted IS NULL) ORDER BY updated_at DESC"
    );
    const staticPages = [
      { loc: '/',          priority: '1.0', changefreq: 'weekly' },
      { loc: '/caterers',  priority: '0.9', changefreq: 'daily'  },
      { loc: '/contact',   priority: '0.5', changefreq: 'monthly' },
    ];
    const toDate = d => d ? new Date(d).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

    let urls = staticPages.map(p =>
      `  <url>\n    <loc>${baseUrl}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    );
    for (const c of caterers) {
      urls.push(`  <url>\n    <loc>${baseUrl}/caterers/${c.slug}</loc>\n    <lastmod>${toDate(c.updated_at)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  },
};
