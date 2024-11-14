const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient'); // Import your Prisma client
const router = express.Router();
const multer = require('multer');
const upload = multer();  // Use the default memory storage for form-data parsing

// Temporary in-memory store for users (use a database in production)
let users = [];
let sessions = {}; // Store user sessions

// POST /users/signup
router.post('/signup', upload.none(), async (req, res) => {
  console.log(req.body);  // Log the form data to debug

  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Save the new user to the database
    const newUser = await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
      },
    });

    // Respond with the new user (omit password for security)
    res.status(201).json({
      user: {
        customer_id: newUser.customer_id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route (POST /users/login)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user
  const user = users.find(user => user.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create session and set it in a cookie
  const sessionId = Date.now().toString();
  sessions[sessionId] = user.username;

  // Set session ID in a cookie (cookie expires in 1 hour)
  res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 3600000 });
  res.status(200).json({ message: "Login successful" });
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

// Get user session route (GET /users/getSession)
router.get('/getSession', (req, res) => {
  const { sessionId } = req.cookies;
  if (!sessions[sessionId]) {
    return res.status(400).json({ message: "Session not found" });
  }

  res.status(200).json({ message: "Session active", username: sessions[sessionId] });
});

module.exports = router;
