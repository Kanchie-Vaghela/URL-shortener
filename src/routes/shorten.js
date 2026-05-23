const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { generateShortCode } = require('../utils/base62');

router.post('/', async (req, res) => {
  const { url, expires_in_days } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const short_code = generateShortCode();

  const expires_at = expires_in_days
    ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
    : null;

  try {
    const result = await query(
      `INSERT INTO urls (short_code, original_url, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, short_code, original_url, created_at, expires_at`,
      [short_code, url, expires_at]
    );

    const row = result.rows[0];

    return res.status(201).json({
      short_code: row.short_code,
      short_url: `http://localhost:${process.env.PORT || 3000}/${row.short_code}`,
      original_url: row.original_url,
      expires_at: row.expires_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;