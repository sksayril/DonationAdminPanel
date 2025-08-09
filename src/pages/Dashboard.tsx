import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Building2, GraduationCap, CreditCard, User, Shield, Clock, BookOpen, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Dashboard: React.FC = () => {
  const { adminData, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string>('');
  
  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { title: 'Societies', value: '12', icon: Building2, color: 'bg-green-500' },
    { title: 'Active Batches', value: '8', icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'Pending Fees', value: '₹45,600', icon: CreditCard, color: 'bg-red-500' },
  ];

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.clear();
    
    // Call logout from auth context if available
    if (logout) {
      logout();
    }
    
    // Redirect to login page
    window.location.href = '/login';
  };

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError('');
        
        const token = localStorage.getItem('authToken');
        const headers = {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        };

        const response = await fetch('http://localhost:3100/api/admin/dashboard', {
          method: 'GET',
          headers: headers
        });

        const data = await response.json();
        console.log('Dashboard API Response:', data);

        if (response.ok && data.data) {
          setDashboardData(data.data);
        } else {
          setDashboardError(data.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setDashboardError('An unexpected error occurred while fetching dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (adminData) {
      fetchDashboardData();
    }
  }, [adminData]);

  return (
    <Layout>
      <div>
        {/* Dashboard Data Section */}
        {dashboardLoading ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        ) : dashboardError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Dashboard Data</h2>
            <p className="text-sm text-red-600 mt-1">{dashboardError}</p>
          </div>
        ) : dashboardData ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <p className="text-sm text-gray-500">Real-time system statistics and insights</p>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
            
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Students */}
              {dashboardData.totalStudents !== undefined && (
                <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Students</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.totalStudents}</p>
                  </div>
                </div>
              )}

              {/* Active Students */}
              {dashboardData.activeStudents !== undefined && (
                <div className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Active</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Students</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.activeStudents}</p>
                  </div>
                </div>
              )}

              {/* Total Courses */}
              {dashboardData.totalCourses !== undefined && (
                <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-violet-50 rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Courses</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.totalCourses}</p>
                  </div>
                </div>
              )}

              {/* Total Batches */}
              {dashboardData.totalBatches !== undefined && (
                <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 rounded-2xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Batches</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.totalBatches}</p>
                  </div>
                </div>
              )}

              {/* Total Enrollments */}
              {dashboardData.totalEnrollments !== undefined && (
                <div className="bg-gradient-to-br from-red-50 via-red-100 to-pink-50 rounded-2xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Enrollments</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.totalEnrollments}</p>
                  </div>
                </div>
              )}
            </div>

            {/* KYC Stats Section */}
            {dashboardData.kycStats && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">KYC Statistics</h3>
                    <p className="text-sm text-gray-500">Know Your Customer verification status</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Pending KYC */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pending</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.kycStats.pending}</p>
                    <p className="text-sm text-gray-600 mt-1">Awaiting Review</p>
                  </div>

                  {/* Submitted KYC */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Submitted</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.kycStats.submitted}</p>
                    <p className="text-sm text-gray-600 mt-1">Under Review</p>
                  </div>

                  {/* Approved KYC */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Approved</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.kycStats.approved}</p>
                    <p className="text-sm text-gray-600 mt-1">Verified</p>
                  </div>

                  {/* Rejected KYC */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <X className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Rejected</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.kycStats.rejected}</p>
                    <p className="text-sm text-gray-600 mt-1">Needs Action</p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">System Summary</h3>
                  <p className="text-sm text-gray-500">Key metrics overview</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-blue-100">
                  <span className="text-sm font-medium text-gray-700">Total Students</span>
                  <span className="text-lg font-bold text-blue-600">{dashboardData.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-green-100">
                  <span className="text-sm font-medium text-gray-700">Active Students</span>
                  <span className="text-lg font-bold text-green-600">{dashboardData.activeStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-purple-100">
                  <span className="text-sm font-medium text-gray-700">Total Courses</span>
                  <span className="text-lg font-bold text-purple-600">{dashboardData.totalCourses}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-orange-100">
                  <span className="text-sm font-medium text-gray-700">Total Batches</span>
                  <span className="text-lg font-bold text-orange-600">{dashboardData.totalBatches}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-red-100">
                  <span className="text-sm font-medium text-gray-700">Total Enrollments</span>
                  <span className="text-lg font-bold text-red-600">{dashboardData.totalEnrollments}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-emerald-100">
                  <span className="text-sm font-medium text-gray-700">KYC Approved</span>
                  <span className="text-lg font-bold text-emerald-600">{dashboardData.kycStats?.approved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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