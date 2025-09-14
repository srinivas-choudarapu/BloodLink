const Donor = require('../models/donarSchema');
const nodemailer = require('nodemailer');
const dotenv=require('dotenv');
dotenv.config();


// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Find donors within a specified radius who match the blood group
 * @param {Object} hospital - Hospital document with location coordinates
 * @param {String} bloodGroup - Required blood group
 * @param {Number} radiusKm - Search radius in kilometers (default: 5)
 * @returns {Promise<Array>} - Array of matching donors
 */
async function findNearbyDonors(hospital, bloodGroup, radiusKm = 5) {
  // Convert km to radians (Earth radius is approximately 6371 km)
  const radiusInRadians = radiusKm / 6371;

  try {
    // Find donors with matching blood group within the radius
    const donors = await Donor.find({
      bloodGroup,
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [hospital.location.coordinates, radiusInRadians]
        }
      }
    });
    
    return donors;
  } catch (error) {
    console.error('Error finding nearby donors:', error);
    return [];
  }
}

/**
 * Send email notification to a donor
 * @param {Object} donor - Donor document
 * @param {Object} hospital - Hospital document
 * @param {Object} request - Blood request document
 * @returns {Promise<Boolean>} - Success status
 */
async function sendEmailNotification(donor, hospital, request) {
  if (!donor.email) return false;
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: donor.email,
      subject: `Urgent: Blood Donation Request for ${request.bloodGroup}`,
      html: `
        <h2>Urgent Blood Donation Request</h2>
        <p>Dear ${donor.name},</p>
        <p>${hospital.name} urgently needs ${request.bloodGroup} blood donation.</p>
        <p><strong>Location:</strong> ${hospital.address}</p>
        <p><strong>Contact:</strong> ${hospital.phone}</p>
        <p>Please respond as soon as possible if you can help.</p>
        <p>Thank you for being a lifesaver!</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${donor.email}`);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Notify nearby donors about a blood request
 * @param {Object} request - Blood request document
 * @param {Object} hospital - Hospital document
 * @returns {Promise<Object>} - Notification results
 */
async function notifyNearbyDonors(request, hospital) {
  const results = {
    totalDonors: 0,
    emailsSent: 0
  };

  try {
    // Find nearby donors matching the blood group
    const donors = await findNearbyDonors(hospital, request.bloodGroup);
    results.totalDonors = donors.length;
    
    // Send notifications to each donor
    for (const donor of donors) {
      // Send email notification
      const emailSent = await sendEmailNotification(donor, hospital, request);
      if (emailSent) results.emailsSent++;
    }
    
    console.log(`Notification results for request ${request._id}:`, results);
    return results;
  } catch (error) {
    console.error('Error notifying donors:', error);
    return results;
  }
}

module.exports = {
  notifyNearbyDonors,
  findNearbyDonors,
  sendEmailNotification
};