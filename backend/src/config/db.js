const mongoose = require("mongoose");
const dotenv = require("dotenv");




dotenv.config();   // loads .env


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;   // <-- export for reuse
