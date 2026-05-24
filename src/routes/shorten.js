const express = require("express");
const router = express.Router();
const { query } = require("../db");
const { generateShortCode } = require("../utils/base62");
const redis = require("../redis");

router.post("/", async (req, res) => {
  const { url, expires_in_days } = req.body;

  if (!url) {
    return res.status(400).json({ error: "url is required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const short_code = generateShortCode();

  const expires_at = expires_in_days
    ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
    : null;

  try {
    const userId = req.user?.userId || null;

    const result = await query(
      `INSERT INTO urls (short_code, original_url, user_id, expires_at)
   VALUES ($1, $2, $3, $4)
   RETURNING id, short_code, original_url, created_at, expires_at`,
      [short_code, url, userId, expires_at],
    );

    const row = result.rows[0];

    return res.status(201).json({
      short_code: row.short_code,
      short_url: `${process.env.BASE_URL}/${row.short_code}`,
      original_url: row.original_url,
      expires_at: row.expires_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await query(
      `DELETE FROM urls WHERE short_code = $1 RETURNING short_code`,
      [code],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    await redis.del(`url:${code}`);

    return res.status(200).json({ message: `${code} deleted` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


);

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT short_code, original_url, click_count, created_at, expires_at
       FROM urls
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
