import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiService } from '../services/apiService';
import { FileText } from 'lucide-react';
import CertificateModal from '../components/CertificateModal';

interface StudentItem {
  _id?: string;
  firstName?: string;
  lastName?: string;
}

const Certificates: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiService.getAllStudents();
        console.log('API Response:', response);
        
        if (!response || response.success === false) {
          throw new Error(response?.error || 'Failed to fetch students');
        }

        // The API returns: { success: true, data: { students: [...], pagination: {...} } }
        const outer = response.data as any;
        console.log('Outer data:', outer);
        const payload = outer?.data ?? outer; // handle potential nesting
        console.log('Payload:', payload);
        const list: StudentItem[] = Array.isArray(payload?.students) ? payload.students : [];
        console.log('Final students list:', list);

        setStudents(list);
      } catch (e: any) {
        setError(e?.message || 'Failed to load students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleGenerateCertificate = (student: StudentItem) => {
    console.log('Generating certificate for student:', student);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Certificates</h1>
          <p className="text-gray-600">Generate certificates for students</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Students List</h3>
            </div>
            
            {students.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <div 
                    key={student._id || `${student.firstName}-${student.lastName}-${index}`}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {(student.firstName?.charAt(0) || '').toUpperCase()}
                            {(student.lastName?.charAt(0) || '').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(student.firstName || '').trim()} {(student.lastName || '').trim()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Student ID: {student._id || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleGenerateCertificate(student)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Certificate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Certificate Generation Modal */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
      />
    </Layout>
  );
};

export default Certificates;
