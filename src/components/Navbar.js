import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';


const Navbar = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-xl fixed w-full top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white hover:opacity-80 transition-all duration-200">
            <i className="fas fa-leaf mr-2"></i>Crop2Door
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white">
                  <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
                </Link>
                {user.role === 'client' && (
                  <Link to="/cart" className="relative flex items-center px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white">
                    <i className="fas fa-shopping-cart mr-2"></i>Cart
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getCartCount()}
                      </span>
                    )}
                  </Link>
                )}
                
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white"
                  >
                    <i className="fas fa-bars text-lg"></i>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white rounded-t-lg"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="fas fa-user mr-3"></i>Profile
                      </Link>
                      <button 
                        onClick={() => { toggleTheme(); setDropdownOpen(false); }}
                        className="flex items-center w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white text-left"
                      >
                        <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} mr-3`}></i>{isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>

                      <button 
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="flex items-center w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 text-red-600 dark:text-red-400 text-left rounded-b-lg border-t border-gray-200 dark:border-gray-700"
                      >
                        <i className="fas fa-sign-out-alt mr-3"></i>Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center px-6 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white">
                  <i className="fas fa-sign-in-alt mr-2"></i>Login
                </Link>
                <button onClick={toggleTheme} className="flex items-center px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white">
                  <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} mr-2`}></i>{isDark ? 'Light' : 'Dark'}
                </button>

                <Link to="/register" className="flex items-center px-6 py-2 bg-emerald-400 text-white rounded-full hover:bg-emerald-500 transition-all duration-200 shadow-lg font-semibold">
                  <i className="fas fa-user-plus mr-2"></i>Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl text-gray-800 dark:text-white`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3 pt-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <i className="fas fa-tachometer-alt mr-3"></i>Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <i className="fas fa-user mr-3"></i>Profile
                  </Link>
                  {user.role === 'client' && (
                    <Link 
                      to="/cart" 
                      className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      <i className="fas fa-shopping-cart mr-3"></i>Cart
                      {getCartCount() > 0 && (
                        <span className="ml-2 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getCartCount()}
                        </span>
                      )}
                    </Link>
                  )}
                  <button 
                    onClick={() => { toggleTheme(); setIsOpen(false); }} 
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white w-full text-left"
                  >
                    <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} mr-3`}></i>{isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="flex items-center px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 text-white w-full text-left"
                  >
                    <i className="fas fa-sign-out-alt mr-3"></i>Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <i className="fas fa-sign-in-alt mr-3"></i>Login
                  </Link>
                  <button 
                    onClick={() => { toggleTheme(); setIsOpen(false); }} 
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-800 dark:text-white w-full text-left"
                  >
                    <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} mr-3`}></i>{isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <Link 
                    to="/register" 
                    className="flex items-center px-4 py-3 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-all duration-200 font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    <i className="fas fa-user-plus mr-3"></i>Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;