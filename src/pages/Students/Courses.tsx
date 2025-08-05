import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Filter, Search, RefreshCw } from 'lucide-react';

interface Course {
  id?: string;
  title: string;
  description: string;
  shortDescription: string;
  courseType: string;
  category: string;
  subcategory: string;
  duration: number;
  level: string;
  language: string;
  price: number;
  originalPrice: number;
  syllabus: string;
  prerequisites: string;
  learningOutcomes: string;
  offlineCourse: string;
  status?: string;
  thumbnail?: File | string;
  banner?: File | string;
  coursePdf?: File | string;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseFilters {
  status?: string;
  courseType?: string;
  category?: string;
  page: number;
  limit: number;
}

const Courses: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<CourseFilters>({
    status: '',
    courseType: '',
    category: '',
    page: 1,
    limit: 10
  });
  
  // Available filter options
  const statusOptions = ['', 'active', 'inactive'];
  const courseTypeOptions = ['', 'online', 'offline'];
  const categoryOptions = ['', 'programming', 'design', 'business', 'marketing']; // Example categories
  
  const [formData, setFormData] = useState<Course>({
    title: '',
    description: '',
    shortDescription: '',
    courseType: 'online',
    category: '',
    subcategory: '',
    duration: 0,
    level: 'beginner',
    language: 'English',
    price: 0,
    originalPrice: 0,
    syllabus: '',
    prerequisites: '',
    learningOutcomes: '',
    offlineCourse: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // Create FormData object for file uploads
      const courseFormData = new FormData();
      
      // Add required text fields to FormData
      courseFormData.append('title', formData.title);
      courseFormData.append('description', formData.description);
      courseFormData.append('shortDescription', formData.shortDescription);
      courseFormData.append('courseType', formData.courseType);
      courseFormData.append('category', formData.category.toLowerCase());
      courseFormData.append('subcategory', formData.subcategory.toLowerCase());
      courseFormData.append('duration', formData.duration.toString());
      courseFormData.append('level', formData.level);
      courseFormData.append('language', formData.language);
      courseFormData.append('price', formData.price.toString());
      courseFormData.append('originalPrice', formData.originalPrice.toString());
      
      // Handle structured fields - convert to JSON strings as expected by API
      // Syllabus should be a JSON string of array of objects
      if (formData.syllabus) {
        try {
          // Try to parse existing JSON
          JSON.parse(formData.syllabus);
          courseFormData.append('syllabus', formData.syllabus);
        } catch {
          // If not valid JSON, create proper structure
          const syllabusArray = formData.syllabus.split('\n')
            .filter(line => line.trim())
            .map((topic, index) => ({
              week: index + 1,
              title: `Week ${index + 1}`,
              topics: [topic.trim()]
            }));
          courseFormData.append('syllabus', JSON.stringify(syllabusArray));
        }
      } else {
        // Provide empty array if no syllabus
        courseFormData.append('syllabus', JSON.stringify([]));
      }
      
      // Prerequisites should be a JSON string array
      if (formData.prerequisites) {
        try {
          JSON.parse(formData.prerequisites);
          courseFormData.append('prerequisites', formData.prerequisites);
        } catch {
          const prereqsArray = formData.prerequisites.split(/[,\n]/)
            .map(item => item.trim())
            .filter(item => item);
          courseFormData.append('prerequisites', JSON.stringify(prereqsArray));
        }
      } else {
        courseFormData.append('prerequisites', JSON.stringify([]));
      }
      
      // Learning outcomes should be a JSON string array
      if (formData.learningOutcomes) {
        try {
          JSON.parse(formData.learningOutcomes);
          courseFormData.append('learningOutcomes', formData.learningOutcomes);
        } catch {
          const outcomesArray = formData.learningOutcomes.split(/[,\n]/)
            .map(item => item.trim())
            .filter(item => item);
          courseFormData.append('learningOutcomes', JSON.stringify(outcomesArray));
        }
      } else {
        courseFormData.append('learningOutcomes', JSON.stringify([]));
      }
      
      // Offline course details - only required if courseType is offline
      if (formData.courseType === 'offline' && formData.offlineCourse) {
        try {
          JSON.parse(formData.offlineCourse);
          courseFormData.append('offlineCourse', formData.offlineCourse);
        } catch {
          // Create proper offline course structure
          const offlineData = {
            location: {
              address: formData.offlineCourse,
              city: "Mumbai" // Default city, should be configurable
            },
            maxStudents: 30 // Default value
          };
          courseFormData.append('offlineCourse', JSON.stringify(offlineData));
        }
      }
      
      // Add file fields if they exist
      if (formData.thumbnail instanceof File) {
        courseFormData.append('thumbnail', formData.thumbnail);
      }
      
      if (formData.banner instanceof File) {
        courseFormData.append('banner', formData.banner);
      }
      
      if (formData.coursePdf instanceof File) {
        courseFormData.append('coursePdf', formData.coursePdf);
      }
      
      // Log the FormData for debugging
      for (let [key, value] of courseFormData.entries()) {
        console.log(key, value);
      }
      
      // Send POST request to the API endpoint
      const response = await fetch('http://localhost:3100/api/admin/courses', {
        method: 'POST',
        body: courseFormData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          // Don't set Content-Type header - let the browser set it with boundary
        }
      });
      
      const responseData = await response.json();
      console.log('Response:', JSON.stringify(responseData));
      
      if (response.ok) {
        setResponseMessage({
          type: 'success',
          message: responseData.message || 'Course created successfully!'
        });
        
        // Reset form and close modal after success
        setTimeout(() => {
          setShowForm(false);
          setFormData({
            title: '',
            description: '',
            shortDescription: '',
            courseType: 'online',
            category: '',
            subcategory: '',
            duration: 0,
            level: 'beginner',
            language: 'English',
            price: 0,
            originalPrice: 0,
            syllabus: '',
            prerequisites: '',
            learningOutcomes: '',
            offlineCourse: ''
          });
          fetchCourses(); // Refresh course list
        }, 2000);
      } else {
        let errorMessage = 'Failed to create course';
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
        setResponseMessage({
          type: 'error',
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setResponseMessage(null);
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      courseType: 'online',
      category: '',
      subcategory: '',
      duration: 0,
      level: 'beginner',
      language: 'English',
      price: 0,
      originalPrice: 0,
      syllabus: '',
      prerequisites: '',
      learningOutcomes: '',
      offlineCourse: ''
    });
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: '',
      courseType: '',
      category: '',
      page: 1,
      limit: 10
    });
  };

  // Function to fetch courses with filters
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.courseType) queryParams.append('courseType', filters.courseType);
      if (filters.category) queryParams.append('category', filters.category);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      
      // Log the request for debugging
      console.log(`Fetching courses with params: ${queryParams.toString()}`);
      
      // Fetch courses from API
      const response = await fetch(`http://localhost:3100/api/admin/courses?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Log response status for debugging
      console.log('Courses fetch response status:', response.status);
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('Courses fetched successfully:', JSON.stringify(responseData));
        // Assuming the API returns { success: true, data: { courses: [...], totalCount: number } }
        setCourses(responseData.data?.courses || []);
        setTotalCount(responseData.data?.totalCount || 0);
      } else {
        console.error('Failed to fetch courses:', JSON.stringify(responseData));
        let errorMessage = 'Failed to fetch courses';
        
        if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      let errorMessage = 'Failed to fetch courses. Please try again later.';
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh function for manual refresh
  const refreshCourses = () => {
    fetchCourses();
  };
  
  // Fetch courses when filters change
  useEffect(() => {
    fetchCourses();
  }, [filters]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Course Management</h2>
        <div className="flex gap-2">
          <button
            onClick={toggleFilters}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={refreshCourses}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option ? option.charAt(0).toUpperCase() + option.slice(1) : 'All Status'}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
              <select
                name="courseType"
                value={filters.courseType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courseTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option ? option.charAt(0).toUpperCase() + option.slice(1) : 'All Types'}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option ? option.charAt(0).toUpperCase() + option.slice(1) : 'All Categories'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  // Filters are already applied via useEffect when they change
                  // This button is mainly for UX to give users a sense of control
                  setShowFilters(false); // Hide filters after applying
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No courses found</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.courseType.charAt(0).toUpperCase() + course.courseType.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                  disabled={filters.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${filters.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page * filters.limit >= totalCount}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${filters.page * filters.limit >= totalCount ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {totalCount > 0 ? (
                      <>
                        Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(filters.page * filters.limit, totalCount)}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> results
                      </>
                    ) : (
                      'No results found'
                    )}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                      disabled={filters.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${filters.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={filters.page * filters.limit >= totalCount}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${filters.page * filters.limit >= totalCount ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Add New Course</h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Response Message */}
              {responseMessage && (
                <div className={`p-4 rounded-md ${
                  responseMessage.type === 'success' 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {responseMessage.type === 'success' ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {responseMessage.message}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Type *
                  </label>
                  <select
                    name="courseType"
                    value={formData.courseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., programming, design, business"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    placeholder="e.g., web-development, ui-ux, digital-marketing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Brief description of the course (1-2 sentences)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Detailed description of the course content and benefits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* Additional Course Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Syllabus
                    <span className="text-xs text-gray-500 block">Enter as JSON array or simple text (one topic per line)</span>
                  </label>
                  <textarea
                    name="syllabus"
                    value={formData.syllabus}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder='JSON: [{"week": 1, "title": "Introduction", "topics": ["Variables", "Functions"]}] OR Simple text (one topic per line)'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prerequisites 
                    <span className="text-xs text-gray-500 block">Enter as JSON array or comma/line separated</span>
                  </label>
                  <textarea
                    name="prerequisites"
                    value={formData.prerequisites}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder='JSON: ["Basic HTML", "Basic CSS"] OR Simple text: Basic HTML, Basic CSS'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Outcomes 
                    <span className="text-xs text-gray-500 block">Enter as JSON array or comma/line separated</span>
                  </label>
                  <textarea
                    name="learningOutcomes"
                    value={formData.learningOutcomes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder='JSON: ["Build web applications", "Understand JavaScript"] OR Simple text: Build web applications, Understand JavaScript'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offline Course Details
                    {formData.courseType === 'offline' && <span className="text-red-500 ml-1">*</span>}
                    <span className="text-xs text-gray-500 block">Enter as JSON object or simple address</span>
                  </label>
                  <textarea
                    name="offlineCourse"
                    value={formData.offlineCourse}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder='JSON: {"location": {"address": "123 Main St", "city": "Mumbai"}, "maxStudents": 30} OR Simple address'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.courseType === 'offline'}
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    name="thumbnail"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    name="banner"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course PDF
                  </label>
                  <input
                    type="file"
                    name="coursePdf"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    isSubmitting 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
