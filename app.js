const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const path = require('path');
const cors = require('cors');
const Entry = require("./models/Entry");

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(cors());
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route for login page (user/owner login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/user/login.html'));
});

app.get('/dashboard/:companyName', (req, res) => {
    const companyName = req.params.companyName;
    res.sendFile(path.join(__dirname, 'views', 'user', 'dashboard.html')); // Serve static HTML file
  });

// Admin Login Page Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'login.html'));
});

// Admin dashboard Page Route
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/admin/:companyName', (req, res) => {
    const companyName = req.params.companyName;
    res.sendFile(path.join(__dirname, 'views', 'admin', 'individual_company.html')); // Serve static HTML file
});

app.post('/api/companies/:companyName/entries', async (req, res) => {
    try {
        const { companyName } = req.params;
        const { name, amount, asOfDate, type } = req.body;

        const newEntry = new Entry({ companyName, name, amount, asOfDate, type });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error creating entry', error });
    }
});

app.put('/api/companies/:companyName/entries/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;
        const updates = req.body;

        const updatedEntry = await Entry.findByIdAndUpdate(entryId, updates, { new: true });
        if (!updatedEntry) return res.status(404).json({ message: 'Entry not found' });

        res.json(updatedEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error updating entry', error });
    }
});

app.delete('/api/companies/:companyName/entries/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;

        const deletedEntry = await Entry.findByIdAndDelete(entryId);
        if (!deletedEntry) return res.status(404).json({ message: 'Entry not found' });

        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting entry', error });
    }
});

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/companies'));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
