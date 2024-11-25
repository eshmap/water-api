const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const purchaseRoutes = require('./routes/purchases');
const session = require('express-session');

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true })); 
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(express.static('public'));

// Routes
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);
app.use('/purchase', purchaseRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Water API!');
});

module.exports = app;
