const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const path = require('path');
const cors = require('cors');

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


// Routes
// app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/companies'));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
