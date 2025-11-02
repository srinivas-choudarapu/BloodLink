const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Request = require('../models/requestSchema');
const Hospital = require('../models/hospitalSchema');
const Donor = require('../models/donarSchema');

// Hospital creates a blood request (protected route)
router.post('/request', authMiddleware, async (req, res) => {
  try {
    // Only allow hospitals
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can create blood requests' });
    }
    const { bloodGroup, units } = req.body;
    if (!bloodGroup) {
      return res.status(400).json({ error: 'bloodGroup is required' });
    }
    const request = new Request({
      hospitalId: req.user.id,
      bloodGroup,
      units: units || 1
    });
    await request.save();
    
    // Get hospital details for notifications
    const hospital = await Hospital.findById(req.user.id);
    
    // Send notifications to nearby donors
    const { notifyNearbyDonors } = require('../utils/notifier');
    notifyNearbyDonors(request, hospital);
    
    res.status(201).json({ message: 'Blood request created', request });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Notify nearby donors endpoint
router.post('/notify-donors', authMiddleware, async (req, res) => {
  try {
    const { bloodType } = req.body;
    
    if (!bloodType) {
      return res.status(400).json({ error: 'Blood type is required' });
    }

    // Get hospital information
    const hospitalId = req.user.id;
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Find donors with matching blood type
    // In a real application, you would also filter by location proximity
    const donors = await Donor.find({ bloodGroup: bloodType });

    // In a real application, you would send actual notifications
    // This could be via email, SMS, push notifications, etc.
    // For now, we'll just return the count of notified donors

    return res.status(200).json({
      message: `${donors.length} donors with ${bloodType} blood type have been notified`,
      notifiedCount: donors.length
    });
  } catch (error) {
    console.error('Error notifying donors:', error);
    return res.status(500).json({ error: 'Failed to notify donors' });
  }
});

// Get all requests made by the logged-in hospital
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can view their requests' });
    }
    const requests = await Request.find({ hospitalId: req.user.id }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a specific request (only by the hospital who created it)
router.patch('/request/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can update requests' });
    }
    const { id } = req.params;
    // Only allow update if the request belongs to this hospital
    const request = await Request.findOne({ _id: id, hospitalId: req.user.id });
    if (!request) {
      return res.status(404).json({ error: 'Request not found or not owned by this hospital' });
    }
    // Allow updating status, units, or bloodGroup
    const { status, units, bloodGroup } = req.body;
    if (status) request.status = status;
    if (units) request.units = units;
    if (bloodGroup) request.bloodGroup = bloodGroup;
    await request.save();
    res.json({ message: 'Request updated', request });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete all requests made by the logged-in hospital
router.delete('/requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can delete their requests' });
    }
    const result = await Request.deleteMany({ hospitalId: req.user.id });
    res.json({ message: 'All requests deleted', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a specific request by id (only if owned by the hospital)
router.delete('/request/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can delete requests' });
    }
    const { id } = req.params;
    const request = await Request.findOneAndDelete({ _id: id, hospitalId: req.user.id });
    if (!request) {
      return res.status(404).json({ error: 'Request not found or not owned by this hospital' });
    }
    res.json({ message: 'Request deleted', request });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get summary of requests by status for the logged-in hospital
router.get('/requests/summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can view their request summary' });
    }
    const summary = await Request.aggregate([
      { $match: { hospitalId: req.user.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    // Format result as { Open: n, Fulfilled: n, Cancelled: n }
    const result = { Open: 0, Fulfilled: 0, Cancelled: 0 };
    summary.forEach(item => {
      if (item._id === 'Open') result.Open = item.count;
      if (item._id === 'Fulfilled') result.Fulfilled = item.count;
      if (item._id === 'Cancelled') result.Cancelled = item.count;
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all requests by status for the logged-in hospital
router.get('/requests/status/:status', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can view their requests' });
    }
    const { status } = req.params;
    const allowedStatuses = ['Open', 'Fulfilled', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const requests = await Request.find({ hospitalId: req.user.id, status }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get hospital profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can access their profile' });
    }
    const hospital = await Hospital.findById(req.user.id).select('-password');
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json({ hospital });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update hospital profile (protected route)
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can update their profile' });
    }
    const { name, address, phone, email, location, password } = req.body;
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    // Update fields if provided
    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (phone) hospital.phone = phone;
    if (email) hospital.email = email;
    if (location) hospital.location = location;
    if (password) hospital.password = password; // Will be hashed by pre-save hook
    await hospital.save();
    // Return updated profile without password
    const updatedHospital = await Hospital.findById(req.user.id).select('-password');
    res.json({ message: 'Profile updated', hospital: updatedHospital });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get unique donors who have donated at this hospital with donation count
router.get('/donors', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Only hospitals can view their donors' });
    }
    const DonorHistory = require('../models/donarHistorySchema');
    const donors = await DonorHistory.aggregate([
      { $match: { hospitalId: req.user.id } },
      {
        $group: {
          _id: '$donorId',
          donationCount: { $sum: 1 },
          lastDonation: { $max: '$donationDate' },
          totalUnits: { $sum: '$units' }
        }
      },
      {
        $lookup: {
          from: 'donars',
          localField: '_id',
          foreignField: '_id',
          as: 'donorInfo'
        }
      },
      {
        $unwind: '$donorInfo'
      },
      {
        $project: {
          donorId: '$_id',
          name: '$donorInfo.name',
          email: '$donorInfo.email',
          phone: '$donorInfo.phone',
          bloodGroup: '$donorInfo.bloodGroup',
          donationCount: 1,
          lastDonation: 1,
          totalUnits: 1
        }
      },
      { $sort: { donationCount: -1 } }
    ]);
    res.json({ donors });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

