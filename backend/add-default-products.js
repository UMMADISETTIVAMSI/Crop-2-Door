const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const defaultProducts = [
  // Rayachoti products
  { name: 'Tomatoes', category: 'Vegetables', price: 25, quantity: 50, unit: 'kg', deliveryArea: 'Rayachoti', farmName: 'Rayachoti Organic Farm', farmAddress: 'Rayachoti Village', farmPhone: '9876543210' },
  { name: 'Onions', category: 'Vegetables', price: 30, quantity: 40, unit: 'kg', deliveryArea: 'Rayachoti', farmName: 'Rayachoti Organic Farm', farmAddress: 'Rayachoti Village', farmPhone: '9876543210' },
  
  // Rajampet products
  { name: 'Rice', category: 'Grains', price: 45, quantity: 100, unit: 'kg', deliveryArea: 'Rajampet', farmName: 'Rajampet Rice Mills', farmAddress: 'Rajampet Town', farmPhone: '9876543211' },
  { name: 'Carrots', category: 'Vegetables', price: 35, quantity: 30, unit: 'kg', deliveryArea: 'Rajampet', farmName: 'Rajampet Organic Farm', farmAddress: 'Rajampet Town', farmPhone: '9876543211' },
  
  // Pulivendula products
  { name: 'Mangoes', category: 'Fruits', price: 80, quantity: 25, unit: 'kg', deliveryArea: 'Pulivendula', farmName: 'Pulivendula Mango Farm', farmAddress: 'Pulivendula Village', farmPhone: '9876543212' },
  { name: 'Spinach', category: 'Vegetables', price: 20, quantity: 15, unit: 'kg', deliveryArea: 'Pulivendula', farmName: 'Pulivendula Green Farm', farmAddress: 'Pulivendula Village', farmPhone: '9876543212' },
  
  // Kamalapuram products
  { name: 'Bananas', category: 'Fruits', price: 40, quantity: 60, unit: 'dozen', deliveryArea: 'Kamalapuram', farmName: 'Kamalapuram Fruit Farm', farmAddress: 'Kamalapuram Town', farmPhone: '9876543213' },
  { name: 'Potatoes', category: 'Vegetables', price: 28, quantity: 80, unit: 'kg', deliveryArea: 'Kamalapuram', farmName: 'Kamalapuram Organic Farm', farmAddress: 'Kamalapuram Town', farmPhone: '9876543213' }
];

async function addDefaultProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a farmer user to assign as owner
    const farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      console.log('No farmer found in database');
      process.exit(1);
    }

    for (const productData of defaultProducts) {
      const product = new Product({
        ...productData,
        farmer: farmer._id
      });
      
      await product.save();
      console.log(`Added product: ${productData.name} in ${productData.deliveryArea}`);
    }

    console.log('Default products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addDefaultProducts();