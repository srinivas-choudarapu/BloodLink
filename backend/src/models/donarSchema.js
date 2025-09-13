const mongoose=require("mongoose");

const DonorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  gender: String,
  phone: { type: String, required: true },
  email: { type: String, required: true },
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

module.exports=new mongoose.model("Donar",DonorSchema);