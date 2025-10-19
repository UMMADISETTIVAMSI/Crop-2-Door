const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2home';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const User = require('./backend/models/User');
const Product = require('./backend/models/Product');

const testProducts = [
  {
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 40,
    quantity: 50,
    unit: 'kg',
    farmName: 'Green Valley Farm',
    farmAddress: 'Farm Valley, India',
    farmPhone: '9876543211',
    deliveryArea: 'Mumbai'
  },
  {
    name: 'Organic Carrots',
    category: 'Vegetables', 
    price: 60,
    quantity: 30,
    unit: 'kg',
    farmName: 'Organic Farm',
    farmAddress: 'Organic Valley, India',
    farmPhone: '9876543212',
    deliveryArea: 'Delhi'
  }
];

async function addTestProducts() {
  try {
    await connectDB();
    
    // Find or create a test farmer
    let farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      farmer = new User({
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        role: 'farmer',
        farmName: 'Test Farm',
        deliveryArea: 'Mumbai'
      });
      await farmer.save();
      console.log('Created test farmer');
    }

    // Add test products
    for (const productData of testProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product({
          ...productData,
          farmer: farmer._id
        });
        await product.save();
        console.log(`Added product: ${productData.name}`);
      } else {
        console.log(`Product already exists: ${productData.name}`);
      }
    }

    console.log('Test products setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestProducts();