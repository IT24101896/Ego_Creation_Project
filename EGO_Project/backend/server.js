const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://10.73.229.142:3000', 'exp://192.168.56.1:8081'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customs', require('./routes/customizationRoutes'));
app.use('/api/custom-requests', require('./routes/customRequestRoutes'));
app.use('/api/promos', require('./routes/promoRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));

// Static Folders
app.use('/uploads', express.static('uploads'));

// Root Endpoint
app.get('/', (req, res) => {
    res.send('EGO Personalized E-Commerce API is running...');
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
    });