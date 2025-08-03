import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Search, Filter, Eye, Edit, Trash2, Plus, X, Loader2 } from 'lucide-react';
import apiService from '../services/apiService';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface KycDocuments {
  aadharCard: {
    number: string;
    document: string;
  };
  panCard: {
    number: string;
    document: string;
  };
  profilePhoto: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  studentId: string;
  kycStatus: string;
  isKycApproved: boolean;
  isAccountActive: boolean;
  address: Address;
  kycDocuments: KycDocuments;
  enrollments: any[];
  marksheets: any[];
  certificates: any[];
  createdAt: string;
  updatedAt: string;
  signupTime: string;
  originalPassword?: string;
  kycRejectionReason?: string;
  kycApprovedAt?: string;
  kycApprovedBy?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state for student details popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string>('');
  // State for change password UI
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await apiService.getAllStudents();
        
        if (response.success && response.data) {
          console.log('Students API Response:', response);
          // Handle the API response structure: { success: true, data: { students: [...], pagination: {...} } }
          const responseData = response.data.data || response.data;
          
          if (responseData.students && Array.isArray(responseData.students)) {
            setStudents(responseData.students);
            setPagination(responseData.pagination || null);
          } else {
            setStudents([]);
            setPagination(null);
          }
        } else {
          setError(response.error || 'Failed to fetch students');
        }
      } catch (error) {
        console.error('Students fetch error:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Function to fetch student details by ID
  const fetchStudentDetails = async (studentId: string) => {
    try {
      setModalLoading(true);
      setModalError('');
      setIsModalOpen(true);
      
      const response = await apiService.getStudentById(studentId);
      
      if (response.success && response.data) {
        console.log('Student details API Response:', response);
        // Handle the nested data structure from the API
        const studentData = response.data.data || response.data;
        setSelectedStudentDetails(studentData);
      } else {
        setModalError(response.error || 'Failed to fetch student details');
      }
    } catch (error) {
      console.error('Student details fetch error:', error);
      setModalError('An unexpected error occurred');
    } finally {
      setModalLoading(false);
    }
  };

  // Function to handle password change
  const handleSavePassword = async () => {
    if (!newPassword.trim()) {
      setPasswordChangeMessage('Please enter a new password');
      return;
    }

    if (!selectedStudentDetails?._id) {
      setPasswordChangeMessage('Student ID not found');
      return;
    }

    try {
      setPasswordChangeLoading(true);
      setPasswordChangeMessage('');

      const response = await apiService.resetStudentPassword(
        selectedStudentDetails._id,
        newPassword
      );

      if (response.success) {
        setPasswordChangeMessage('Password changed successfully!');
        setNewPassword('');
        setShowChangePassword(false);
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setPasswordChangeMessage('');
        }, 3000);
      } else {
        setPasswordChangeMessage(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordChangeMessage('Error changing password. Please try again.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudentDetails(null);
    setModalError('');
    setShowChangePassword(false);
    setNewPassword('');
    setPasswordChangeMessage('');
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Students</h1>
            <p className="text-gray-600">Manage and view all student information</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-start sm:self-auto mt-4 sm:mt-0">
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 justify-center sm:justify-start">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Students</h2>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Stats Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  All Students ({filteredStudents.length})
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Total: {pagination?.totalStudents || students.length}</span>
                  <span>Active: {students.filter(s => s.isAccountActive).length}</span>
                  <span>KYC Approved: {students.filter(s => s.isKycApproved).length}</span>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{student.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.address.city}, {student.address.state}</div>
                        <div className="text-sm text-gray-500">{student.address.pincode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            student.kycStatus === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : student.kycStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.kycStatus.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.isAccountActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.isAccountActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => fetchStudentDetails(student._id)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first student.'}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div key={student._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-xs text-gray-500">{student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        student.kycStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : student.kycStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        KYC: {student.kycStatus.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        student.isAccountActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isAccountActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="block text-gray-500">Email</span>
                      <span className="font-medium">{student.email}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Phone</span>
                      <span className="font-medium">{student.phone}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Gender</span>
                      <span className="font-medium capitalize">{student.gender}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Date of Birth</span>
                      <span className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-gray-500">Address</span>
                      <span className="font-medium">{student.address.street}, {student.address.city}, {student.address.state} - {student.address.pincode}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      <div>Signup: {new Date(student.signupTime).toLocaleDateString()}</div>
                      {student.kycApprovedAt && (
                        <div>KYC Approved: {new Date(student.kycApprovedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => fetchStudentDetails(student._id)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first student.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    type="button"
                    onClick={() => setShowChangePassword((v) => !v)}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              {/* Change Password Input Module */}
              {showChangePassword && (
                <div className="flex flex-col md:flex-row items-center gap-2 p-4 border-b bg-blue-50">
                  <input
                    type="password"
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoFocus
                    disabled={passwordChangeLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleSavePassword()}
                  />
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                      type="button"
                      onClick={handleSavePassword}
                      disabled={passwordChangeLoading}
                    >
                      {passwordChangeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Password
                    </button>
                    <button
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors font-medium"
                      type="button"
                      onClick={() => { 
                        setShowChangePassword(false); 
                        setNewPassword(''); 
                        setPasswordChangeMessage('');
                      }}
                      disabled={passwordChangeLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Password Change Message */}
              {passwordChangeMessage && (
                <div className={`p-4 border-b ${
                  passwordChangeMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <p className="text-sm font-medium">{passwordChangeMessage}</p>
                </div>
              )}

              {/* Modal Content */}
<div className="p-6">
  {modalLoading ? (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading student details...</span>
    </div>
  ) : modalError ? (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Details</h3>
      <p className="text-red-600">{modalError}</p>
    </div>
  ) : selectedStudentDetails ? (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Student ID</label>
            <p className="text-sm text-gray-900">{selectedStudentDetails.studentId || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name</label>
            <p className="text-sm text-gray-900">
              {selectedStudentDetails.firstName} {selectedStudentDetails.lastName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="text-sm text-gray-900">{selectedStudentDetails.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Phone</label>
            <p className="text-sm text-gray-900">{selectedStudentDetails.phone || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
            <p className="text-sm text-gray-900">
              {selectedStudentDetails.dateOfBirth
                ? new Date(selectedStudentDetails.dateOfBirth).toLocaleDateString()
                : '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Gender</label>
            <p className="text-sm text-gray-900 capitalize">{selectedStudentDetails.gender || '-'}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      {selectedStudentDetails.address && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Street</label>
              <p className="text-sm text-gray-900">{selectedStudentDetails.address.street}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">City</label>
              <p className="text-sm text-gray-900">{selectedStudentDetails.address.city}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">State</label>
              <p className="text-sm text-gray-900">{selectedStudentDetails.address.state}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Pincode</label>
              <p className="text-sm text-gray-900">{selectedStudentDetails.address.pincode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Account & KYC Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account & KYC Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Account Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              selectedStudentDetails.isAccountActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedStudentDetails.isAccountActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">KYC Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              selectedStudentDetails.isKycApproved
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedStudentDetails.isKycApproved ? 'Approved' : 'Not Approved'}
            </span>
          </div>
          {selectedStudentDetails.kycApprovedAt && (
            <div>
              <label className="block text-sm font-medium text-gray-600">KYC Approved At</label>
              <p className="text-sm text-gray-900">
                {new Date(selectedStudentDetails.kycApprovedAt).toLocaleString()}
              </p>
            </div>
          )}
          {selectedStudentDetails.kycApprovedBy && (
            <div>
              <label className="block text-sm font-medium text-gray-600">KYC Approved By</label>
              <p className="text-sm text-gray-900">
                {selectedStudentDetails.kycApprovedBy.firstName} {selectedStudentDetails.kycApprovedBy.lastName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KYC Documents */}
      {selectedStudentDetails.kycDocuments && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">KYC Documents</h3>
          <div className="space-y-4">
            {selectedStudentDetails.kycDocuments.aadharCard && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Aadhar Card</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="text-xs text-gray-500">Number:</span>
                  <span className="text-sm text-gray-900 font-mono">{selectedStudentDetails.kycDocuments.aadharCard.number}</span>
                  <span className="text-xs text-gray-500">Document:</span>
                  <a
                    href={selectedStudentDetails.kycDocuments.aadharCard.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {selectedStudentDetails.kycDocuments.aadharCard.document}
                  </a>
                </div>
              </div>
            )}
            {selectedStudentDetails.kycDocuments.panCard && (
              <div>
                <label className="block text-sm font-medium text-gray-600">PAN Card</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="text-xs text-gray-500">Number:</span>
                  <span className="text-sm text-gray-900 font-mono">{selectedStudentDetails.kycDocuments.panCard.number}</span>
                  <span className="text-xs text-gray-500">Document:</span>
                  <a
                    href={selectedStudentDetails.kycDocuments.panCard.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {selectedStudentDetails.kycDocuments.panCard.document}
                  </a>
                </div>
              </div>
            )}
            {selectedStudentDetails.kycDocuments.profilePhoto && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Profile Photo</label>
                <a
                  href={selectedStudentDetails.kycDocuments.profilePhoto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {selectedStudentDetails.kycDocuments.profilePhoto}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Academic Records */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Enrollments */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Enrollments</h4>
            {selectedStudentDetails.enrollments && selectedStudentDetails.enrollments.length > 0 ? (
              selectedStudentDetails.enrollments.map((enrollment: any, idx: number) => (
                <div key={idx} className="mb-2 p-2 bg-white rounded border">
                  <div>
                    <span className="font-semibold">Course:</span> {enrollment.course?.title}
                  </div>
                  <div>
                    <span className="font-semibold">Batch:</span> {enrollment.batch?.name}
                  </div>
                  <div>
                    <span className="font-semibold">Enrollment Date:</span> {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : '-'}
                  </div>
                  <div>
                    <span className="font-semibold">Payment Status:</span> {enrollment.paymentStatus}
                  </div>
                  <div>
                    <span className="font-semibold">Payment Amount:</span> ₹{enrollment.paymentAmount}
                  </div>
                  <div>
                    <span className="font-semibold">Payment Method:</span> {enrollment.paymentMethod}
                  </div>
                  <div>
                    <span className="font-semibold">Active:</span> {enrollment.isActive ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-semibold">Batch Dates:</span> {enrollment.batch?.startDate ? new Date(enrollment.batch.startDate).toLocaleDateString() : '-'} to {enrollment.batch?.endDate ? new Date(enrollment.batch.endDate).toLocaleDateString() : '-'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No enrollments found</p>
            )}
          </div>
          {/* Marksheets */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Marksheets</h4>
            {selectedStudentDetails.marksheets && selectedStudentDetails.marksheets.length > 0 ? (
              selectedStudentDetails.marksheets.map((marksheet: any, idx: number) => (
                <div key={idx} className="mb-2 p-2 bg-white rounded border">
                  <div>
                    <span className="font-semibold">Course:</span> {marksheet.course?.title}
                  </div>
                  <div>
                    <span className="font-semibold">Marks:</span> {marksheet.marks}
                  </div>
                  <div>
                    <span className="font-semibold">Grade:</span> {marksheet.grade}
                  </div>
                  <div>
                    <span className="font-semibold">Issued Date:</span> {marksheet.issuedDate ? new Date(marksheet.issuedDate).toLocaleDateString() : '-'}
                  </div>
                  <div>
                    <span className="font-semibold">Issued By:</span> {marksheet.issuedBy?.firstName} {marksheet.issuedBy?.lastName}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No marksheets found</p>
            )}
          </div>
          {/* Certificates */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Certificates</h4>
            {selectedStudentDetails.certificates && selectedStudentDetails.certificates.length > 0 ? (
              selectedStudentDetails.certificates.map((certificate: any, idx: number) => (
                <div key={idx} className="mb-2 p-2 bg-white rounded border">
                  <div>
                    <span className="font-semibold">Course:</span> {certificate.course?.title}
                  </div>
                  <div>
                    <span className="font-semibold">Certificate Number:</span> {certificate.certificateNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Issued Date:</span> {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : '-'}
                  </div>
                  <div>
                    <span className="font-semibold">Issued By:</span> {certificate.issuedBy?.firstName} {certificate.issuedBy?.lastName}
                  </div>
                  <div>
                    <span className="font-semibold">Certificate File:</span>
                    <a
                      href={certificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {certificate.certificateUrl}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No certificates found</p>
            )}
          </div>
        </div>
      </div>

      {/* Security & System Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security & System Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Original Password</label>
            <p className="text-sm text-gray-900 font-mono bg-blue-50 p-2 rounded border">
              {selectedStudentDetails.originalPassword}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Encrypted Password</label>
            <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded border break-all">
              {selectedStudentDetails.password}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Database ID</label>
            <p className="text-xs text-gray-600 font-mono bg-gray-100 p-1 rounded">
              {selectedStudentDetails._id}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Signup Time</label>
            <p className="text-sm text-gray-900">
              {selectedStudentDetails.signupTime
                ? new Date(selectedStudentDetails.signupTime).toLocaleString()
                : '-'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">KYC Approved At</label>
            <p className="text-sm text-gray-900">
              {selectedStudentDetails.kycApprovedAt
                ? new Date(selectedStudentDetails.kycApprovedAt).toLocaleString()
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null}
</div>
              

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Students;