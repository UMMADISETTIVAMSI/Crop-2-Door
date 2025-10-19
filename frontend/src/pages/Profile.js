import React, { useState } from 'react';
import { auth } from '../utils/api';

const Profile = ({ user, setUser }) => {

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    farmName: user.farmName || '',
    address: user.address || '',
    profileImage: user.profileImage || '',
    deliveryArea: user.deliveryArea || ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({...profile, profileImage: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { email, ...updateData } = profile;
      const response = await auth.updateProfile(updateData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {(profile.profileImage || user.profileImage) ? (
                    <img 
                      src={profile.profileImage || user.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">👤</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-2">
                <i className={`fas ${user.role === 'farmer' ? 'fa-seedling' : 'fa-user'} text-sm`}></i>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{user.name}</h1>
              <p className="text-emerald-600 font-semibold text-lg capitalize mb-2">{user.role}</p>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              {user.role === 'farmer' && user.farmName && (
                <p className="text-blue-600 font-medium mt-1">🌾 {user.farmName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-8">
          <div className="p-8">
                {!isEditing ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Personal Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Name:</span>
                            <span className="font-medium dark:text-white">{user.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Email:</span>
                            <span className="font-medium dark:text-white">{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Role:</span>
                            <span className="font-medium dark:text-white capitalize">{user.role}</span>
                          </div>
                          {user.phone && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                              <span className="font-medium dark:text-white">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {user.role === 'farmer' && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                          <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">Farm Details</h3>
                          <div className="space-y-3">
                            {user.farmName && (
                              <div className="flex justify-between">
                                <span className="text-emerald-600 dark:text-emerald-400">Farm Name:</span>
                                <span className="font-medium dark:text-white">{user.farmName}</span>
                              </div>
                            )}
                            {user.deliveryArea && (
                              <div className="flex justify-between">
                                <span className="text-emerald-600 dark:text-emerald-400">Delivery Area:</span>
                                <span className="font-medium dark:text-white">{user.deliveryArea}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Contact Information</h3>
                        <div className="space-y-3">
                          {user.address && (
                            <div>
                              <span className="text-blue-600 dark:text-blue-400 block mb-1">Address:</span>
                              <span className="font-medium dark:text-white">{user.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">Account Status</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Profile Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          onChange={handleImageUpload}
                        />
                        {profile.profileImage && (
                          <img src={profile.profileImage} alt="Preview" className="w-20 h-20 rounded-full mt-2 object-cover" />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Name</label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Phone</label>
                        <input
                          type="tel"
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {user.role === 'farmer' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Farm Name</label>
                            <input
                              type="text"
                              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                              value={profile.farmName}
                              onChange={(e) => setProfile({...profile, farmName: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Delivery Area</label>
                            <input
                              type="text"
                              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                              value={profile.deliveryArea}
                              onChange={(e) => setProfile({...profile, deliveryArea: e.target.value})}
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 dark:text-white mb-2">Address</label>
                        <textarea
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          value={profile.address}
                          onChange={(e) => setProfile({...profile, address: e.target.value})}
                          rows="3"
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        <i className="fas fa-save mr-2"></i>Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                      >
                        <i className="fas fa-times mr-2"></i>Cancel
                      </button>
                    </div>
                  </form>
                )}
                
                {!isEditing && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      <i className="fas fa-edit mr-2"></i>Edit Profile
                    </button>
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;