const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const productImages = {
  'Tomatoes': 'https://images.unsplash.com/photo-1546470427-e5ac89c8ba3b?w=400&h=300&fit=crop',
  'Onions': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
  'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
  'Carrots': 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=300&fit=crop',
  'Mangoes': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
  'Spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
  'Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop'
};

async function addProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const [productName, imageUrl] of Object.entries(productImages)) {
      const result = await Product.updateMany(
        { name: productName },
        { $set: { image: imageUrl } }
      );
      console.log(`Updated ${result.modifiedCount} products named "${productName}" with image`);
    }

    console.log('Product images added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addProductImages();