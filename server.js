const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Allowed banner filenames only (no user input; safe whitelist)
const BANNER_FILES = ['banner1.jpg', 'banner2.jpg', 'banner3.jpg', 'banner4.jpg', 'banner5.jpg'];
const BANNERS_DIR = path.join(__dirname, 'public', 'banners');

// Security: helmet
app.use(helmet());

// Rate limit: 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// No directory listing: do not serve static from banners (we serve via endpoint only)
// Optional: serve other static from public if needed
// app.use('/public', express.static(path.join(__dirname, 'public'), { index: false }));

/**
 * GET /email-banner
 * Returns a randomly selected banner image with no-cache headers.
 * Safe for use in email signatures: <img src="https://yourcompany.com/email-banner" width="600">
 */
app.get('/email-banner', (req, res) => {
  const randomIndex = Math.floor(Math.random() * BANNER_FILES.length);
  const filename = BANNER_FILES[randomIndex];
  const filePath = path.join(BANNERS_DIR, filename);

  // Resolve to absolute and ensure it stays inside BANNERS_DIR (path traversal safety)
  const resolvedPath = path.resolve(filePath);
  const resolvedDir = path.resolve(BANNERS_DIR);
  if (!resolvedPath.startsWith(resolvedDir)) {
    res.status(500).send('Server error');
    return;
  }

  if (!fs.existsSync(resolvedPath)) {
    res.status(500).send('Server error');
    return;
  }

  res.set({
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });

  const stream = fs.createReadStream(resolvedPath);
  stream.on('error', () => {
    if (!res.headersSent) res.status(500).send('Server error');
  });
  stream.pipe(res);
});

// Health check (optional, for load balancers)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Email banner API listening on port ${PORT}`);
});
