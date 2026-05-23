const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const urlResult = await query(
      `SELECT id, short_code, original_url, click_count, created_at, expires_at
       FROM urls
       WHERE short_code = $1`,
      [code]
    );

    if (urlResult.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const url = urlResult.rows[0];

    const clicksByDay = await query(
      `SELECT 
         DATE(clicked_at) AS day,
         COUNT(*) AS clicks
       FROM clicks
       WHERE url_id = $1
       GROUP BY DATE(clicked_at)
       ORDER BY day ASC`,
      [url.id]
    );

    const topCountries = await query(
      `SELECT 
         country,
         COUNT(*) AS clicks
       FROM clicks
       WHERE url_id = $1
         AND country IS NOT NULL
       GROUP BY country
       ORDER BY clicks DESC
       LIMIT 5`,
      [url.id]
    );

    const topReferrers = await query(
      `SELECT 
         referer,
         COUNT(*) AS clicks
       FROM clicks
       WHERE url_id = $1
         AND referer IS NOT NULL
       GROUP BY referer
       ORDER BY clicks DESC
       LIMIT 5`,
      [url.id]
    );

    return res.status(200).json({
      short_code: url.short_code,
      original_url: url.original_url,
      total_clicks: url.click_count,
      created_at: url.created_at,
      expires_at: url.expires_at,
      clicks_by_day: clicksByDay.rows,
      top_countries: topCountries.rows,
      top_referrers: topReferrers.rows,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;