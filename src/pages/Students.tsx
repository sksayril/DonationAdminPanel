import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Search, Filter, Eye, Edit, Trash2, Plus } from 'lucide-react';
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
                        <button className="text-blue-600 hover:text-blue-900">
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
                      <button className="text-blue-600 hover:text-blue-900">
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
      </div>
    </Layout>
  );
};

export default Students;