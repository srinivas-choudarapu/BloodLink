
// require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require("dotenv");
dotenv.config();   // loads .env


const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});