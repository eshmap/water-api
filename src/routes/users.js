const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

let users = [];
let sessions = {}; // Store user sessions

// POST /users/signup
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body; // Access form data

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await prisma.customer.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

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


// POST /users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Access form data

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.customer.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    return res.status(200).json({ email: user.email });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


// Logout route (POST /users/logout)
router.post('/logout', (req, res) => {
  const { sessionId } = req.cookies;
  if (!sessions[sessionId]) {
    return res.status(400).json({ message: "Session not found" });
  }

  delete sessions[sessionId]; // Destroy the session
  res.clearCookie('sessionId');  // Clear the cookie
  res.status(200).json({ message: "Logged out successfully" });
});

router.get('/getSession', (req, res) => {
  const { sessionId } = req.cookies;
  if (!sessions[sessionId]) {
    return res.status(400).json({ message: "Session not found" });
  }

  res.status(200).json({ message: "Session active", username: sessions[sessionId] });
});

module.exports = router;
