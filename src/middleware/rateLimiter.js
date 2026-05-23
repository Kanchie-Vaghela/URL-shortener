const redis = require('../redis');

const WINDOW_SIZE_SECONDS = 60;
const MAX_REQUESTS = 10;

async function rateLimiter(req, res, next) {
  const ip = req.ip;
  const key = `rate:${ip}`;
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE_SECONDS * 1000;

  try {
    const pipeline = redis.pipeline();

    pipeline.zremrangebyscore(key, '-inf', windowStart);
    pipeline.zadd(key, now, `${now}`);
    pipeline.zcard(key);
    pipeline.expire(key, WINDOW_SIZE_SECONDS);

    const results = await pipeline.exec();
    const requestCount = results[2][1];

    if (requestCount > MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Too many requests, slow down',
        retry_after_seconds: WINDOW_SIZE_SECONDS,
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter error', err);
    next();
  }
}

module.exports = rateLimiter;