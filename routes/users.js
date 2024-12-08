const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login a user (with company selection)
router.post('/login', async (req, res) => {
  const { username, password, company } = req.body;

  try {
    const user = await User.findOne({ username, company });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or company selection' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username, company: user.company }, 'your-secret-key', {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

module.exports = router;
