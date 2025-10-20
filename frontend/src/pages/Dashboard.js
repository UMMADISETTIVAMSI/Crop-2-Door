import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { products, orders, auth } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';


const Dashboard = ({ user }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || (user.role === 'farmer' ? 'products' : 'browse')
  );
  const [productList, setProductList] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [orderList, setOrderList] = useState([]);

  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [deliveryArea, setDeliveryArea] = useState(localStorage.getItem('selectedDeliveryArea') || '');
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    products: false,
    myProducts: false,
    orders: false,
    favorites: false,
    deliveryAreas: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Advanced search filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  


  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Vegetables', price: '', quantity: '', unit: 'kg',
    farmAddress: '', farmPhone: '', image: ''
  });
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProduct, setEditProduct] = useState({});
  
  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSortBy, setOrderSortBy] = useState('newest');
  
  // Revenue calculations
  const calculateRevenue = () => {
    if (!orderList || orderList.length === 0) return { total: 0, delivered: 0, pending: 0, thisMonth: 0, avgOrder: 0, totalOrders: 0, pendingCount: 0, confirmedCount: 0, deliveredCount: 0, cancelledCount: 0 };
    
    const total = orderList.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const delivered = orderList.filter(o => o.status === 'delivered').reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const pending = orderList.filter(o => o.status === 'pending' || o.status === 'confirmed').reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // This month's revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = orderList.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear && order.status === 'delivered';
    }).reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Average order value
    const deliveredOrders = orderList.filter(o => o.status === 'delivered');
    const avgOrder = deliveredOrders.length > 0 ? delivered / deliveredOrders.length : 0;
    const totalOrders = orderList.length;
    
    // Order counts by status
    const pendingCount = orderList.filter(o => o.status === 'pending').length;
    const confirmedCount = orderList.filter(o => o.status === 'confirmed').length;
    const deliveredCount = orderList.filter(o => o.status === 'delivered').length;
    const cancelledCount = orderList.filter(o => o.status === 'cancelled').length;
    
    return { total, delivered, pending, thisMonth, avgOrder, totalOrders, pendingCount, confirmedCount, deliveredCount, cancelledCount };
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        if (user.role === 'client' && !dataLoaded.favorites) {
          await loadFavorites();
          setDataLoaded(prev => ({ ...prev, favorites: true }));
        }

        if (activeTab === 'browse') {
          if (!dataLoaded.products) {
            setCurrentPage(1);
            await loadProducts(1);
            setDataLoaded(prev => ({ ...prev, products: true }));
          }
          if (!dataLoaded.deliveryAreas) {
            await loadDeliveryAreas();
            setDataLoaded(prev => ({ ...prev, deliveryAreas: true }));
          }
        }
        if (activeTab === 'products' && !dataLoaded.myProducts) {
          await loadMyProducts();
          setDataLoaded(prev => ({ ...prev, myProducts: true }));
        }
        if (activeTab === 'orders' && !dataLoaded.orders) {
          await loadOrders();
          setDataLoaded(prev => ({ ...prev, orders: true }));
        }
        if (activeTab === 'favorites' && !dataLoaded.favorites) {
          await loadFavorites();
          setDataLoaded(prev => ({ ...prev, favorites: true }));
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [activeTab]);

  // Handle navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      console.log('Setting active tab from navigation:', location.state.activeTab);
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.deliveryArea) {
      console.log('Setting delivery area from navigation:', location.state.deliveryArea);
      setDeliveryArea(location.state.deliveryArea);
      localStorage.setItem('selectedDeliveryArea', location.state.deliveryArea);
    }
    // Clear the state to prevent issues on refresh
    if (location.state) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (user.role === 'client') loadFavorites();

  }, []);

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    setLoading(true);
    loadProducts(page);
  };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedSearch = useCallback(
    debounce(() => {
      if (activeTab === 'browse') {
        setCurrentPage(1);
        setLoading(true);
        loadProducts(1);
      }
    }, 150),
    [searchTerm, category, deliveryArea, minPrice, maxPrice, sortBy, sortOrder, activeTab]
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, category, deliveryArea, minPrice, maxPrice, sortBy, sortOrder, debouncedSearch]);

  const loadDeliveryAreas = async () => {
    try {
      console.log('Loading farmer delivery areas...');
      const response = await auth.getFarmerAreas();
      console.log('Farmer areas response:', response.data);
      setDeliveryAreas(response.data || []);
    } catch (error) {
      console.error('Error loading farmer areas:', error);
    }
  };

  const loadProducts = async (page = currentPage) => {
    try {
      if (!dataLoaded.products) setLoading(true);
      const params = { sortBy, sortOrder, page };
      // Don't set limit to get all products without pagination
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category) params.category = category;
      if (deliveryArea) params.deliveryArea = deliveryArea;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      
      const response = await products.getAll(params);
      setProductList(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.page || 1);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyProducts = async () => {
    try {
      const response = await products.getMyProducts();
      setMyProducts(response.data);
    } catch (error) {
      console.error('Error loading my products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      console.log('Loading orders for user role:', user.role);
      const response = user.role === 'farmer' 
        ? await orders.getFarmerOrders()
        : await orders.getMyOrders();
      console.log('Orders response:', response.data);
      setOrderList(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      console.error('Error details:', error.response?.data);
    }
  };



  const loadFavorites = async () => {
    try {
      if (user.role === 'client') {
        const response = await products.getFavorites();
        setFavorites(response.data || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const toggleFavorite = async (productId) => {
    // Instant UI update
    const isFavorited = favorites.some(fav => fav._id === productId);
    if (isFavorited) {
      setFavorites(favorites.filter(fav => fav._id !== productId));
    } else {
      const product = productList.find(p => p._id === productId);
      if (product) setFavorites([...favorites, product]);
    }
    
    try {
      await products.toggleFavorite(productId);
    } catch (error) {
      // Revert on error
      if (isFavorited) {
        const product = productList.find(p => p._id === productId);
        if (product) setFavorites([...favorites, product]);
      } else {
        setFavorites(favorites.filter(fav => fav._id !== productId));
      }
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.quantity) {
      alert('Please fill all required fields');
      return;
    }
    if (newProduct.price <= 0 || newProduct.quantity <= 0) {
      alert('Price and quantity must be positive numbers');
      return;
    }
    setAddingProduct(true);
    try {
      await products.create(newProduct);
      setShowAddProduct(false);
      setNewProduct({
        name: '', category: 'Vegetables', price: '', quantity: '', unit: 'kg',
        farmAddress: '', farmPhone: '', image: ''
      });
      alert('Product added successfully!');
      await loadMyProducts();
      setDataLoaded(prev => ({ ...prev, myProducts: true }));
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.message || error.message));
    } finally {
      setAddingProduct(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({...newProduct, image: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrder = async (productId, quantity) => {
    try {
      await orders.create({ productId, quantity: parseInt(quantity) });
      alert('Order placed successfully!');
      await loadProducts();

    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orders.updateStatus(orderId, status);
      await loadOrders();

    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orders.cancel(orderId);
        alert('Order cancelled successfully!');
        await loadOrders();

      } catch (error) {
        alert(error.response?.data?.message || 'Error cancelling order');
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-emerald-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" style={{animationDuration: '0.8s'}}></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <i className="fas fa-seedling text-2xl text-emerald-600 animate-pulse"></i>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 animate-pulse">🌱 Loading Dashboard...</h2>
          <p className="text-gray-600 dark:text-gray-300 animate-bounce">Setting up your personalized experience</p>
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard - {user.name}</h1>
      
      <div className="flex space-x-4 mb-6">
        {user.role === 'client' && (
          <>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded transition-colors ${activeTab === 'browse' ? 'bg-blue-400 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white'}`}
            >
              Browse Products
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded transition-colors ${activeTab === 'favorites' ? 'bg-blue-400 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white'}`}
            >
              Favorites
            </button>
          </>
        )}
        {user.role === 'farmer' && (
          <>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded transition-colors ${activeTab === 'products' ? 'bg-blue-400 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white'}`}
            >
              My Products
            </button>

          </>
        )}
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded transition-colors ${activeTab === 'orders' ? 'bg-blue-400 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white'}`}
        >
          {user.role === 'farmer' ? 'Incoming Orders' : 'Orders'}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div>
          {deliveryArea && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 dark:text-emerald-300">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Showing products in: <strong>{deliveryArea}</strong>
                </span>
                <button
                  onClick={() => {
                    setDeliveryArea('');
                    localStorage.removeItem('selectedDeliveryArea');
                  }}
                  className="text-emerald-600 hover:text-emerald-800 text-sm"
                >
                  Change Area
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Search Products"
                className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white sm:w-auto w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Others">Others</option>
              </select>

              <select
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white sm:w-auto w-full"
                value={deliveryArea}
                onChange={(e) => {
                  setDeliveryArea(e.target.value);
                  localStorage.setItem('selectedDeliveryArea', e.target.value);
                }}
              >
                <option value="">All Areas</option>
                {deliveryAreas.map((area, index) => (
                  <option key={index} value={area.area}>
                    {area.area}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
              >
                <i className="fas fa-filter mr-2"></i>
                Filters
              </button>
            </div>

            {showAdvancedFilters && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min ₹"
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Max ₹"
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                    <select
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Highest Rated</option>
                      <option value="popularity-desc">Most Popular</option>
                      <option value="name-asc">Name: A to Z</option>
                    </select>
                  </div>

                  <div></div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        setSortBy('createdAt');
                        setSortOrder('desc');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" alt="Loading" className="w-20 h-20 mx-auto mb-4 rounded-full" />
              <p className="mt-2 text-gray-600 dark:text-gray-300">Finding fresh products...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productList.length === 0 ? (
                  <p className="col-span-full text-center text-gray-600 dark:text-gray-300">No products available</p>
                ) : (
                  productList.map(product => (
                    <div key={product._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-300 cursor-pointer">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-32 object-cover rounded-lg mb-3 transition-transform duration-300 hover:scale-110" 
                          onClick={() => navigate(`/product/${product._id}`)}
                        />
                      )}
                      <h3 
                        className="text-lg font-semibold mb-2 text-gray-800 dark:text-white transition-colors duration-300 hover:text-blue-600 cursor-pointer"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Category: {product.category}</p>
                      <p className="text-emerald-500 font-bold mb-2">₹{product.price}/{product.unit}</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Available: {product.quantity} {product.unit}</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Farm: {product.farmName}</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Area: {product.farmAddress}</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">Phone: {product.farmPhone}</p>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="1"
                          max={product.quantity}
                          placeholder="Qty"
                          className="w-16 p-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          id={`qty-${product._id}`}
                        />
                        <button
                          onClick={() => toggleFavorite(product._id)}
                          className="px-3 py-2 rounded text-sm transform transition-all duration-200 hover:scale-105 bg-white border border-gray-300 hover:bg-gray-50"
                        >
                          <i className={`fas fa-heart text-lg transition-colors duration-200 ${favorites.some(fav => fav._id === product._id) ? 'text-red-500' : 'text-gray-400'}`}></i>
                        </button>
                        <button
                          onClick={() => {
                            const qty = document.getElementById(`qty-${product._id}`).value;
                            if (qty) {
                              addToCart(product, parseInt(qty));
                              // Show success GIF
                              const successDiv = document.createElement('div');
                              successDiv.innerHTML = `
                                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); text-align: center; border: 3px solid #fff;">
                                  <img src="https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif" style="width: 120px; height: 120px; margin-bottom: 15px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.3);" />
                                  <p style="color: #fff; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">✨ Added to Cart! 🛒</p>
                                </div>
                              `;
                              document.body.appendChild(successDiv);
                              setTimeout(() => document.body.removeChild(successDiv), 2000);
                              document.getElementById(`qty-${product._id}`).value = '';
                            }
                          }}
                          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm transform transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            const qty = document.getElementById(`qty-${product._id}`).value;
                            if (qty) {
                              navigate(`/product/${product._id}`);
                            }
                          }}
                          className="bg-emerald-400 text-white px-3 py-2 rounded hover:bg-emerald-500 text-sm transform transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              

            </>
          )}
        </div>
      )}

      {activeTab === 'products' && user.role === 'farmer' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Products</h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
            >
              Add Product
            </button>
          </div>

          {showAddProduct && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg mb-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Product</h3>
              <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
                <select
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Grains">Grains</option>
                  <option value="Others">Others</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Unit (kg, dozen, liters)"
                  className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Farm Address"
                  className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                  value={newProduct.farmAddress}
                  onChange={(e) => setNewProduct({...newProduct, farmAddress: e.target.value})}
                  required
                />

                <input
                  type="tel"
                  placeholder="Farm Phone"
                  className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                  value={newProduct.farmPhone}
                  onChange={(e) => setNewProduct({...newProduct, farmPhone: e.target.value})}
                  required
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    onChange={handleImageUpload}
                  />
                  {newProduct.image && (
                    <div className="mt-4">
                      <img src={newProduct.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 flex space-x-4">
                  <button 
                    type="submit" 
                    disabled={addingProduct}
                    className="bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500 disabled:opacity-50"
                  >
                    {addingProduct ? 'Adding...' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {myProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-300">No products added yet</p>
            ) : (
              myProducts.map(product => (
                <div key={product._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-300 cursor-pointer">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3 transition-transform duration-300 hover:scale-110" />
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Category: {product.category}</p>
                  <p className="text-emerald-500 font-bold mb-2">₹{product.price}/{product.unit}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">Available: {product.quantity} {product.unit}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product._id);
                        setEditProduct(product);
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          products.delete(product._id).then(() => {
                            // Show delete GIF
                            const deleteDiv = document.createElement('div');
                            deleteDiv.innerHTML = `
                              <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); text-align: center;">
                                <img src="https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 50%; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);" />
                                <p style="color: #dc2626; font-weight: bold;">Product Deleted! 🗑️</p>
                              </div>
                            `;
                            document.body.appendChild(deleteDiv);
                            setTimeout(() => document.body.removeChild(deleteDiv), 2000);
                            loadMyProducts();
                          });
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Edit Product Modal */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit Product</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await products.update(editingProduct, editProduct);
                    alert('Product updated successfully!');
                    setEditingProduct(null);
                    loadMyProducts();
                  } catch (error) {
                    alert('Error updating product: ' + (error.response?.data?.message || error.message));
                  }
                }} className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    value={editProduct.name || ''}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                    required
                  />
                  <select
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    value={editProduct.category || 'Vegetables'}
                    onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Others">Others</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                    value={editProduct.price || ''}
                    onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                    value={editProduct.quantity || ''}
                    onChange={(e) => setEditProduct({...editProduct, quantity: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unit (kg, dozen, liters)"
                    className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                    value={editProduct.unit || ''}
                    onChange={(e) => setEditProduct({...editProduct, unit: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Farm Address"
                    className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                    value={editProduct.farmAddress || ''}
                    onChange={(e) => setEditProduct({...editProduct, farmAddress: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Farm Phone"
                    className="p-3 border border-gray-200 rounded-lg bg-white text-gray-800"
                    value={editProduct.farmPhone || ''}
                    onChange={(e) => setEditProduct({...editProduct, farmPhone: e.target.value})}
                    required
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditProduct({...editProduct, image: reader.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {editProduct.image && (
                      <div className="mt-4">
                        <img src={editProduct.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex space-x-4">
                    <button 
                      type="submit" 
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Update Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}



      {activeTab === 'favorites' && user.role === 'client' && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Favorite Products</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-300">No favorites added yet</p>
            ) : (
              favorites.map(product => (
                <div key={product._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-300 cursor-pointer">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-32 object-cover rounded-lg mb-3 transition-transform duration-300 hover:scale-110 cursor-pointer" 
                      onClick={() => navigate(`/product/${product._id}`)}
                    />
                  )}
                  <h3 
                    className="text-lg font-semibold mb-2 text-gray-800 dark:text-white transition-colors duration-300 hover:text-blue-600 cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Category: {product.category}</p>
                  <p className="text-emerald-500 font-bold mb-2">₹{product.price}/{product.unit}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Available: {product.quantity} {product.unit}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Farm: {product.farmName}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">Area: {product.farmAddress}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleFavorite(product._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transform transition-all duration-200 hover:scale-105"
                    >
                      <i className="fas fa-heart-broken"></i> Remove
                    </button>
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        // Show cart success GIF
                        const cartDiv = document.createElement('div');
                        cartDiv.innerHTML = `
                          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); text-align: center; border: 3px solid #fff;">
                            <img src="https://media.giphy.com/media/l0HlSz7gvgkiO8xQA/giphy.gif" style="width: 120px; height: 120px; margin-bottom: 15px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.3);" />
                            <p style="color: #fff; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">💖 Added from Favorites!</p>
                          </div>
                        `;
                        document.body.appendChild(cartDiv);
                        setTimeout(() => document.body.removeChild(cartDiv), 2000);
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm transform transition-all duration-200 hover:scale-105"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {user.role === 'farmer' ? 'Order Management' : 'My Orders'}
            </h2>
            <button
              onClick={loadOrders}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center w-full sm:w-auto"
            >
              <i className="fas fa-refresh mr-2"></i>
              Refresh
            </button>
          </div>
          
          {user.role === 'farmer' && orderList && orderList.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-rupee-sign text-emerald-600 text-2xl mr-3"></i>
                    <div>
                      <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Total Revenue</p>
                      <p className="text-emerald-800 dark:text-emerald-200 text-xl font-bold">₹{calculateRevenue().total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-clock text-orange-600 text-2xl mr-3"></i>
                    <div>
                      <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Pending Revenue</p>
                      <p className="text-orange-800 dark:text-orange-200 text-xl font-bold">₹{calculateRevenue().pending.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-shopping-bag text-teal-600 text-2xl mr-3"></i>
                    <div>
                      <p className="text-teal-600 dark:text-teal-400 text-sm font-medium">Total Orders</p>
                      <p className="text-teal-800 dark:text-teal-200 text-xl font-bold">{calculateRevenue().totalOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-hourglass-half text-yellow-600 text-xl mr-3"></i>
                    <div>
                      <p className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">Pending</p>
                      <p className="text-yellow-800 dark:text-yellow-200 text-lg font-bold">{calculateRevenue().pendingCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-check text-blue-600 text-xl mr-3"></i>
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">Confirmed</p>
                      <p className="text-blue-800 dark:text-blue-200 text-lg font-bold">{calculateRevenue().confirmedCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-check-double text-green-600 text-xl mr-3"></i>
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-xs font-medium">Delivered</p>
                      <p className="text-green-800 dark:text-green-200 text-lg font-bold">{calculateRevenue().deliveredCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-times text-red-600 text-xl mr-3"></i>
                    <div>
                      <p className="text-red-600 dark:text-red-400 text-xs font-medium">Cancelled</p>
                      <p className="text-red-800 dark:text-red-200 text-lg font-bold">{calculateRevenue().cancelledCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <select
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white sm:w-auto w-full"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white sm:w-auto w-full"
              value={orderSortBy}
              onChange={(e) => setOrderSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
          <div className="space-y-4">
            {orderList && orderList.length > 0 ? (
              <p className="text-sm text-gray-500 mb-4">Found {orderList.length} orders</p>
            ) : null}
            {orderList && orderList.length > 0 ? orderList
              .filter(order => {
                if (orderStatusFilter && order.status !== orderStatusFilter) return false;
                return true;
              })
              .sort((a, b) => {
                if (orderSortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                if (orderSortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                if (orderSortBy === 'amount-high') return b.totalPrice - a.totalPrice;
                if (orderSortBy === 'amount-low') return a.totalPrice - b.totalPrice;
                // Default: pending orders first
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return 0;
              })
              .map(order => (
              <div key={order._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                      {order.product?.name} - {order.quantity} units
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm sm:text-base">
                      {user.role === 'farmer' ? `Client: ${order.client?.name}` : `Farm: ${order.farmer?.farmName}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm sm:text-base">
                      Phone: {user.role === 'farmer' ? order.client?.phone : order.farmer?.phone}
                    </p>
                    {user.role === 'farmer' && order.deliveryAddress && (
                      <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm sm:text-base">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        Delivery: {order.deliveryAddress}
                      </p>
                    )}
                    <p className="text-emerald-500 font-bold mb-2 text-sm sm:text-base">Total: ₹{order.totalPrice}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Status: <span className={`font-semibold ${order.status === 'delivered' ? 'text-green-600' : order.status === 'confirmed' ? 'text-blue-600' : order.status === 'cancelled' ? 'text-red-600' : 'text-orange-600'}`}>{order.status}</span></p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                    {user.role === 'farmer' && order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transform transition-all duration-200 hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                      >
                        Confirm Order
                      </button>
                    )}
                    {user.role === 'farmer' && order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transform transition-all duration-200 hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {user.role === 'client' && order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transform transition-all duration-200 hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-600 dark:text-gray-300">No orders found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;