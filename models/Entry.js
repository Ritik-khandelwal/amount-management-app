const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    companyName: {
        type: String, // Reference to the Company model
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    asOfDate: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        enum: ['receivable', 'payable'], // Can be either 'receivable' or 'payable'
        required: true,
    },
    markChecked: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true // To track when the record was created or updated
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
