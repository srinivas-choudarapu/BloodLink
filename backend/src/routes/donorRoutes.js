const express = require('express');
const router = express.Router();
const Donor = require('../models/donarSchema');
const Hospital = require('../models/hospitalSchema');
const Request = require('../models/requestSchema');
const DonorHistory = require('../models/donarHistorySchema');
const authMiddleware = require('../middleware/authMiddleware');

// Check donor eligibility and get blood requests within 5km radius
router.get('/requests/nearby', authMiddleware, async (req, res) => {
  try {
    // Get donor's location and blood group
    const donor = await Donor.findById(req.user.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    if (!donor.location || !donor.location.coordinates) {
      return res.status(400).json({ error: 'Donor location not set. Please update your location first.' });
    }

    // Check if donor is eligible (last donation was more than 3 months ago)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const lastDonation = await DonorHistory.findOne({
      donorId: donor._id,
      verified: true // Only count verified donations
    }).sort({ donationDate: -1 });

    let isEligible = true;
    let eligibilityMessage = '';

    if (lastDonation && lastDonation.donationDate > threeMonthsAgo) {
      isEligible = false;
      const nextEligibleDate = new Date(lastDonation.donationDate);
      nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);
      eligibilityMessage = `You are not eligible to donate. Last donation was on ${lastDonation.donationDate.toDateString()}. Next eligible date: ${nextEligibleDate.toDateString()}`;
    }

    // If not eligible, return eligibility status
    if (!isEligible) {
      return res.json({
        message: eligibilityMessage,
        isEligible: false,
        lastDonationDate: lastDonation.donationDate,
        nextEligibleDate: new Date(lastDonation.donationDate.getTime() + (3 * 30 * 24 * 60 * 60 * 1000)),
        requests: []
      });
    }

    // Find hospitals within 5km radius
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: donor.location.coordinates
          },
          $maxDistance: 5000 // 5km in meters
        }
      }
    });

    if (hospitals.length === 0) {
      return res.json({ 
        message: 'No hospitals found within 5km radius',
        isEligible: true,
        requests: []
      });
    }

    // Get hospital IDs
    const hospitalIds = hospitals.map(hospital => hospital._id);

    // Find all open requests from these hospitals
    const allRequests = await Request.find({
      hospitalId: { $in: hospitalIds },
      status: 'Open'
    }).populate('hospitalId', 'name address phone email location')
      .sort({ createdAt: -1 }); // Most recent first

    // Filter requests by blood group compatibility
    const compatibleRequests = allRequests.filter(request => {
      return isBloodGroupCompatible(donor.bloodGroup, request.bloodGroup);
    });

    res.json({
      message: 'Nearby blood requests retrieved successfully',
      isEligible: true,
      donorBloodGroup: donor.bloodGroup,
      donorLocation: donor.location.coordinates,
      lastDonationDate: lastDonation ? lastDonation.donationDate : null,
      requests: compatibleRequests
    });

  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept or reject a blood request
