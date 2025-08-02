import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Building2, GraduationCap, CreditCard, User, Shield, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Dashboard: React.FC = () => {
  const { adminData } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string>('');
  
  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { title: 'Societies', value: '12', icon: Building2, color: 'bg-green-500' },
    { title: 'Active Batches', value: '8', icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'Pending Fees', value: '₹45,600', icon: CreditCard, color: 'bg-red-500' },
  ];

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError('');
        
        const response = await apiService.getAdminProfile();
        
        if (response.success && response.data) {
          console.log('Profile API Response:', response);
          // Handle the response structure: { success: true, data: { _id, firstName, ... } }
          setProfileData(response.data.data || response.data);
        } else {
          setProfileError(response.error || 'Failed to fetch profile');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setProfileError('An unexpected error occurred');
      } finally {
        setProfileLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (adminData) {
      fetchProfile();
    }
  }, [adminData]);

  return (
    <Layout>
      <div>
        {/* Admin Profile Section */}
        {profileLoading ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        ) : profileError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Profile</h2>
            <p className="text-sm text-red-600 mt-1">{profileError}</p>
          </div>
        ) : profileData ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between">
              {/* Main Profile Info */}
              <div className="flex-1 mb-4 lg:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">{profileData.role} • {profileData.adminId}</p>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    profileData.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profileData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Email:</span>
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Phone:</span>
                      <span>{profileData.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Last Login:</span>
                      <span>{new Date(profileData.lastLogin).toLocaleDateString()} {new Date(profileData.lastLogin).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Account Created:</span>
                      <span>{new Date(profileData.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Permissions ({profileData.permissions?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.permissions?.map((permission: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                      >
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

// Default export
export default Dashboard;