import React, { useState, useEffect } from 'react';
import { auth } from '../utils/api';

const LocationSelector = ({ onAreaSelect, selectedArea }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveryAreas();
  }, []);

  const loadDeliveryAreas = async () => {
    try {
      console.log('Loading farmer delivery areas...');
      const response = await auth.getFarmerAreas();
      console.log('Farmer areas response:', response.data);
      setAreas(response.data || []);
    } catch (error) {
      console.error('Error loading farmer areas:', error);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-xl max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">
          <i className="fas fa-map-marker-alt text-emerald-500"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          🥕 Find Local Produce Near You
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Select your delivery area to see what's fresh from farmers in your location.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading areas...</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <select
              value={selectedArea}
              onChange={(e) => onAreaSelect(e.target.value)}
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="">Select your delivery area</option>
              {areas.map((area, index) => (
                <option key={index} value={area.area}>
                  {area.area}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            📍 {areas.length > 0 ? 'Only areas with active farmers are listed.' : 'Select an area to see available products.'}
          </p>

          <button
            onClick={() => selectedArea && onAreaSelect(selectedArea, true)}
            disabled={!selectedArea}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white p-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <i className="fas fa-search mr-2"></i>
            Show Available Produce
          </button>
        </>
      )}
    </div>
  );
};

export default LocationSelector;