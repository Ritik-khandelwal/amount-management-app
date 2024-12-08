const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// Get amounts receivable for a specific company
router.get('/companies/:companyName/receivables', async (req, res) => {
    try {
        const companyName = req.params.companyName;
        const receivables = await Entry.find({ companyName: companyName, type: 'receivable' });
        res.json(receivables);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get amounts payable for a specific company
router.get('/companies/:companyName/payables', async (req, res) => {
    try {
        const companyName = req.params.companyName;
        const payables = await Entry.find({ companyName: companyName, type: 'payable' });
        res.json(payables);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
