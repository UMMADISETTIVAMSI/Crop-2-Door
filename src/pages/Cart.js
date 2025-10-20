import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { orders } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Cart = ({ user }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    pincode: ''
  });
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, parseInt(newQuantity));
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      for (const item of cartItems) {
        await orders.create({
          productId: item._id,
          quantity: item.quantity,
          deliveryAddress: `${address.name}, ${address.phone}, ${address.street}, ${address.city} - ${address.pincode}`
        });
      }
      
      clearCart();
      setShowCheckout(false);
      alert('Orders placed successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert('Error placing orders: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <i className="fas fa-shopping-cart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Add some products to get started!</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Shopping Cart</h1>
      
      {!showCheckout ? (
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            {cartItems.map(item => (
              <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image || '/api/placeholder/80/80'} 
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white truncate">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{item.category}</p>
                      <p className="text-emerald-600 font-bold text-sm sm:text-base">₹{item.price}/{item.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600 dark:text-gray-300">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        max={item.availableQuantity}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                      />
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-sm sm:text-base">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 p-2 flex-shrink-0"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg mt-6 hover:bg-emerald-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Delivery Information</h2>
          <form onSubmit={handlePlaceOrder} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.name}
                  onChange={(e) => setAddress({...address, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({...address, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Street Address</label>
              <input
                type="text"
                required
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800 dark:text-white">Pincode</label>
                <input
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({...address, pincode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Order Summary</h3>
              <div className="text-sm space-y-1">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-bold flex justify-between">
                  <span>Total</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 order-2 sm:order-1"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 order-1 sm:order-2"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart;