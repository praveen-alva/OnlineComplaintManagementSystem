const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { name, email, password, type } = req.body;

    if (!name || !email || !password || !type) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: 'Email already in use'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      type
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created',
      user: {
        name: newUser.name,
        email: newUser.email,
        type: newUser.type
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        type: user.type
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});



module.exports = router;
