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

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Update with your frontend's origin
    credentials: true, // Allow credentials to be included in requests
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bDh833$&$*@hfsdsd',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

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
