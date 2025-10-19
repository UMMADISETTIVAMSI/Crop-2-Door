import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products, orders } from '../utils/api';
import { useCart } from '../contexts/CartContext';

const ProductDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      console.log('Loading product with ID:', id);
      const response = await products.getById(id);
      console.log('Product response:', response.data);
      setProduct(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading product:', error);
      setError(error.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert('Added to cart!');
  };

  const handleOrderNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowOrderForm(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    
    try {
      console.log('Creating order with data:', {
        productId: product._id,
        quantity: quantity,
        deliveryAddress: `${address.name}, ${address.phone}, ${address.street}, ${address.city} - ${address.pincode}`
      });
      
      const response = await orders.create({
        productId: product._id,
        quantity: quantity,
        deliveryAddress: `${address.name}, ${address.phone}, ${address.street}, ${address.city} - ${address.pincode}`
      });
      
      console.log('Order created successfully:', response.data);
      alert('Order placed successfully!');
      setShowOrderForm(false);
      
      // Navigate to orders tab in dashboard
      navigate('/dashboard', { state: { activeTab: 'orders' } });
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Error placing order: ' + (error.response?.data?.message || error.message));
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !product)) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">{error || 'Product not found'}</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 text-emerald-500 hover:text-emerald-600 flex items-center"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <img 
            src={product.image || '/api/placeholder/400/400'} 
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{product.name}</h1>
          
          <div className="mb-4">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          <div className="text-3xl font-bold text-emerald-500 mb-6">
            ₹{product.price}/{product.unit}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-box text-gray-500 w-5"></i>
              <span className="ml-3 text-gray-700 dark:text-gray-300">Available: {product.quantity} {product.unit}</span>
            </div>
            
            <div className="flex items-center">
              <i className="fas fa-store text-gray-500 w-5"></i>
              <span className="ml-3 text-gray-700 dark:text-gray-300">Farm: {product.farmName}</span>
            </div>
            
            <div className="flex items-center">
              <i className="fas fa-map-marker-alt text-gray-500 w-5"></i>
              <span className="ml-3 text-gray-700 dark:text-gray-300">Location: {product.farmAddress}</span>
            </div>
            
            <div className="flex items-center">
              <i className="fas fa-phone text-gray-500 w-5"></i>
              <span className="ml-3 text-gray-700 dark:text-gray-300">Contact: {product.farmPhone}</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center"
              >
                +
              </button>
              <span className="text-gray-500 dark:text-gray-400 ml-4">{product.unit}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {user && user.role === 'client' && (
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 font-semibold"
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Add to Cart
              </button>
              <button
                onClick={handleOrderNow}
                className="flex-1 bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600 font-semibold"
              >
                <i className="fas fa-bolt mr-2"></i>
                Order Now
              </button>
            </div>
          )}

          {!user && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Please login to place an order</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Product Info */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Product Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Farm Details</h4>
            <p className="text-gray-600 dark:text-gray-400">Fresh produce directly from {product.farmName}</p>
            <p className="text-gray-600 dark:text-gray-400">Located at {product.farmAddress}</p>
            <p className="text-gray-600 dark:text-gray-400">Contact: {product.farmPhone}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Details</h4>
            <p className="text-gray-600 dark:text-gray-400">Category: {product.category}</p>
            <p className="text-gray-600 dark:text-gray-400">Unit: {product.unit}</p>
            <p className="text-gray-600 dark:text-gray-400">Available Quantity: {product.quantity} {product.unit}</p>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Delivery Information</h3>
            <form onSubmit={handlePlaceOrder}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.name}
                  onChange={(e) => setAddress({...address, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({...address, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Pincode</label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Order Summary</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>{product.name} x {quantity}</span>
                    <span>₹{(product.price * quantity).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                    <span>Total</span>
                    <span>₹{(product.price * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                >
                  {orderLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;