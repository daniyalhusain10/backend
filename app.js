const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./components/authRoutes');
const adminRoutes = require('./components/adminRoutes');
const productRoutes = require('./components/createUpdateProductRoutes');
const cartRoutes = require('./components/CartRoutes');
const orderRoutes = require('./components/orderRoutes');
const showOrderRoutes = require('./components/showOrderRoutes');
const standardRoutes = require('./components/standardProductsRoutes'); // fixed typo
require('dotenv').config();

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://fontend-sigma.vercel.app' // production frontend
];

// CORS setup
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, curl
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy does not allow access from this origin'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(cookieParser());

// Multer / File Upload Routes FIRST
app.use('/api/products', productRoutes);

// Generic body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Other routes
app.use('/api/standard', standardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/show-orders', showOrderRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Export app for Vercel serverless function
module.exports = app;
