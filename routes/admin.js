const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin'); // Admin model
const bcrypt = require('bcryptjs');
const Company = require('../models/Company'); // Company model

// Handle admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Simulating a token (JWT implementation can be added here)
    const token = 'dummy-token'; // Replace with JWT generation logic if needed

    // Successful login, redirect to admin dashboard
    res.status(200).redirect("/admin/dashboard");
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ companies });
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// Add a new company
router.post('/companies', async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCompany = new Company({ name, description });
    await newCompany.save();
    res.status(201).json({ message: 'Company created successfully', company: newCompany });
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ message: 'Failed to create company' });
  }
});

// Update a company
router.put('/companies/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedCompany = await Company.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company updated successfully', company: updatedCompany });
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ message: 'Failed to update company' });
  }
});

// Delete a company
router.delete('/companies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCompany = await Company.findByIdAndDelete(id);
    if (!deletedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ message: 'Failed to delete company' });
  }
});

module.exports = router;
