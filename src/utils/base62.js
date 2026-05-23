const { nanoid } = require('nanoid');

function generateShortCode() {
  return nanoid(7);
}

module.exports = { generateShortCode };