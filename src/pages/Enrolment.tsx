import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Plus, User, BookOpen, Calendar, DollarSign, CreditCard, RefreshCw } from 'lucide-react';

interface EnrollStudentForm {
  studentId: string;
  courseId: string;
  batchId: string;
  paymentAmount: number;
  paymentMethod: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  phone?: string;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  courseType: string;
  duration?: string;
  price?: number;
  isActive: boolean;
}

interface Batch {
  _id: string;
  name: string;
  batchId: string;
  course: {
    _id: string;
    title: string;
  };
  batchPrice: number;
  maxStudents: number;
  currentStudents: number;
  status: string;
  isActive: boolean;
}

const Enrolment: React.FC = () => {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // API data states
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  // Loading states
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  
  // Error states
  const [studentError, setStudentError] = useState<string>('');
  const [courseError, setCourseError] = useState<string>('');
  const [batchError, setBatchError] = useState<string>('');
  
  const [formData, setFormData] = useState<EnrollStudentForm>({
    studentId: '',
    courseId: '',
    batchId: '',
    paymentAmount: 0,
    paymentMethod: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'courseId') {
      console.log('Course selected:', value);
      // Filter batches based on selected course
      const selectedCourse = courses.find(course => course._id === value);
      console.log('Selected course:', selectedCourse);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        batchId: '', // Reset batch selection when course changes
        paymentAmount: selectedCourse?.price || 0
      }));
      // Fetch batches for the selected course
      if (value) {
        console.log('Fetching batches for course:', value);
        fetchBatches(value);
      }
    } else if (name === 'batchId') {
      // Auto-populate payment amount when batch is selected
      const selectedBatch = batches.find(batch => batch._id === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        paymentAmount: selectedBatch?.batchPrice || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'paymentAmount' ? parseInt(value) || 0 : value
      }));
    }
  };

  // Fetch students from API
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    setStudentError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      console.log('Fetching students from API...');
      
      const response = await fetch('https://api.padyai.co.in/api/admin/students', {
        method: 'GET',
        headers: headers
      });

      console.log('Students API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Students API Response:', data);
        
        // Handle different response structures
        if (data.success && data.data && data.data.students) {
          setStudents(data.data.students);
        } else if (data.students) {
          setStudents(data.students);
        } else if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setStudents([]);
        }
      } else {
        const errorData = await response.json();
        console.error('Students API Error:', errorData);
        setStudentError(errorData.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudentError('An unexpected error occurred while fetching students');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    setCourseError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      console.log('Fetching courses from API...');
      
      const response = await fetch('https://api.padyai.co.in/api/admin/courses', {
        method: 'GET',
        headers: headers
      });

      console.log('Courses API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Courses API Response:', data);
        
        // Handle different response structures
        if (data.success && data.data && data.data.courses) {
          setCourses(data.data.courses);
        } else if (data.courses) {
          setCourses(data.courses);
        } else if (Array.isArray(data)) {
          setCourses(data);
        } else {
          setCourses([]);
        }
      } else {
        const errorData = await response.json();
        console.error('Courses API Error:', errorData);
        setCourseError(errorData.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourseError('An unexpected error occurred while fetching courses');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Fetch batches from API
  const fetchBatches = async (courseId?: string) => {
    setIsLoadingBatches(true);
    setBatchError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      let url = 'https://api.padyai.co.in/api/admin/batches';
      if (courseId) {
        url += `?courseId=${courseId}`;
      }

      console.log('Fetching batches from API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      console.log('Batches API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Batches API Response:', data);
        
        // Handle different response structures
        if (data.success && data.data && data.data.batches) {
          setBatches(data.data.batches);
          console.log('Batches set from data.data.batches:', data.data.batches);
        } else if (data.batches) {
          setBatches(data.batches);
          console.log('Batches set from data.batches:', data.batches);
        } else if (Array.isArray(data)) {
          setBatches(data);
          console.log('Batches set from array:', data);
        } else {
          setBatches([]);
          console.log('No batches found in response');
        }
      } else {
        const errorData = await response.json();
        console.error('Batches API Error:', errorData);
        setBatchError(errorData.message || 'Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatchError('An unexpected error occurred while fetching batches');
    } finally {
      setIsLoadingBatches(false);
    }
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

      const response = await fetch('https://api.padyai.co.in/api/admin/enroll-student', {
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

  const handleOpenModal = async () => {
    setShowEnrollModal(true);
    // Fetch all data when modal opens
    await Promise.all([
      fetchStudents(),
      fetchCourses(),
      fetchBatches()
    ]);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Student Enrollment</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenModal}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Student *
                    </label>
                    {isLoadingStudents ? (
                      <div className="w-full p-3 border rounded-md bg-gray-50 text-gray-500 text-sm">
                        Loading students...
                      </div>
                    ) : studentError ? (
                      <div className="w-full p-3 border rounded-md bg-red-50 text-red-600 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{studentError}</span>
                          <button
                            type="button"
                            onClick={fetchStudents}
                            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select a Student</option>
                        {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.firstName} {student.lastName} - {student.email}
                          </option>
                        ))}
                      </select>
                    )}
                    {students.length === 0 && !isLoadingStudents && !studentError && (
                      <p className="text-xs text-gray-500 mt-1">No students available</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Course *
                    </label>
                    {isLoadingCourses ? (
                      <div className="w-full p-3 border rounded-md bg-gray-50 text-gray-500 text-sm">
                        Loading courses...
                      </div>
                    ) : courseError ? (
                      <div className="w-full p-3 border rounded-md bg-red-50 text-red-600 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{courseError}</span>
                          <button
                            type="button"
                            onClick={fetchCourses}
                            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select a Course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title} - {course.courseType} {course.price ? `(₹${course.price})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    {courses.length === 0 && !isLoadingCourses && !courseError && (
                      <p className="text-xs text-gray-500 mt-1">No courses available</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Batch *
                    </label>
                    {isLoadingBatches ? (
                      <div className="w-full p-3 border rounded-md bg-gray-50 text-gray-500 text-sm">
                        Loading batches...
                      </div>
                    ) : batchError ? (
                      <div className="w-full p-3 border rounded-md bg-red-50 text-red-600 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{batchError}</span>
                          <button
                            type="button"
                            onClick={() => fetchBatches(formData.courseId)}
                            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <select
                          name="batchId"
                          value={formData.batchId}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                          disabled={!formData.courseId}
                        >
                        <option value="">
                          {formData.courseId ? 'Select a Batch' : 'Please select a course first'}
                        </option>
                        {batches
                          .filter(batch => !formData.courseId || batch.course._id === formData.courseId)
                          .map((batch) => {
                            console.log('Rendering batch option:', batch);
                            return (
                              <option key={batch._id} value={batch._id}>
                                {batch.name} ({batch.batchId}) - ₹{batch.batchPrice} - {batch.currentStudents}/{batch.maxStudents} students
                              </option>
                            );
                          })}
                        </select>
                        {formData.courseId && batches.length === 0 && !isLoadingBatches && (
                          <button
                            type="button"
                            onClick={() => fetchBatches(formData.courseId)}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                          >
                            Refresh Batches
                          </button>
                        )}
                      </div>
                    )}
                    {batches.length === 0 && !isLoadingBatches && !batchError && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.courseId ? 'No batches available for this course' : 'Select a course to see available batches'}
                      </p>
                    )}
                    {/* Debug info - remove in production */}
                    <div className="text-xs text-gray-400 mt-1">
                      Debug: {batches.length} batches loaded, Course ID: {formData.courseId || 'none'}
                    </div>
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
            onClick={handleOpenModal}
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