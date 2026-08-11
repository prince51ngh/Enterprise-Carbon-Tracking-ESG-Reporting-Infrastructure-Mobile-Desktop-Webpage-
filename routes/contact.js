/* ═══════════════════════════════════════════════════════════════
   routes/contact.js — Contact Form API
   POST /api/contact  — validate & store contact submission
   GET  /api/contacts — retrieve all submissions (admin)
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/* ── POST /api/contact ───────────────────────── */
router.post('/contact', async (req, res) => {
  try {
    const { rep_name, rep_email, phone, scope, details } = req.body;

    // ── Server-side validation ──
    const errors = [];

    if (!rep_name || rep_name.trim().length < 2) {
      errors.push('Representative name must be at least 2 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rep_email || !emailRegex.test(rep_email.trim())) {
      errors.push('A valid email address is required.');
    }

    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        errors.push('Phone number format is invalid.');
      }
    }

    const validScopes = ['carbon', 'finance', 'both'];
    if (!scope || !validScopes.includes(scope)) {
      errors.push('Please select a valid target objective.');
    }

    if (!details || details.trim().length < 10) {
      errors.push('Operational details must be at least 10 characters.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' '), errors });
    }

    // ── Sanitize & insert into database ──
    const sanitized = {
      rep_name:  rep_name.trim(),
      rep_email: rep_email.trim().toLowerCase(),
      phone:     phone ? phone.trim() : null,
      scope:     scope,
      details:   details.trim()
    };

    const sql = `INSERT INTO contacts (rep_name, rep_email, phone, scope, details) 
                 VALUES (?, ?, ?, ?, ?)`;

    const [result] = await pool.execute(sql, [
      sanitized.rep_name,
      sanitized.rep_email,
      sanitized.phone,
      sanitized.scope,
      sanitized.details
    ]);

    res.status(201).json({
      message: 'Contact submission received successfully.',
      id: result.insertId
    });

  } catch (err) {
    console.error('Contact submission error:', err.message);
    res.status(500).json({ message: 'Server error — please try again later.' });
  }
});

/* ── GET /api/contacts (Admin) ───────────────── */
router.get('/contacts', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    res.json({ count: rows.length, data: rows });
  } catch (err) {
    console.error('Fetch contacts error:', err.message);
    res.status(500).json({ message: 'Server error — please try again later.' });
  }
});

module.exports = router;
