
// require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require("dotenv");
dotenv.config();   // loads .env
const authRoute = require('./routes/authRoutes');
const hospitalRoute = require("./routes/hospitalRoutes.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth",authRoute);
app.use("/api/hospital/",hospitalRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});