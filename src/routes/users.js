const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passwordValidator = require('password-validator');

const router = express.Router();

// Set up the password schema
const passwordSchema = new passwordValidator();

// Define password rules
passwordSchema
    .is().min(8)                                     // Minimum length 8
    .is().max(20)                                    // Maximum length 20
    .has().uppercase()                               // Must have at least 1 uppercase letter
    .has().lowercase()                               // Must have at least 1 lowercase letter
    .has().digits()                                  // Must have at least 1 digit
    .has().not().spaces();                           // No spaces allowed

let users = [];
let sessions = {}; // Store user sessions

// POST /users/signup
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body; // Access form data

  // Check if any fields are missing
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Validate the password with the schema
  const isPasswordValid = passwordSchema.validate(password);

  if (!isPasswordValid) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number, and must not contain spaces.',
    });
  }

  try {
    const existingUser = await prisma.customer.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.customer.create({
      data: {
        email: email,
        password: hashedPassword,
        first_name: first_name,
        last_name: last_name,
      },
    });

    return res.status(201).json({ email: newUser.email });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Find the user by email
    const user = await prisma.customer.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // Add user data to session
    req.session.user = {
      customer_id: user.customer_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    res.status(200).json({
      message: 'Login successful',
      user: req.session.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Logout route
router.post('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to log out' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ message: 'Logout successful' });
    });
  } else {
    res.status(401).json({ error: 'No user logged in' });
  }
});

// Get session route
router.get('/getSession', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

module.exports = router;
