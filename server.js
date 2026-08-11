const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ───────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Serve Static Files (HTML, CSS, JS) ──────── */
app.use(express.static(path.join(__dirname)));

/* ── API Routes ──────────────────────────────── */
const contactRoutes   = require('./routes/contact');
const estimatorRoutes = require('./routes/estimator');

app.use('/api', contactRoutes);
app.use('/api', estimatorRoutes);

/* ── Health Check ────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── 404 Handler ─────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ── Global Error Handler ────────────────────── */
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

/* ── Start Server ────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════╗`);
  console.log(`  ║  VerdeLedger Server Running               ║`);
  console.log(`  ║  http://localhost:${PORT}                    ║`);
  console.log(`  ╚══════════════════════════════════════════╝\n`);
});
