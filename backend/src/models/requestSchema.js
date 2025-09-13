const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  bloodGroup: { type: String, required: true },
  units: { type: Number, default: 1 },
  status: { type: String, default: "Open" }, // Open, Accepted, Fulfilled, Cancelled
  createdAt: { type: Date, default: Date.now },
  acceptedDonorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Donor" }]
});

module.exports = mongoose.model("Request", requestSchema);

//we have to run this there is no data for this.