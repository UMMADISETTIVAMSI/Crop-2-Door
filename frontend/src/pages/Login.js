import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../utils/api';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await auth.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 pt-24">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-2xl transition-colors duration-200">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">
              <i className="fas fa-sign-in-alt text-blue-400"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-300">Sign in to your Crop2Door account</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl mb-6 flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6" noValidate autoComplete="on">
            <div>
              <label className="block text-gray-800 dark:text-white font-semibold mb-2">
                <i className="fas fa-envelope mr-2 text-blue-400"></i>Email or Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter your email or username"
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value.trim()})}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                noValidate
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-800 dark:text-white font-semibold mb-2">
                <i className="fas fa-lock mr-2 text-blue-400"></i>Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-4 text-gray-600 dark:text-gray-400 hover:opacity-70 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-emerald-400 text-white p-4 rounded-xl font-semibold hover:from-blue-500 hover:to-emerald-500 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account? 
              <Link to="/register" className="text-blue-500 hover:text-blue-600 font-semibold ml-1 hover:underline transition-colors duration-200">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;