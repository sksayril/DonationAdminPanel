import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Plus, User, BookOpen, Calendar, DollarSign, CreditCard } from 'lucide-react';

interface EnrollStudentForm {
  studentId: string;
  courseId: string;
  batchId: string;
  paymentAmount: number;
  paymentMethod: string;
}

const Enrolment: React.FC = () => {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<EnrollStudentForm>({
    studentId: '',
    courseId: '',
    batchId: '',
    paymentAmount: 0,
    paymentMethod: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'paymentAmount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      console.log('Submitting enrollment data:', formData);

      const response = await fetch('http://localhost:3100/api/admin/enroll-student', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResponseMessage({ 
          type: 'success', 
          text: data.message || 'Student enrolled successfully!' 
        });
        setFormData({
          studentId: '',
          courseId: '',
          batchId: '',
          paymentAmount: 0,
          paymentMethod: ''
        });
        // Close modal after a short delay to show success message
        setTimeout(() => {
          setShowEnrollModal(false);
          setResponseMessage(null);
        }, 2000);
      } else {
        setResponseMessage({ 
          type: 'error', 
          text: data.message || data.error || 'Failed to enroll student' 
        });
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      setResponseMessage({ 
        type: 'error', 
        text: 'Network error: Unable to connect to the server. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowEnrollModal(false);
    setResponseMessage(null);
  };

  const testApiConnection = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setResponseMessage({ 
          type: 'error', 
          text: 'No authentication token found. Please login first.' 
        });
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const testData = {
        studentId: "test_student_123",
        courseId: "test_course_456", 
        batchId: "test_batch_789",
        paymentAmount: 3999,
        paymentMethod: "cash"
      };

      console.log('Testing API with data:', testData);

      const response = await fetch('http://localhost:3100/api/admin/enroll-student', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      console.log('Test API response:', data);

      if (response.ok) {
        setResponseMessage({ 
          type: 'success', 
          text: 'API test successful! Server is responding correctly.' 
        });
      } else {
        setResponseMessage({ 
          type: 'error', 
          text: `API test failed: ${data.message || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('API test error:', error);
      setResponseMessage({ 
        type: 'error', 
        text: 'API test failed: Network error or server not running.' 
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Student Enrollment</h2>
          <div className="flex gap-2">
            <button 
              onClick={testApiConnection}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              Test API
            </button>
            <button 
              onClick={() => setShowEnrollModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Enroll Student
            </button>
          </div>
        </div>

        {/* Enrollment Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800">Enroll Student</h3>
              </div>

              {responseMessage && (
                <div className={`p-4 m-4 rounded ${responseMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {responseMessage.text}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID *</label>
                    <input
                      type="text"
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter batch ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Payment Amount (Rs.) *
                    </label>
                    <input
                      type="number"
                      name="paymentAmount"
                      value={formData.paymentAmount}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="3999"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Payment Method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
          <p className="text-gray-500 mb-6">Start by enrolling your first student using the button above.</p>
          <button 
            onClick={() => setShowEnrollModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Enroll Student
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Enrolment;