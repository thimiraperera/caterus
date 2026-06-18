/* Convert a temp-uploaded image to WebP, save to year/month dir, delete temp */
const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');
const { getYearMonthDir, getRelativePath } = require('../middleware/upload');

const MAX_DIM = 1600; // max width or height for general uploads

async function convertToWebp(tempFilePath, opts = {}) {
  const { maxWidth = MAX_DIM, maxHeight = MAX_DIM, quality = 82, fit = 'inside' } = opts;

  const ext = path.extname(tempFilePath).toLowerCase();
  if (ext === '.svg') {
    // SVGs don't need conversion; just move to year/month dir
    const basename = path.basename(tempFilePath, ext) + '.svg';
    const destDir  = getYearMonthDir();
    const destPath = path.join(destDir, basename);
    fs.renameSync(tempFilePath, destPath);
    return getRelativePath(basename);
  }

  const outBase = path.basename(tempFilePath, ext) + '.webp';
  const destDir  = getYearMonthDir();
  const destPath = path.join(destDir, outBase);

  await sharp(tempFilePath)
    .resize(maxWidth, maxHeight, { fit, withoutEnlargement: true })
    .webp({ quality })
    .toFile(destPath);

  fs.unlink(tempFilePath, () => {});

  return getRelativePath(outBase);
}

module.exports = convertToWebp;
