const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./components/authRoutes');
const adminRoutes = require("./components/adminRoutes");
const productRoutes = require("./components/createUpdateProductRoutes");
const cartRoutes = require("./components/CartRoutes");
const orderRoutes = require("./components/orderRoutes")
const showOrderRoutes = require("./components/showOrderRoutes.js")
const standardRoutes = require("./components/standardProductsRutes.js")
require('dotenv').config();

const port = process.env.PORT || 5000;


let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('🟢 Using existing MongoDB connection');
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
    });
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

// Call connection (Vercel compatible)
connectDB();

const allowedOrigins = [
  'http://localhost:5173', // local dev
'https://fontend-sigma.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true); 
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));




// ✅ 2. Multer/File Upload Routes FIRST
// These must come before generic express.json/urlencoded parsers.
app.use('/api/products', productRoutes); 


// ✅ 3. Generic Body Parsers SECOND
// These parsers will only run on routes *not* handled above (like Auth, Cart, Checkout)
// which expect JSON or URL-encoded data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/standard', standardRoutes);
// ✅ 4. Other Routes
app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/show-orders', showOrderRoutes);


app.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}`);
});

module.exports = app;
