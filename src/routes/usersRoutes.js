const express = require('express');
const router = express.Router();

// Temporary in-memory store for users (use a database in production)
let users = [];
let sessions = {}; // Store user sessions

// Signup route (POST /users/signup)
router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = { username, password }; // In production, hash the password
  users.push(newUser);
  res.status(201).json({ message: "User created successfully", username });
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
