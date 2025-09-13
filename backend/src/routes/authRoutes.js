const express = require('express');
const router = express.Router();
const Donor = require('../models/donarSchema');
const Hospital = require('../models/hospitalSchema');

// Donor registration
router.post('/register/donor', async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json({ message: 'Donor registered successfully', donor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Donor login
router.post('/login/donor', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const donor = await Donor.findOne({ $or: [{ email }, { phone }] });
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    res.json({ message: 'Login successful', donor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Hospital registration
router.post('/register/hospital', async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json({ message: 'Hospital registered successfully', hospital });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Hospital login
router.post('/login/hospital', async (req, res) => {
  try {
    const { email, phone, licenseId } = req.body;
    const hospital = await Hospital.findOne({ $or: [{ email }, { phone }, { licenseId }] });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json({ message: 'Login successful', hospital });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
