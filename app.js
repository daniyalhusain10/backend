const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Routes
const authRoutes = require('./components/authRoutes');
const adminRoutes = require('./components/adminRoutes');
const productRoutes = require('./components/createUpdateProductRoutes');
const cartRoutes = require('./components/CartRoutes');
const orderRoutes = require('./components/orderRoutes');
const showOrderRoutes = require('./components/showOrderRoutes');
const standardRoutes = require('./components/standardProductsRoutes');

// MongoDB cache for Vercel
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };
async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// CORS
const allowedOrigins = ['http://localhost:5173', 'https://frontend-sigma.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) return callback(new Error('CORS policy does not allow access'), false);
    return callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());

// Multer / file uploads
app.use('/api/products', productRoutes);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Other routes
app.use('/api/standard', standardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/show-orders', showOrderRoutes);

module.exports = { app, dbConnect };
