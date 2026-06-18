/* Multer upload configuration - stores to temp, WebP conversion handled post-upload */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadDir = path.join(__dirname, '..', 'public', 'assets', 'uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

const tempDir = path.join(baseUploadDir, 'tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/* Returns uploads/YYYY/MM path, creating dirs as needed */
function getYearMonthDir() {
  const now = new Date();
  const year  = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dir = path.join(baseUploadDir, year, month);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/* Returns relative web path like assets/uploads/2026/06/filename.webp */
function getRelativePath(filename) {
  const now = new Date();
  const year  = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `assets/uploads/${year}/${month}/${filename}`;
}

/* Store originals to temp; caller converts to WebP and moves to year/month dir */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF, SVG) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB (raw; WebP output will be smaller)
});

module.exports = upload;
module.exports.getYearMonthDir = getYearMonthDir;
module.exports.getRelativePath = getRelativePath;
module.exports.baseUploadDir   = baseUploadDir;
