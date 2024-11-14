const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');  // Import cookie-parser
const usersRoutes = require('./routes/usersRoutes');
const productsRoutes = require('./routes/productsRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());  // Use cookie-parser middleware

// Routes
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Water API!');
});

module.exports = app;
