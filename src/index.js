require('dotenv').config();
const express = require('express');
const shortenRouter = require('./routes/shorten');
const redirectRouter = require('./routes/redirect');
const analyticsRouter = require('./routes/analytics');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
app.use(express.json());

app.use('/shorten', shortenRouter);
app.use('/analytics', analyticsRouter);
app.use('/', rateLimiter, redirectRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});