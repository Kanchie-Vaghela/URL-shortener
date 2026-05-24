require('dotenv').config();
const express = require('express');
const shortenRouter = require('./routes/shorten');
const redirectRouter = require('./routes/redirect');
const analyticsRouter = require('./routes/analytics');
const authRouter = require('./routes/auth');
const rateLimiter = require('./middleware/rateLimiter');
const authenticate = require('./middleware/authenticate');


const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

app.use('/auth', authRouter);
app.use('/shorten', authenticate, shortenRouter);
app.use('/analytics', analyticsRouter);
app.use('/', rateLimiter, redirectRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const path = require('path');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});