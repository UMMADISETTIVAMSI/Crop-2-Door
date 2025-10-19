const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const defaultAreas = [
  'Mumbai - Andheri',
  'Mumbai - Bandra', 
  'Delhi - South',
  'Delhi - North',
  'Bangalore - Koramangala',
  'Bangalore - Whitefield',
  'Pune - Kothrud',
  'Chennai - T Nagar'
];

async function cleanupDefaultAreas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove products with default delivery areas
    const result = await Product.deleteMany({
      deliveryArea: { $in: defaultAreas }
    });

    console.log(`Deleted ${result.deletedCount} products with default delivery areas`);

    // Show remaining products
    const remainingProducts = await Product.find({}, 'name deliveryArea');
    console.log('Remaining products:', remainingProducts);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupDefaultAreas();