/* ============================================================
   Admin Routes
   ============================================================ */
const express = require('express');
const router = express.Router();
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

/* ── Auth (no middleware) ── */
router.get('/login',  authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

/* ── Session debug (remove after fix) ── */
router.get('/session-test', (req, res) => {
  res.json({ session: req.session, sessionID: req.sessionID, cookies: req.headers.cookie });
});

/* ── All routes below require admin ── */
router.use(requireAdmin);

/* ── Dashboard ── */
router.get('/', dashboardController.index);

/* ── Caterers ── */
router.get('/caterers',                catererController.index);
router.get('/caterers/create',         catererController.create);
router.post('/caterers',               upload.single('featured_image'), catererController.store);
router.get('/caterers/:id/edit',       catererController.edit);
router.put('/caterers/:id',            upload.single('featured_image'), catererController.update);
router.delete('/caterers/:id',         catererController.destroy);
router.post('/caterers/:id/images',    upload.array('images', 10), catererController.uploadImages);
router.delete('/caterers/:id/images/:imgId', catererController.deleteImage);

/* ── Vetting ── */
router.get('/caterers/:id/vetting',    vettingController.show);
router.post('/caterers/:id/vetting',   vettingController.update);

/* ── Menus ── */
router.get('/caterers/:id/menus',      menuController.index);
router.post('/caterers/:id/menus',     menuController.store);
router.put('/menus/:id',               menuController.update);
router.delete('/menus/:id',            menuController.destroy);

/* ── Bookings ── */
router.get('/bookings',                bookingController.index);
router.get('/bookings/:id',            bookingController.show);
router.put('/bookings/:id/status',     bookingController.updateStatus);
router.put('/bookings/:id/notes',      bookingController.updateNotes);

/* ── Reviews ── */
router.get('/reviews',                 reviewController.index);
router.put('/reviews/:id/status',      reviewController.updateStatus);

/* ── Payouts ── */
router.get('/payouts',                 payoutController.index);
router.post('/payouts',                payoutController.store);
router.put('/payouts/:id/status',      payoutController.updateStatus);

/* ── Enquiries ── */
router.get('/enquiries',               enquiryController.index);
router.put('/enquiries/:id/status',    enquiryController.updateStatus);

/* ── Applications ── */
router.get('/applications',            applicationController.index);
router.put('/applications/:id/status', applicationController.updateStatus);

/* ── Settings ── */
router.get('/settings/general',        settingsController.general);
router.get('/settings/smtp',           settingsController.smtp);
router.get('/settings/stripe',         settingsController.stripe);
router.get('/settings/profile',        settingsController.profile);
router.put('/settings',                settingsController.update);
router.post('/settings/smtp/test',     settingsController.testSmtp);
router.put('/settings/profile',        settingsController.updateProfile);

module.exports = router;
