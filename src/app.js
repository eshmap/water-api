const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');

dotenv.config();

const app = express();
const upload = multer(); // Set up multer (default memory storage)

// Use middlewares
app.use(cors());
app.use(cookieParser()); // If you need cookies in your app
app.use(express.json()); // For handling JSON requests
app.use(express.urlencoded({ extended: true })); // Handle URL-encoded data

// Global form-data handling middleware
app.use(upload.none()); // This allows us to handle form data fields

app.use(express.static('public'));

// Routes
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Water API!');
});

module.exports = app;
