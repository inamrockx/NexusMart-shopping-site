const express = require('express');
const router = express.Router();
const User = require('../models/User');

// User Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user without password
    const userResponse = { ...user };
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Registration
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser = User.create({
      name,
      email,
      password,
      role: 'customer'
    });

    const userResponse = { ...newUser };
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Address / Settings
router.put('/:id', (req, res) => {
  try {
    const { name, address, cart } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (cart !== undefined) updates.cart = cart;

    const updated = User.findByIdAndUpdate(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    const userResponse = { ...updated };
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
