const express = require('express');
const Product = require('../models/Product');
const { auth, farmerOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    
    const { 
      search, category, deliveryArea, 
      minPrice, maxPrice, 
      isOrganic, isSeasonal,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = null 
    } = req.query;
    
    let query = {};
    
    // Text search
    if (search) query.name = { $regex: search, $options: 'i' };
    
    // Category filter
    if (category) query.category = category;
    
    // Delivery area filter
    if (deliveryArea) query.deliveryArea = deliveryArea;
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Organic filter
    if (isOrganic === 'true') query.isOrganic = true;
    
    // Seasonal filter
    if (isSeasonal === 'true') query.isSeasonal = true;
    
    // Sorting
    let sortOptions = {};
    const order = sortOrder === 'desc' ? -1 : 1;
    
    switch (sortBy) {
      case 'price':
        sortOptions.price = order;
        break;
      case 'rating':
        sortOptions.rating = order;
        break;
      case 'popularity':
        sortOptions.popularity = order;
        break;
      case 'name':
        sortOptions.name = order;
        break;
      default:
        sortOptions.createdAt = order;
    }
    
    let productsQuery = Product.find(query)
      .select('name category price quantity unit image farmName farmAddress farmPhone')
      .sort(sortOptions);
    
    if (limit) {
      const skip = (page - 1) * limit;
      productsQuery = productsQuery.skip(skip).limit(parseInt(limit));
    }
    
    const products = await productsQuery.lean();
    
    // Skip view count update for now to avoid issues
    
    const total = await Product.countDocuments(query);
    const totalPages = limit ? Math.ceil(total / limit) : 1;
    
    res.json({ products, total, page: parseInt(page), totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to check products
router.get('/test', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    const products = await Product.find().limit(5);
    res.json({ message: 'Products test', count, sample: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/delivery-areas', async (req, res) => {
  try {
    const User = require('../models/User');
    const areas = await User.aggregate([
      { $match: { role: 'farmer', deliveryArea: { $ne: null, $ne: '' } } },
      { $group: { _id: '$deliveryArea', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const result = areas.map(area => ({
      area: area._id,
      farmerCount: area.count
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, farmerOnly, async (req, res) => {
  try {
    const { name, category, price, quantity, unit, image, farmAddress, farmPhone } = req.body;
    
    console.log('Creating product for user:', req.user.name);
    console.log('User delivery area:', req.user.deliveryArea);
    
    if (!name?.trim() || !price || !quantity || !farmAddress?.trim() || !farmPhone?.trim()) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    if (price <= 0 || quantity <= 0) {
      return res.status(400).json({ message: 'Price and quantity must be positive numbers' });
    }
    
    const product = new Product({
      name: name.trim(), 
      category, 
      price: Number(price), 
      quantity: Number(quantity), 
      unit,
      image,
      farmer: req.user._id,
      farmName: req.user.farmName || req.user.name,
      farmAddress: farmAddress.trim(),
      farmPhone: farmPhone.trim(),
      deliveryArea: req.user.deliveryArea
    });
    
    console.log('Product being created:', product);
    await product.save();
    console.log('Product saved successfully');
    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-products', auth, farmerOnly, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, farmerOnly, async (req, res) => {
  try {
    const updates = { ...req.body };
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      updates,
      { new: true }
    );
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, farmerOnly, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/favorites', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      select: 'name category price quantity unit image farmName farmAddress farmPhone'
    });
    res.json(user.favorites || []);
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const productId = req.params.id;
    
    if (!user.favorites) {
      user.favorites = [];
    }
    
    const favoriteIndex = user.favorites.findIndex(id => id.toString() === productId);
    
    if (favoriteIndex > -1) {
      user.favorites.splice(favoriteIndex, 1);
    } else {
      user.favorites.push(productId);
    }
    
    await user.save();
    res.json({ message: 'Favorite toggled successfully' });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name')
      .lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Revenue reports for farmers
router.get('/revenue-report', auth, farmerOnly, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
        break;
    }
    
    const revenueData = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $match: {
          'productInfo.farmer': req.user._id,
          status: 'delivered',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);
    
    const productStats = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $match: {
          'productInfo.farmer': req.user._id,
          status: 'delivered',
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$product',
          productName: { $first: { $arrayElemAt: ['$productInfo.name', 0] } },
          totalSold: { $sum: '$quantity' },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      summary: revenueData[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
      topProducts: productStats,
      period
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;