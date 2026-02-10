require('dotenv').config();
const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Fix DNS SRV lookup issues on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ownkarma';

console.log('Connecting to MongoDB...');
console.log('URI prefix:', MONGO_URI.substring(0, 30) + '...');

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,  // Force IPv4 — fixes many Windows DNS issues
})
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        console.error('');
        console.error('Common fixes:');
        console.error('  1. Go to MongoDB Atlas → Network Access → Add IP 0.0.0.0/0');
        console.error('  2. Check your internet connection');
        console.error('  3. Verify username/password in .env');
        console.error('');

        // Start server anyway so admin UI can still load (with fallback data)
        app.listen(PORT, () => {
            console.log(`⚠️  Server running on http://localhost:${PORT} (without database)`);
        });
    });
