const mongoose = require("mongoose");

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseId: { type: String, required: true, unique: true }, // Unique License/Registration Number
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  donors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Donor" }]
});

module.exports = mongoose.model("Hospital", HospitalSchema);
