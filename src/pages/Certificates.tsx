import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Plus, Award, User, BookOpen, Upload, X, Save } from 'lucide-react';

interface Certificate {
  id?: string;
  studentId: string;
  courseId: string;
  certificate: File | string;
  issuedDate?: string;
  issuedBy?: string;
  studentName?: string;
  courseName?: string;
}

interface CertificateFormData {
  studentId: string;
  courseId: string;
  certificate: File | null;
}

const Certificates: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState<CertificateFormData>({
    studentId: '',
    courseId: '',
    certificate: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setResponseMessage({
          type: 'error',
          message: 'Authentication token not found. Please login again.'
        });
        return;
      }

      // Validate file upload
      if (!formData.certificate) {
        setResponseMessage({
          type: 'error',
          message: 'Please select a certificate file to upload.'
        });
        return;
      }

      // Create FormData for file upload
      const certificateFormData = new FormData();
      certificateFormData.append('studentId', formData.studentId);
      certificateFormData.append('courseId', formData.courseId);
      certificateFormData.append('certificate', formData.certificate);

      console.log('Submitting certificate data:', {
        studentId: formData.studentId,
        courseId: formData.courseId,
        fileName: formData.certificate.name,
        fileSize: formData.certificate.size
      });

      const response = await fetch('http://localhost:3100/api/admin/certificates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - let the browser set it with boundary for FormData
        },
        body: certificateFormData
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResponseMessage({
          type: 'success',
          message: data.message || 'Certificate created successfully!'
        });
        
        // Reset form and close modal after success
        setTimeout(() => {
          setShowForm(false);
          setFormData({
            studentId: '',
            courseId: '',
            certificate: null
          });
        }, 2000);
      } else {
        setResponseMessage({
          type: 'error',
          message: data.message || data.error || 'Failed to create certificate'
        });
      }
    } catch (error) {
      console.error('Error creating certificate:', error);
      setResponseMessage({
        type: 'error',
        message: 'Network error: Unable to connect to the server. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setResponseMessage(null);
    setFormData({
      studentId: '',
      courseId: '',
      certificate: null
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Certificate Management</h1>
            <p className="text-gray-600">Create and manage student certificates</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Certificate
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Award className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Certificate</h3>
          <p className="text-gray-500 mb-6">Use the button above to create a new certificate for a student.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Certificate
          </button>
        </div>

        {/* Certificate Creation Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">Create Certificate</h3>
                  <button 
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {responseMessage && (
                <div className={`p-4 m-4 rounded ${responseMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {responseMessage.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter student ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course ID *</label>
                    <input
                      type="text"
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter course ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Certificate File *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <Award className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="certificate-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="certificate-upload"
                              name="certificate"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                    
                    {formData.certificate && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-blue-600 mr-2" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-900 truncate">
                              {formData.certificate.name}
                            </p>
                            <p className="text-xs text-blue-600">
                              {formatFileSize(formData.certificate.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create Certificate
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
