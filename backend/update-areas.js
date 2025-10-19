const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const areaMapping = {
  'Bangalore - Koramangala': 'Rayachoti',
  'Chennai - T Nagar': 'Rajampet', 
  'Delhi - South': 'Pulivendula',
  'Mumbai - Andheri': 'Kamalapuram'
};

async function updateAreas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const [oldArea, newArea] of Object.entries(areaMapping)) {
      const userResult = await User.updateMany(
        { deliveryArea: oldArea },
        { $set: { deliveryArea: newArea } }
      );
      console.log(`Updated ${userResult.modifiedCount} users from "${oldArea}" to "${newArea}"`);

      const productResult = await Product.updateMany(
        { deliveryArea: oldArea },
        { $set: { deliveryArea: newArea } }
      );
      console.log(`Updated ${productResult.modifiedCount} products from "${oldArea}" to "${newArea}"`);
    }

    console.log('Update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAreas();