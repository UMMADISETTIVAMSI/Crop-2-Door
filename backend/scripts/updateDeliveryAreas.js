const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const MONGODB_URI = 'mongodb+srv://farm2homefsd_db_user:vamsi1234@farm.jhmt7ll.mongodb.net/?retryWrites=true&w=majority&appName=farm';

const deliveryAreas = [
  'Mumbai - Andheri',
  'Mumbai - Bandra', 
  'Delhi - South',
  'Delhi - North',
  'Bangalore - Koramangala',
  'Bangalore - Whitefield',
  'Pune - Kothrud',
  'Chennai - T Nagar'
];

async function updateDeliveryAreas() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update farmers without delivery areas
    const farmers = await User.find({ role: 'farmer' });
    console.log(`Found ${farmers.length} farmers`);

    for (let i = 0; i < farmers.length; i++) {
      const farmer = farmers[i];
      const randomArea = deliveryAreas[Math.floor(Math.random() * deliveryAreas.length)];
      
      await User.findByIdAndUpdate(farmer._id, { deliveryArea: randomArea });
      console.log(`Updated farmer ${farmer.name} with area: ${randomArea}`);
    }

    // Update products with farmer's delivery area
    const products = await Product.find({}).populate('farmer');
    console.log(`Found ${products.length} products`);

    for (let product of products) {
      if (product.farmer && product.farmer.deliveryArea) {
        await Product.findByIdAndUpdate(product._id, { deliveryArea: product.farmer.deliveryArea });
        console.log(`Updated product ${product.name} with area: ${product.farmer.deliveryArea}`);
      }
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

updateDeliveryAreas();