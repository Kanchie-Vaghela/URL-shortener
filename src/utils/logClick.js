const { query } = require('../db');
const geoip = require('geoip-lite');

async function logClick(urlId, req) {
  try {
    const ip = req.ip;
    const ipHash = Buffer.from(ip).toString('base64');
    
    const geo = geoip.lookup(ip);
    const country = geo?.country || null;
    const city = geo?.city || null;

    const referer = req.headers['referer'] || req.headers['referrer'] || null;
    const userAgent = req.headers['user-agent'] || null;

    await query(
      `INSERT INTO clicks (url_id, ip_hash, country, city, referer, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [urlId, ipHash, country, city, referer, userAgent]
    );
  } catch (err) {
    console.error('logClick error', err);
  }
}

module.exports = logClick;