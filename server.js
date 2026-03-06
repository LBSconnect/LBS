'use strict';

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

// Serve static files from repo root
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LBS server listening on port ${PORT}`);
  });
}

module.exports = app;
