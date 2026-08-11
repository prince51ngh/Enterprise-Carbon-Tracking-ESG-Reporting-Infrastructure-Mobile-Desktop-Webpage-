/* ═══════════════════════════════════════════════════════════════
   routes/estimator.js — Carbon Estimator API
   POST /api/estimate — validate, compute, & store estimation
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

/* ── Emission Factors ────────────────────────── */
const ELECTRICITY_FACTOR = 0.42;   // kg CO₂ per kWh
const FLEET_FACTOR       = 0.404;  // kg CO₂ per mile

/* ── POST /api/estimate ──────────────────────── */
router.post('/estimate', async (req, res) => {
  try {
    const { monthly_power_kwh, fleet_miles, total_co2_kg } = req.body;

    // ── Server-side validation ──
    const errors = [];

    const power = parseFloat(monthly_power_kwh);
    const miles = parseFloat(fleet_miles);

    if (isNaN(power) || power < 0) {
      errors.push('Monthly power (kWh) must be a positive number.');
    }
    if (isNaN(miles) || miles < 0) {
      errors.push('Fleet miles must be a positive number.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' '), errors });
    }

    // ── Compute server-side (don't trust client calculation) ──
    const elecCO2    = power * ELECTRICITY_FACTOR;
    const fleetCO2   = miles * FLEET_FACTOR;
    const computedCO2 = parseFloat((elecCO2 + fleetCO2).toFixed(2));

    // ── Insert into database ──
    const sql = `INSERT INTO estimates (monthly_power_kwh, fleet_miles, total_co2_kg) 
                 VALUES (?, ?, ?)`;

    const [result] = await pool.execute(sql, [power, miles, computedCO2]);

    res.status(201).json({
      message: 'Estimate recorded successfully.',
      id: result.insertId,
      data: {
        monthly_power_kwh: power,
        fleet_miles: miles,
        electricity_co2_kg: parseFloat(elecCO2.toFixed(2)),
        fleet_co2_kg: parseFloat(fleetCO2.toFixed(2)),
        total_co2_kg: computedCO2
      }
    });

  } catch (err) {
    console.error('Estimate submission error:', err.message);
    res.status(500).json({ message: 'Server error — please try again later.' });
  }
});

module.exports = router;