router.post('/requests/:requestId/accept', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const donorId = req.user.id;

    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be either "accept" or "reject"' });
    }

    // Check if donor is eligible (last donation was more than 3 months ago)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const lastDonation = await DonorHistory.findOne({
      donorId: donorId,
      verified: true // Only count verified donations
    }).sort({ donationDate: -1 });

    if (action === 'accept' && lastDonation && lastDonation.donationDate > threeMonthsAgo) {
      const nextEligibleDate = new Date(lastDonation.donationDate);
      nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);
      return res.status(400).json({ 
        error: 'You are not eligible to donate. Last donation was less than 3 months ago.',
        lastDonationDate: lastDonation.donationDate,
        nextEligibleDate: nextEligibleDate
      });
    }

    // Check if donor has already accepted another request
    if (action === 'accept') {
      const existingAcceptedRequest = await Request.findOne({
        acceptedDonorIds: donorId,
        status: { $in: ['Open', 'Accepted'] }
      });

      if (existingAcceptedRequest) {
        return res.status(400).json({ 
          error: 'You can only accept one request at a time. Please reject your current request first.',
          currentRequestId: existingAcceptedRequest._id
        });
      }
    }

    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Open') {
      return res.status(400).json({ error: 'Request is no longer open' });
    }

    // Check if donor is already in the accepted list
    const alreadyAccepted = request.acceptedDonorIds.includes(donorId);

    if (action === 'accept') {
      if (alreadyAccepted) {
        return res.status(400).json({ error: 'You have already accepted this request' });
      }

      // Add donor to accepted donors list
      request.acceptedDonorIds.push(donorId);
      
      // Check if we have enough donors (each donor donates 1 unit)
      if (request.acceptedDonorIds.length >= request.units) {
        request.status = 'Accepted';
      }

      await request.save();

      res.json({
        message: 'Request accepted successfully',
        request: request,
        status: request.status,
        acceptedDonors: request.acceptedDonorIds.length,
        requiredUnits: request.units
      });

    } else if (action === 'reject') {
      if (!alreadyAccepted) {
        return res.status(400).json({ error: 'You have not accepted this request' });
      }

      // Remove donor from accepted donors list
      request.acceptedDonorIds = request.acceptedDonorIds.filter(id => id.toString() !== donorId.toString());
      
      // If we no longer have enough donors, change status back to Open
      if (request.acceptedDonorIds.length < request.units && request.status === 'Accepted') {
        request.status = 'Open';
      }

      await request.save();

      res.json({
        message: 'Request rejected successfully',
        request: request,
        status: request.status,
        acceptedDonors: request.acceptedDonorIds.length,
        requiredUnits: request.units
      });
    }

  } catch (error) {
    console.error('Error processing request action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get donor's donation history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const donorId = req.user.id;

    // Get donor's donation history
    const donationHistory = await DonorHistory.find({
      donorId: donorId
    }).populate('hospitalId', 'name address phone email')
      .populate('requestId', 'bloodGroup units createdAt')
      .sort({ donationDate: -1 }); // Most recent first

    // Get donor info
    const donor = await Donor.findById(donorId).select('name bloodGroup');

    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Calculate statistics
    const totalDonations = donationHistory.length;
    const verifiedDonations = donationHistory.filter(donation => donation.verified).length;
    const totalUnits = donationHistory.reduce((sum, donation) => sum + donation.units, 0);

    res.json({
      message: 'Donation history retrieved successfully',
      donor: {
        name: donor.name,
        bloodGroup: donor.bloodGroup
      },
      statistics: {
        totalDonations: totalDonations,
        verifiedDonations: verifiedDonations,
        pendingVerification: totalDonations - verifiedDonations,
        totalUnits: totalUnits
      },
      history: donationHistory
    });

  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get donor's profile details
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const donorId = req.user.id;

    // Get donor's profile (excluding password)
    const donor = await Donor.findById(donorId).select('-password');

    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    // Get donation statistics
    const donationStats = await DonorHistory.aggregate([
      { $match: { donorId: donor._id } },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          verifiedDonations: { $sum: { $cond: ['$verified', 1, 0] } },
          totalUnits: { $sum: '$units' },
          lastDonationDate: { $max: '$donationDate' }
        }
      }
    ]);

    const stats = donationStats[0] || {
      totalDonations: 0,
      verifiedDonations: 0,
      totalUnits: 0,
      lastDonationDate: null
    };

    res.json({
      message: 'Profile retrieved successfully',
      profile: {
        _id: donor._id,
        name: donor.name,
        age: donor.age,
        gender: donor.gender,
        phone: donor.phone,
        email: donor.email,
        bloodGroup: donor.bloodGroup,
        location: donor.location,
        history: donor.history
      },
      statistics: {
        totalDonations: stats.totalDonations,
        verifiedDonations: stats.verifiedDonations,
        pendingVerification: stats.totalDonations - stats.verifiedDonations,
        totalUnits: stats.totalUnits,
        lastDonationDate: stats.lastDonationDate
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update donor's profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const donorId = req.user.id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated through this route
    delete updates.password;
    delete updates._id;
    delete updates.history; // History should be managed through donation process

    // Validate location if provided
    if (updates.location) {
      if (updates.location.coordinates && updates.location.coordinates.length === 2) {
        const [longitude, latitude] = updates.location.coordinates;
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          return res.status(400).json({ error: 'Invalid coordinates' });
        }
        updates.location.type = 'Point';
        updates.location.lastUpdated = new Date();
      } else {
        return res.status(400).json({ error: 'Location coordinates must be [longitude, latitude]' });
      }
    }

    // Update donor profile
    const updatedDonor = await Donor.findByIdAndUpdate(
      donorId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedDonor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: {
        _id: updatedDonor._id,
        name: updatedDonor.name,
        age: updatedDonor.age,
        gender: updatedDonor.gender,
        phone: updatedDonor.phone,
        email: updatedDonor.email,
        bloodGroup: updatedDonor.bloodGroup,
        location: updatedDonor.location,
        history: updatedDonor.history
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check blood group compatibility
function isBloodGroupCompatible(donorBloodGroup, requestBloodGroup) {
  const compatibility = {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  };

  return compatibility[donorBloodGroup]?.includes(requestBloodGroup) || false;
}

module.exports = router;