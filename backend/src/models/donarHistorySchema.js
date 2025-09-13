const mongoose = require("mongoose");

const donorHistorySchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  bloodGroup: String,
  donationDate: { type: Date, default: Date.now },
  units: { type: Number, default: 1 },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DonorHistory", donorHistorySchema);
//data has to be inserted