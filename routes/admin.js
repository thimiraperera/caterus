/* Admin Routes */
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { requireAdmin } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

const authController        = require('../controllers/admin/authController');
const dashboardController   = require('../controllers/admin/dashboardController');
const catererController     = require('../controllers/admin/catererController');
const menuController        = require('../controllers/admin/menuController');
const bookingController     = require('../controllers/admin/bookingController');
const reviewController      = require('../controllers/admin/reviewController');
const payoutController      = require('../controllers/admin/payoutController');
const settingsController    = require('../controllers/admin/settingsController');
const vettingController     = require('../controllers/admin/vettingController');
const enquiryController     = require('../controllers/admin/enquiryController');
const applicationController = require('../controllers/admin/applicationController');
const faqController         = require('../controllers/admin/faqController');

/* Multer for .sql and .zip restores (stored in OS temp) */
const restoreUpload = multer({ dest: require('os').tmpdir() });

/* Auth (no middleware) */
router.get('/login',  authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

/* All routes below require admin */
router.use(requireAdmin);

/* Dashboard */
router.get('/', dashboardController.index);

/* Caterers */
router.get('/caterers',                catererController.index);
router.get('/caterers/create',         catererController.create);
router.post('/caterers',               upload.single('featured_image'), catererController.store);
router.get('/caterers/:id/edit',       catererController.edit);
router.put('/caterers/:id',            upload.single('featured_image'), catererController.update);
router.delete('/caterers/:id',         catererController.destroy);
router.post('/caterers/:id/images',    upload.array('images', 10), catererController.uploadImages);
router.delete('/caterers/:id/images/:imgId', catererController.deleteImage);
router.put('/caterers/:id/unlist',     catererController.unlist);
router.put('/caterers/:id/relist',     catererController.relist);
router.post('/caterers/:id/seo',       catererController.saveSeo);

/* Vetting */
router.get('/caterers/:id/vetting',    vettingController.show);
router.post('/caterers/:id/vetting',   vettingController.update);

/* Menus */
router.get('/caterers/:id/menus',      menuController.index);
router.post('/caterers/:id/menus',     menuController.store);
router.put('/menus/:id',               menuController.update);
router.delete('/menus/:id',            menuController.destroy);

/* Bookings */
router.get('/bookings',                bookingController.index);
router.get('/bookings/:id',            bookingController.show);
router.put('/bookings/:id/status',     bookingController.updateStatus);
router.put('/bookings/:id/notes',      bookingController.updateNotes);

/* Reviews */
router.get('/reviews',                 reviewController.index);
router.put('/reviews/:id/status',      reviewController.updateStatus);

/* Payouts */
router.get('/payouts',                 payoutController.index);
router.post('/payouts',                payoutController.store);
router.put('/payouts/:id/status',      payoutController.updateStatus);

/* Enquiries */
router.get('/enquiries',               enquiryController.index);
router.put('/enquiries/:id/status',    enquiryController.updateStatus);

/* Applications */
router.get('/applications',            applicationController.index);
router.put('/applications/:id/status', applicationController.updateStatus);

/* FAQs */
router.get('/faqs',              faqController.index);
router.post('/faqs/seed',        faqController.seed);
router.get('/faqs/create',       faqController.create);
router.post('/faqs',             faqController.store);
router.get('/faqs/:id/edit',     faqController.edit);
router.put('/faqs/:id',          faqController.update);
router.delete('/faqs/:id',       faqController.destroy);

/* Settings */
router.get('/settings/general',           settingsController.general);
router.get('/settings/smtp',              settingsController.smtp);
router.get('/settings/stripe',            settingsController.stripe);
router.get('/settings/seo',               settingsController.seo);
router.post('/settings/seo',              upload.single('featured_image'), settingsController.saveSeo);
router.get('/settings/profile',           settingsController.profile);
router.put('/settings',                   settingsController.update);
router.post('/settings/logo',             upload.single('logo'), settingsController.uploadLogo);
router.post('/settings/smtp/test',        settingsController.testSmtp);
router.put('/settings/profile',           settingsController.updateProfile);
router.post('/settings/profile/info',     settingsController.updateProfileInfo);
router.post('/settings/profile/avatar',   upload.single('avatar'), settingsController.uploadAvatar);
router.post('/settings/2fa/setup',        settingsController.setup2fa);
router.post('/settings/2fa/enable',       settingsController.enable2fa);
router.post('/settings/2fa/disable',      settingsController.disable2fa);

/* Erase test data */
router.post('/settings/erase-test-data',  settingsController.eraseTestData);

/* Backup */
router.get('/settings/backup/db',         settingsController.backupDb);
router.get('/settings/backup/media',      settingsController.backupMedia);

/* Restore */
router.post('/settings/restore/db',       restoreUpload.single('sql_file'), settingsController.restoreDb);
router.post('/settings/restore/media',    restoreUpload.single('zip_file'), settingsController.restoreMedia);

module.exports = router;
