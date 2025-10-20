import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../utils/api';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', role: 'client', phone: '', address: '', farmName: '', deliveryArea: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill all required fields');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setRegistering(true);
    try {
      console.log('Registering with data:', { ...formData, password: '***' });
      const response = await auth.register(formData);
      console.log('Registration successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Register</h2>
        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value.trim()})}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white pr-12"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️🗨️'}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Role</label>
            <select
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="client">Client</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          {formData.role === 'farmer' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Farm Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={formData.farmName}
                  onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Delivery Area</label>
                <input
                  type="text"
                  placeholder="Enter your delivery area (e.g., Mumbai - Andheri)"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={formData.deliveryArea}
                  onChange={(e) => setFormData({...formData, deliveryArea: e.target.value})}
                  required
                />
              </div>
            </>
          )}
          <button 
            type="submit" 
            disabled={registering}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registering ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
          Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;