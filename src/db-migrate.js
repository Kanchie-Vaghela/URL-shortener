require('dotenv').config();
const { query } = require('./db');

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      short_code VARCHAR(20) UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      click_count INTEGER DEFAULT 0
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      url_id INTEGER REFERENCES urls(id) ON DELETE CASCADE,
      clicked_at TIMESTAMPTZ DEFAULT NOW(),
      ip_hash TEXT,
      country TEXT,
      city TEXT,
      referer TEXT,
      user_agent TEXT
    )
  `);

  console.log('Migration done');
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});