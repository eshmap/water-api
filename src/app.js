const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const users = require('./routes/users'); // Import the user routes (make sure the file name is correct)
// const water = require('./routes/water'); // Import products routes

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Use cookie-parser middleware for handling cookies

// Routes
app.use('/users', users); // Use users route for /users endpoints
// app.use('/products', water); // Use products route for /products endpoints

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Water API!');
});

module.exports = app; // Export app to be used in your server.js or main entry file
