import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, MoreVertical, MapPin, Phone, Mail, Calendar, User, FileText } from 'lucide-react';
import apiService from '../../services/apiService';

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
  kycStatus: string;
  isKycApproved: boolean;
  isAccountActive: boolean;
  studentId: string;
  address: Address;
  kycDocuments: KycDocuments;
  createdAt: string;
  updatedAt: string;
  signupTime: string;
  enrollments: any[];
  marksheets: any[];
  certificates: any[];
}

const GetAllStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const toggleActions = (id: string) => {
    if (isActionsOpen === id) {
      setIsActionsOpen(null);
    } else {
      setIsActionsOpen(id);
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
    setIsActionsOpen(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get('/students');
        
        if (response.success && response.data.data && response.data.data.students) {
          setStudents(response.data.data.students);
        } else {
          setError('Failed to fetch students');
        }
      } catch (err) {
        console.error('Fetch students error:', err);
        setError('An error occurred while fetching students');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 sm:mb-0">All Students</h2>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search students by name, email, or student ID..."
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
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">{student.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.kycStatus)}`}>
                      {student.kycStatus.charAt(0).toUpperCase() + student.kycStatus.slice(1)}
                    </span>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleViewDetails(student)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredStudents.map((student) => (
            <div key={student._id} className="border-b p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => toggleActions(student._id)} 
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {isActionsOpen === student._id && (
                    <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-32">
                      <button 
                        onClick={() => handleViewDetails(student)}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      >
                        View Details
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <span className="block text-gray-500 mb-1">Student ID</span>
                  <span className="font-medium text-blue-600">{student.studentId}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Phone</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">KYC Status</span>
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(student.kycStatus)}`}>
                    {student.kycStatus.charAt(0).toUpperCase() + student.kycStatus.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Account</span>
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                    student.isAccountActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.isAccountActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <Calendar className="w-3 h-3 inline mr-1" />
                Joined: {formatDate(student.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Student Details - {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedStudent.firstName} {selectedStudent.lastName}</div>
                    <div><span className="font-medium">Student ID:</span> <span className="text-blue-600">{selectedStudent.studentId}</span></div>
                    <div><span className="font-medium">Email:</span> {selectedStudent.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedStudent.phone}</div>
                    <div><span className="font-medium">Gender:</span> <span className="capitalize">{selectedStudent.gender}</span></div>
                    <div><span className="font-medium">Date of Birth:</span> {formatDate(selectedStudent.dateOfBirth)}</div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Address
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Street:</span> {selectedStudent.address.street}</div>
                    <div><span className="font-medium">City:</span> {selectedStudent.address.city}</div>
                    <div><span className="font-medium">State:</span> {selectedStudent.address.state}</div>
                    <div><span className="font-medium">Pincode:</span> {selectedStudent.address.pincode}</div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Account Status
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">KYC Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedStudent.kycStatus)}`}>
                        {selectedStudent.kycStatus.charAt(0).toUpperCase() + selectedStudent.kycStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Account Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedStudent.isAccountActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStudent.isAccountActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div><span className="font-medium">Joined:</span> {formatDate(selectedStudent.createdAt)}</div>
                    <div><span className="font-medium">Last Updated:</span> {formatDate(selectedStudent.updatedAt)}</div>
                  </div>
                </div>

                {/* KYC Documents */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    KYC Documents
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Aadhar Number:</span> {selectedStudent.kycDocuments.aadharCard.number}</div>
                    <div><span className="font-medium">PAN Number:</span> {selectedStudent.kycDocuments.panCard.number}</div>
                    <div className="mt-3">
                      <span className="font-medium">Documents:</span>
                      <div className="mt-1 space-y-1">
                        <div className="text-xs text-blue-600">• Aadhar Card uploaded</div>
                        <div className="text-xs text-blue-600">• PAN Card uploaded</div>
                        <div className="text-xs text-blue-600">• Profile Photo uploaded</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Enrollments:</span>
                      <div className="text-gray-600">{selectedStudent.enrollments.length} courses</div>
                    </div>
                    <div>
                      <span className="font-medium">Certificates:</span>
                      <div className="text-gray-600">{selectedStudent.certificates.length} issued</div>
                    </div>
                    <div>
                      <span className="font-medium">Marksheets:</span>
                      <div className="text-gray-600">{selectedStudent.marksheets.length} generated</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllStudents;