const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Others'], 
    required: true 
  },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  image: { type: String },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmName: { type: String, required: true },
  farmAddress: { type: String, required: true },
  farmPhone: { type: String, required: true },
  deliveryArea: { type: String },
  isOrganic: { type: Boolean, default: false },
  isSeasonal: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

// Basic indexes only
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);