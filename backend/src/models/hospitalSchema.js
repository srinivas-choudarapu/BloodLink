const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseId: { type: String, required: true, unique: true }, // Unique License/Registration Number
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true }, // Added password field
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

// Hash password before saving
HospitalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Hospital", HospitalSchema);
