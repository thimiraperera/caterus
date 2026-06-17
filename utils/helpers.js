/* ============================================================
   Helper Utilities
   ============================================================ */

const formatCurrency = (amount) => {
  const n = parseFloat(amount) || 0;
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
};

const generateReference = () => {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CAT-${date}-${rand}`;
};

const generateInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const slugify = (text) => {
  return text.toString().toLowerCase().trim()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const calculateBookingTotals = (pricePerHead, guestCount, addonsTotal = 0, commissionRate = 12, gstRate = 10) => {
  const subtotal = (pricePerHead * guestCount) + addonsTotal;
  const gst = subtotal * (gstRate / 100);
  const total = subtotal + gst;
  const commissionAmount = subtotal * (commissionRate / 100);
  const catererPayout = subtotal - commissionAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    total: Math.round(total * 100) / 100,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    catererPayout: Math.round(catererPayout * 100) / 100,
  };
};

const paginate = (page = 1, limit = 20, total = 0) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const totalPages = Math.ceil(total / l) || 1;
  return {
    page: p,
    limit: l,
    offset: (p - 1) * l,
    total,
    totalPages,
    hasNext: p < totalPages,
    hasPrev: p > 1,
  };
};

const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text || '';
  return text.substring(0, length).trim() + '...';
};

const escapeHtml = (text) => {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

module.exports = {
  formatCurrency, formatDate, formatDateShort,
  generateReference, generateInitials, slugify,
  calculateBookingTotals, paginate, truncate, escapeHtml,
};
