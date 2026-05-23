const express = require('express');
const router = express.Router();
const { query } = require('../db');
const redis = require('../redis');
const logClick = require('../utils/logClick');

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const cached = await redis.get(`url:${code}`);

    if (cached) {
      const urlResult = await query(
        `UPDATE urls SET click_count = click_count + 1 
         WHERE short_code = $1 
         RETURNING id`,
        [code]
      );
      logClick(urlResult.rows[0].id, req);
      return res.redirect(302, cached);
    }

    const result = await query(
      `UPDATE urls SET click_count = click_count + 1
       WHERE short_code = $1
       RETURNING id, original_url, expires_at`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const { id, original_url, expires_at } = result.rows[0];

    if (expires_at && new Date(expires_at) < new Date()) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    await redis.set(`url:${code}`, original_url, 'EX', 3600);

    logClick(id, req);

    return res.redirect(302, original_url);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;