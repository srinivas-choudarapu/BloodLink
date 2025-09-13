const mongoose=require("mongoose");
const bcrypt = require("bcryptjs");

const DonorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  gender: String,
  phone: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // Added password field
  bloodGroup: { type: String, required: true },

  // ✅ Who registered this donor
  registeredBy: { 
    type: String, 
    enum: ["Self", "Hospital"], 
    required: true,
    default: "Self"
  },

  // ✅ Hospital ID (only if registeredBy = "Hospital")
  registeredHospitalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Hospital",
    required: function () {
      return this.registeredBy === "Hospital";
    }
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    lastUpdated: { type: Date, default: Date.now }
  },

  history: [
    {
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
      date: { type: Date, default: Date.now }
    }
  ]
});

// Hash password before saving
DonorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports=new mongoose.model("Donar",DonorSchema);