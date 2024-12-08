const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Handle user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });  // Use return to prevent further responses
    }

    // Check if the password matches
    const isMatch = await admin.matchPassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });  // Again, return here
    }

    // Return a success message and token (assuming you generate a JWT)
    const token = 'dummy-token';  // You can generate a real JWT here if needed
    res.status(200).redirect(`/admin/dashboard`);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
