require('dotenv').config();
const express = require('express');
const shortenRouter = require('./routes/shorten');
const redirectRouter = require('./routes/redirect');

const app = express();
app.use(express.json());

app.use('/shorten', shortenRouter);
app.use('/', redirectRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});