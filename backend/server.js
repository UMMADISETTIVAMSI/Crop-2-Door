const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    
    if (!mongoUri || typeof mongoUri !== 'string') {
      console.error('MongoDB URI is not properly set');
      console.log('MONGODB_URI:', process.env.MONGODB_URI);
      console.log('MONGODB_URL:', process.env.MONGODB_URL);
      throw new Error('MongoDB URI must be a valid string');
    }
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'Farm2Home Backend API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 10000;

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));