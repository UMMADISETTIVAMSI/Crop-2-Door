import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LocationSelector from '../components/LocationSelector';

const Home = () => {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState('');

  const handleAreaSelect = (area, showProducts = false) => {
    setSelectedArea(area);
    if (showProducts && area) {
      // Save selected area to localStorage for persistence
      localStorage.setItem('selectedDeliveryArea', area);
      // Navigate to dashboard with area filter
      navigate('/dashboard', { state: { deliveryArea: area } });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="pt-20">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-800 dark:text-white">
              <i className="fas fa-seedling mr-4"></i>
              Crop2Door
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-gray-800 dark:text-gray-200 font-light">
              Connecting Farmers & Consumers Directly
            </p>
            <p className="text-lg mb-12 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Skip the middleman. Get fresh, organic produce straight from local farms to your table.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white dark:bg-gray-800 text-emerald-500 dark:text-emerald-400 px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-xl">
                <i className="fas fa-rocket mr-2"></i>Start Your Journey
              </Link>
              <Link to="/login" className="border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-300 hover:scale-105">
                <i className="fas fa-sign-in-alt mr-2"></i>Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selector Section */}
      <div className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <LocationSelector 
            onAreaSelect={handleAreaSelect}
            selectedArea={selectedArea}
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Why Choose Crop2Door?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Experience the difference of direct farm-to-table shopping</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4 text-emerald-500">
                <i className="fas fa-leaf"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Fresh & Organic</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Get the freshest, pesticide-free produce harvested just for you from certified organic farms.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4 text-emerald-500">
                <i className="fas fa-heart"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Support Local</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Directly support local farmers and contribute to your community's economic growth.</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home;