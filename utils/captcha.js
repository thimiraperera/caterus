/* Captcha verification utility — supports reCAPTCHA v2/v3 and hCaptcha */
const Settings = require('../models/Settings');

async function verifyCaptcha(token) {
  try {
    const [type, secretKey] = await Promise.all([
      Settings.get('captcha_type').catch(() => null),
      Settings.get('captcha_secret_key').catch(() => null),
    ]);
    if (!type || type === 'none' || !secretKey) return true;

    let url;
    if (type === 'recaptcha_v2' || type === 'recaptcha_v3') {
      url = 'https://www.google.com/recaptcha/api/siteverify';
    } else if (type === 'hcaptcha') {
      url = 'https://hcaptcha.com/siteverify';
    } else {
      return true;
    }

    if (!token) return false;

    const body = new URLSearchParams({ secret: secretKey, response: token });
    const res = await fetch(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = await res.json();
    if (type === 'recaptcha_v3') {
      return data.success === true && (data.score || 0) >= 0.5;
    }
    return data.success === true;
  } catch (err) {
    console.error('Captcha verify error:', err.message);
    return false;
  }
}

module.exports = { verifyCaptcha };
