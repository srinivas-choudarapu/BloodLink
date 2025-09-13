const express = require('express');
const router = express.Router();
const Donor = require('../models/donarSchema');
const Hospital = require('../models/hospitalSchema');
const jwt = require('jsonwebtoken');

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
    const { email, phone, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    // Build query dynamically
    const query = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;
    const donor = await Donor.findOne(query);
    if (!donor) return res.status(404).json({ error: 'Donor not found with provided credentials' });
    if (!donor.password) {
      return res.status(400).json({ error: 'Donor does not have a password set. Please register again.' });
    }
    const isMatch = await donor.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
    // Generate JWT
    const token = jwt.sign(
      { id: donor._id, type: 'donor', email: donor.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
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
    const { email, phone, licenseId, password } = req.body;
    const hospital = await Hospital.findOne({ $or: [{ email }, { phone }, { licenseId }] });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    if (!password) return res.status(400).json({ error: 'Password is required' });
    const isMatch = await hospital.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
    // Generate JWT
    const token = jwt.sign(
      { id: hospital._id, type: 'hospital', email: hospital.email, licenseId: hospital.licenseId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ message: 'Login successful', hospital });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
