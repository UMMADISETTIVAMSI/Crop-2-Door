const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, role, phone, address, farmName, deliveryArea } = req.body;
    
    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    

    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const userData = { name, email, password, role, phone, address, farmName, deliveryArea };
    if (username && username.trim()) {
      userData.username = username.trim();
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, username: user.username, email, role, phone, farmName, address, deliveryArea: user.deliveryArea, profileImage: user.profileImage } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role, phone: user.phone, farmName: user.farmName, address: user.address, deliveryArea: user.deliveryArea, profileImage: user.profileImage } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.phone !== undefined) updateFields.phone = req.body.phone;
    if (req.body.farmName !== undefined) updateFields.farmName = req.body.farmName;
    if (req.body.address !== undefined) updateFields.address = req.body.address;
    if (req.body.profileImage !== undefined) updateFields.profileImage = req.body.profileImage;
    if (req.body.deliveryArea !== undefined) updateFields.deliveryArea = req.body.deliveryArea;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    );
    
    res.json({ 
      user: { 
        id: updatedUser._id, 
        name: updatedUser.name, 
        email: updatedUser.email, 
        role: updatedUser.role, 
        phone: updatedUser.phone, 
        farmName: updatedUser.farmName, 
        address: updatedUser.address, 
        deliveryArea: updatedUser.deliveryArea,
        profileImage: updatedUser.profileImage 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/farmer-areas', async (req, res) => {
  try {
    const areas = await User.aggregate([
      { $match: { role: 'farmer', deliveryArea: { $ne: null, $ne: '' } } },
      { $group: { _id: '$deliveryArea', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(areas.map(area => ({
      area: area._id,
      farmerCount: area.count
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    
    // Delete user's products
    await Product.deleteMany({ farmer: req.user._id });
    
    // Delete user's orders
    await Order.deleteMany({ $or: [{ client: req.user._id }, { farmer: req.user._id }] });
    
    // Delete user account
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;