const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  deliveryArea: String
}, { collection: 'users' });

const productSchema = new mongoose.Schema({
  name: String,
  deliveryArea: String
}, { collection: 'products' });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

const areaMapping = {
  'Bangalore - Koramangala': 'Rayachoti',
  'Chennai - T Nagar': 'Rajampet', 
  'Delhi - South': 'Pulivendula',
  'Mumbai - Andheri': 'Kamalapuram'
};

async function updateAreas() {
  try {
    await connectDB();

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