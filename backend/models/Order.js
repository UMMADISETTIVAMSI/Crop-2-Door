const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  deliveryAddress: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);