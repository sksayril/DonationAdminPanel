import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

// Define the structure for KYC documents
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

// Define the Student interface
interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  kycStatus: 'pending' | 'submitted' | 'approved' | 'declined';
  kycDocuments: KycDocuments;
}

// Helper function to create a valid image URL from the backend path
const getImageUrl = (path: string) => {
  if (!path) return '';
  // The base URL of your backend server
  const baseUrl = 'http://localhost:3100'; 
  // Extracts the relative path starting from 'uploads'
  const relativePath = path.split('uploads')[1];
  if (!relativePath) return '';
  // Replaces backslashes with forward slashes for URL compatibility
  return `${baseUrl}/uploads${relativePath.replace(/\\/g, '/')}`;
}

const KYCRequest: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleKYCApprove = async (studentId: string) => {
    try {
      const response = await apiService.post(`/students/${studentId}/approve-kyc`, {
        studentId: studentId
      });
      if (response.success) {
        // Update the student's KYC status in the local state
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.studentId === studentId 
              ? { ...student, kycStatus: 'approved' }
              : student
          )
        );
        // Show success message
        setSuccessMessage('KYC approved successfully');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to approve KYC');
      }
    } catch (err) {
      console.error('KYC approval error:', err);
      setError('An error occurred while approving KYC');
    }
  };

  const handleKYCDecline = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowDeclineModal(true);
  };

  const handleDeclineSubmit = async () => {
    if (!selectedStudentId || !declineReason.trim()) {
      setError('Please provide a reason for declining KYC');
      return;
    }

    try {
      const response = await apiService.post(`/students/${selectedStudentId}/reject-kyc`, { 
        reason: declineReason.trim()
      });
      
      if (response.success) {
        // Update the student's KYC status in the local state
        setStudents(prevStudents => 
          prevStudents.map(student => 
            student.studentId === selectedStudentId 
              ? { ...student, kycStatus: 'declined' }
              : student
          )
        );
        setShowDeclineModal(false);
        setSelectedStudentId(null);
        setDeclineReason('');
        // Show success message from API response
        setSuccessMessage(response.data.message || 'KYC rejected successfully');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.data.message || 'Failed to decline KYC');
      }
    } catch (err) {
      console.error('KYC decline error:', err);
      setError('An error occurred while declining KYC');
    }
  };

  const handleCloseModal = () => {
    setShowDeclineModal(false);
    setSelectedStudentId(null);
    setDeclineReason('');
    setError(null);
  };

  const fetchKYCRequests = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/students');

      // Log the full response for debugging
      console.log('API Response:', response);

        if (response.success && response.data.data && response.data.data.students) {
          const { students } = response.data.data; // Extract students from the response
          setStudents(students);
        } else {
          setStudents([]); // Set empty array if students are not available
          setError(response.message || 'Failed to fetch KYC requests');
        }
    } catch (err) {
      console.error('Fetch KYC error:', err);
      setError('An error occurred while fetching KYC requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-gray-700">Loading student KYC requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800">KYC Requests</h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}
      {students.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No KYC requests found</div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow flex items-center justify-between">
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-gray-800">{student.firstName}</h2>
                <p className="text-sm text-gray-600">Student ID: {student._id}</p>

                {/* KYC Documents Display - Small Previews */}
                {student.kycDocuments && (
                  <div className="mt-3">
                    <div className="flex items-center gap-4">
                      {/* Aadhar Number */}
                      {student.kycDocuments.aadharCard && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Aadhar:</span> {student.kycDocuments.aadharCard.number}
                        </p>
                      )}
                    </div>
                    
                    {/* Image Previews */}
                    <div className="flex gap-3 mt-2">
                      {/* Profile Photo Preview */}
                      {student.kycDocuments.profilePhoto && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Profile</p>
                          <a href={getImageUrl(student.kycDocuments.profilePhoto)} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={getImageUrl(student.kycDocuments.profilePhoto)} 
                              alt="Profile" 
                              className="w-16 h-16 object-cover rounded border hover:opacity-80 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                      
                      {/* Aadhar Card Preview */}
                      {student.kycDocuments.aadharCard?.document && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Aadhar Card</p>
                          <a href={getImageUrl(student.kycDocuments.aadharCard.document)} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={getImageUrl(student.kycDocuments.aadharCard.document)} 
                              alt="Aadhar Card" 
                              className="w-16 h-16 object-cover rounded border hover:opacity-80 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  student.kycStatus === 'approved' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : student.kycStatus === 'declined' 
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {student.kycStatus.charAt(0).toUpperCase() + student.kycStatus.slice(1)}
                </span>
                {student.kycStatus === 'approved' ? (
                  // No buttons shown for approved KYC
                  null
                ) : student.kycStatus === 'submitted' ? (
                  <>
                    <button
                      onClick={() => handleKYCApprove(student.studentId)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Approve KYC
                    </button>
                    <button
                      onClick={() => handleKYCDecline(student.studentId)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Decline KYC
                    </button>
                  </>
                ) : student.kycStatus === 'pending' ? (
                  <button
                    onClick={() => handleKYCApprove(student.studentId)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Approve KYC
                  </button>
                ) : student.kycStatus === 'declined' ? (
                  // No buttons shown for declined KYC
                  null
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline KYC Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Decline KYC Request</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="declineReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining KYC
              </label>
              <textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide a reason for declining this KYC request..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Decline KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCRequest;