/* ============================================================
   Caterus - Express Server
   ============================================================ */
require('dotenv').config();

const express       = require('express');
const path          = require('path');
const session       = require('express-session');
const flash         = require('connect-flash');
const cookieParser  = require('cookie-parser');
const morgan        = require('morgan');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---- Stripe webhook needs raw body — mount BEFORE body parsers ---- */
const webhookRoutes = require('./routes/webhooks');
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

/* ---- Body parsers ---- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

/* ---- Logging ---- */
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* ---- Static files (existing site + admin assets) ---- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---- View engine ---- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/admin');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

/* ---- Sessions ---- */
app.use(session({
  secret: process.env.SESSION_SECRET || 'caterus-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
}));

/* ---- Flash messages ---- */
app.use(flash());

/* ---- Global template variables ---- */
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg   = req.flash('error');
  res.locals.admin       = req.session.admin || null;
  res.locals.currentPage = '';
  res.locals.title       = 'Caterus Admin';
  res.locals.baseUrl     = process.env.BASE_URL || `http://localhost:${PORT}`;
  // Defaults for express-ejs-layouts extractScripts/extractStyles
  res.locals.style       = '';
  res.locals.script      = '';
  next();
});

/* ---- Routes ---- */
const pageRoutes  = require('./routes/pages');
const apiRoutes   = require('./routes/api');
const adminRoutes = require('./routes/admin');

app.use('/admin', adminRoutes);
app.use('/api',   apiRoutes);
app.use('/',      pageRoutes);   // catch-all last

/* ---- 404 handler ---- */
app.use((req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { layout: false });
  } else {
    res.json({ error: 'Not found' });
  }
});

/* ---- Error handler ---- */
app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  const status = err.status || 500;
  res.status(status);
  if (req.accepts('html')) {
    res.render('404', { layout: false });
  } else {
    res.json({ error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message });
  }
});

/* ---- Start ---- */
app.listen(PORT, () => {
  console.log(`\n  ● Caterus server running at http://localhost:${PORT}\n`);
  console.log(`  → Public site:     http://localhost:${PORT}/`);
  console.log(`  → Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`  → API:             http://localhost:${PORT}/api\n`);
});
