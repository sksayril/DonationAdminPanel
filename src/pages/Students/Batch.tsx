import React, { useState } from 'react';
import { Plus, Users, Calendar, BookOpen, X, RefreshCw } from 'lucide-react';

interface BatchFormData {
  name: string;
  description: string;
  courseId: string;
  startDate: string;
  endDate: string;
  schedule: string;
  maxStudents: number;
  batchPrice: number;
  originalPrice: number;
}

interface ApiBatch {
  id: string;
  name: string;
  description: string;
  courseId: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  maxStudents: number;
  currentStudents: number;
  batchPrice: number;
  originalPrice: number;
  schedule: string;
  createdAt: string;
  updatedAt: string;
}

interface BatchFilters {
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  courseId?: string;
  page?: number;
  limit?: number;
}

const Batch: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [apiBatches, setApiBatches] = useState<ApiBatch[]>([]);
  const [batchError, setBatchError] = useState<string>('');
  const [filters, setFilters] = useState<BatchFilters>({
    page: 1,
    limit: 10
  });
  
  const [scheduleData, setScheduleData] = useState([{
    day: 'monday',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Room 101'
  }]);
  
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    description: '',
    courseId: '',
    startDate: '',
    endDate: '',
    schedule: JSON.stringify(scheduleData),
    maxStudents: 20,
    batchPrice: 0,
    originalPrice: 0
  });
  
  // Log initial form data for debugging
  React.useEffect(() => {
    console.log('Initial form data:', JSON.stringify(formData));
    console.log('Initial schedule format:', typeof formData.schedule === 'string' ? formData.schedule : JSON.stringify(formData.schedule));
    // Validate initial schedule format
    try {
      const parsed = JSON.parse(formData.schedule);
      console.log('Initial schedule parsed successfully:', JSON.stringify(parsed));
    } catch (error) {
      console.error('Error parsing initial schedule:', error);
    }
  }, []);
  
  // Update schedule whenever scheduleData changes
  // Ensure schedule is properly formatted as a JSON string as required by the API
  React.useEffect(() => {
    try {
      // Validate schedule data before converting to JSON string
      if (!Array.isArray(scheduleData)) {
        console.error('Schedule data is not an array:', JSON.stringify(scheduleData));
        return;
      }
      
      // Ensure each schedule entry has the required fields
      const validSchedule = scheduleData.every(entry => 
        entry.day && entry.startTime && entry.endTime && entry.room
      );
      
      if (!validSchedule) {
        console.error('Some schedule entries are missing required fields:', JSON.stringify(scheduleData));
        return;
      }
      
      // Format the schedule data exactly as expected by the API
      const formattedSchedule = JSON.stringify(scheduleData);
      
      setFormData(prev => ({
        ...prev,
        schedule: formattedSchedule
      }));
      
      // Validate by parsing back to ensure it's valid JSON
      JSON.parse(formattedSchedule);
      
      console.log('Schedule formatted successfully:', formattedSchedule);
    } catch (error) {
      console.error('Error formatting schedule data:', error);
    }
  }, [scheduleData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxStudents' || name === 'batchPrice' || name === 'originalPrice' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const fetchBatches = async (filters: BatchFilters = {}) => {
    setIsLoadingBatches(true);
    setBatchError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const url = `http://localhost:3100/api/admin/batches${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setApiBatches(data.batches || data); // Handle both array and paginated response
      } else {
        const errorData = await response.json();
        setBatchError(errorData.message || 'Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatchError('An unexpected error occurred while fetching batches');
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const handleGetAllBatches = () => {
    fetchBatches();
  };

  // Test API connection with sample data
  const testApiConnection = async () => {
    try {
      setApiError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setApiError('No authentication token found. Please login first.');
        return;
      }

      // Create schedule data in the exact format expected by the API
      const scheduleArray = [{
        day: "monday",
        startTime: "09:00",
        endTime: "11:00",
        room: "Room 101"
      }];
      
      // Format schedule as a JSON string as required by the API
      const scheduleString = JSON.stringify(scheduleArray);
      
      const testData = {
        name: "Test Batch",
        description: "Test batch for API testing",
        courseId: "test_course_123",
        startDate: "2024-01-20",
        endDate: "2024-03-20",
        schedule: scheduleString,
        maxStudents: 20,
        batchPrice: 3999,
        originalPrice: 4999
      };

      console.log('Testing API with data:', JSON.stringify(testData));
      console.log('Schedule string format:', scheduleString);

      // Ensure the schedule is properly formatted
      try {
        // Validate by parsing back
        JSON.parse(testData.schedule);
      } catch (error) {
        console.error('Invalid schedule format in test data:', error);
        setApiError('Test data has invalid schedule format. Please check console for details.');
        return;
      }

      // Prepare headers
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Log the exact request body for debugging
      const requestBodyString = JSON.stringify(testData);
      console.log('Exact test request body sent:', requestBodyString);

      const response = await fetch('http://localhost:3100/api/admin/batches', {
        method: 'POST',
        headers: headers,
        body: requestBodyString
      });

      // Log response details
      console.log('Test API Response status:', response.status);
      console.log('Test API Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get the response text first to debug any JSON parsing issues
      const responseText = await response.text();
      console.log('Raw API response text:', responseText);
      
      let data;
      try {
        // Parse the response text to JSON
        data = JSON.parse(responseText);
        console.log('Test API Response data:', data);
      } catch (error) {
        console.error('Error parsing API test response:', error);
        setApiError('Error parsing API response. The server returned an invalid JSON response.');
        return;
      }
      
      if (response.ok) {
        alert('API test successful! Check console for details.');
        setApiError(null);
      } else {
        // Handle different error statuses
        let errorMessage = '';
        
        if (response.status === 500) {
          errorMessage = 'Internal server error. ';
          if (data && data.message) {
            errorMessage += `Details: ${data.message}`;
          } else if (data && data.error) {
            errorMessage += `Details: ${data.error}`;
          } else {
            errorMessage += 'This might be due to invalid schedule format. Check console for details.';
          }
        } else if (response.status === 400) {
          errorMessage = 'Bad request. ';
          if (data && data.message) {
            errorMessage += data.message;
          } else if (data && data.error) {
            errorMessage += data.error;
          }
        } else {
          errorMessage = `API test failed: ${response.status} - ${data.message || data.error || 'Unknown error'}`;
        }
        
        setApiError(errorMessage);
        console.error('Test API error details:', JSON.stringify(data));
      }
    } catch (error) {
      console.error('API test error:', error);
      setApiError('API test failed. Network error or server not responding. Check console for details.');
    }
  };

  const handleFilterChange = (key: keyof BatchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    // Validate form data first
    const validationError = validateFormData(formData);
    if (validationError) {
      setApiError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setApiError('Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }
      
      // Create headers with authorization
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Create request data matching the backend API documentation exactly
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        courseId: formData.courseId.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        schedule: formData.schedule, // Will be properly formatted below
        maxStudents: parseInt(formData.maxStudents.toString()),
        batchPrice: parseInt(formData.batchPrice.toString()),
        originalPrice: parseInt(formData.originalPrice.toString())
      };
      
      // Ensure schedule is properly formatted as a JSON string
      // First, check if schedule is already a string
      if (typeof requestData.schedule !== 'string') {
        requestData.schedule = JSON.stringify(requestData.schedule);
      }
      
      // Validate that the schedule string is properly formatted
      try {
        // Check if it's valid JSON by parsing
        const parsedSchedule = JSON.parse(requestData.schedule);
        // Ensure it's an array
        if (!Array.isArray(parsedSchedule)) {
          // If not an array, convert to array and re-stringify
          requestData.schedule = JSON.stringify([parsedSchedule]);
        } else {
          // Re-stringify to ensure proper format
          requestData.schedule = JSON.stringify(parsedSchedule);
        }
      } catch (error) {
        console.error('Invalid schedule format:', error);
        setApiError('Invalid schedule format. Please try again.');
        return;
      }
      
      // Log the request payload for debugging
      console.log('Request payload before sending:', JSON.stringify(requestData));
      console.log('Schedule JSON string format:', requestData.schedule);
      
      // Prepare the final request body - ensure schedule is a valid JSON string
      // First, parse the schedule to validate it's a proper array
      let scheduleArray;
      try {
        // Parse the current schedule string
        scheduleArray = JSON.parse(requestData.schedule);
        
        // Ensure it's an array
        if (!Array.isArray(scheduleArray)) {
          scheduleArray = [scheduleArray]; // Convert to array if it's not
        }
        
        // Validate each entry has required fields
        const validSchedule = scheduleArray.every(entry => 
          entry.day && entry.startTime && entry.endTime && entry.room
        );
        
        if (!validSchedule) {
          throw new Error('Some schedule entries are missing required fields');
        }
      } catch (error) {
        console.error('Error parsing schedule before API call:', error);
        setApiError('Invalid schedule format. Please check all schedule entries have day, startTime, endTime, and room.');
        return;
      }
      
      // Create the final request body with the validated schedule
      const finalRequestBody = {
        name: requestData.name,
        description: requestData.description,
        courseId: requestData.courseId,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        schedule: JSON.stringify(scheduleArray), // Ensure it's a properly formatted JSON string
        maxStudents: requestData.maxStudents,
        batchPrice: requestData.batchPrice,
        originalPrice: requestData.originalPrice
      };
      
      // Log the exact request body being sent
      console.log('Final request body being sent to API:', JSON.stringify(finalRequestBody));
      console.log('Schedule format in final request:', typeof finalRequestBody.schedule === 'string' ? finalRequestBody.schedule : JSON.stringify(finalRequestBody.schedule));
      console.log('Schedule type:', typeof finalRequestBody.schedule);
      
      // Use the headers already defined above
      console.log('Request headers:', headers);
      
      // Prepare the request body and ensure schedule is a string
      // Double-check that schedule is a string before sending
      if (typeof finalRequestBody.schedule !== 'string') {
        console.error('Schedule is not a string in final request body:', JSON.stringify(finalRequestBody.schedule));
        finalRequestBody.schedule = JSON.stringify(finalRequestBody.schedule);
      }
      
      // Log the exact request body for debugging
      const requestBodyString = JSON.stringify(finalRequestBody);
      console.log('Exact request body sent as string:', requestBodyString);
      
      // Parse back to verify format
      try {
        const parsedBody = JSON.parse(requestBodyString);
        console.log('Parsed request body schedule:', typeof parsedBody.schedule === 'string' ? parsedBody.schedule : JSON.stringify(parsedBody.schedule));
        console.log('Parsed request body schedule type:', typeof parsedBody.schedule);
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
      
      // Make the API call with proper headers and body
      const response = await fetch('http://localhost:3100/api/admin/batches', {
        method: 'POST',
        headers: headers,
        body: requestBodyString
      });
      
      // Log response status for debugging
      console.log('Response status:', response.status);
      
      // Get the response text first to debug any JSON parsing issues
      const responseText = await response.text();
      console.log('Raw API response text:', responseText);
      
      let data;
      try {
        // Parse the response text to JSON
        data = JSON.parse(responseText);
        console.log('Response data:', JSON.stringify(data));
      } catch (error) {
        console.error('Error parsing API response:', error);
         setApiError('Error parsing API response. The server returned an invalid JSON response.');
         return;
      }
      
      if (response.ok) {
        setSuccessMessage(data.message || 'Batch created successfully!');
        setApiError(null);
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          setShowModal(false);
          setSuccessMessage(null);
        }, 2000);
        // Reset schedule data
        setScheduleData([{
          day: 'monday',
          startTime: '09:00',
          endTime: '11:00',
          room: 'Room 101'
        }]);
        // Reset form data
        setFormData({
          name: '',
          description: '',
          courseId: '',
          startDate: '',
          endDate: '',
          schedule: JSON.stringify([{
            day: 'monday',
            startTime: '09:00',
            endTime: '11:00',
            room: 'Room 101'
          }]),
          maxStudents: 20,
          batchPrice: 0,
          originalPrice: 0
        });
        // Refresh batches list
        fetchBatches();
      } else {
        console.error('API error response:', JSON.stringify(data));
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        
        // Handle different error response formats with improved consistency
        let errorMessage = 'Failed to create batch';
        
        if (response.status === 500) {
          errorMessage = 'Internal server error occurred. ';
          // Add more detailed information if available
          if (data && data.message) {
            errorMessage += `Details: ${data.message}`;
          } else if (data && data.error) {
            errorMessage += `Details: ${data.error}`;
          } else {
            errorMessage += 'This might be due to invalid data format or server configuration. Please check the schedule format and try again.';
          }
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 400) {
          // For 400 errors, try to extract more specific error information
          if (data && data.errors) {
            errorMessage = `Validation error: ${Object.values(data.errors).join(', ')}`;
          } else if (data && data.message) {
            errorMessage = `Validation error: ${data.message}`;
          } else if (data && data.error) {
            errorMessage = `Error: ${data.error}`;
          } else {
            errorMessage = 'Invalid request data. Please check all fields and try again.';
          }
        } else {
          // Generic error handling for other status codes
          if (data && data.message) {
            errorMessage = data.message;
          } else if (data && data.error) {
            errorMessage = data.error;
          } else {
            errorMessage = `API error: ${response.status} - Unknown error`;
          }
        }
        
        setApiError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      setApiError('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setApiError(null);
    setSuccessMessage(null);
  };

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Validate form data before submission
  const validateFormData = (data: BatchFormData): string | null => {
    if (!data.name.trim()) return 'Batch name is required';
    if (!data.description.trim()) return 'Description is required';
    if (!data.courseId.trim()) return 'Course ID is required';
    if (!data.startDate) return 'Start date is required';
    if (!data.endDate) return 'End date is required';
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      return 'End date must be after start date';
    }
    if (data.maxStudents <= 0) return 'Max students must be greater than 0';
    if (data.batchPrice < 0) return 'Batch price cannot be negative';
    if (data.originalPrice < 0) return 'Original price cannot be negative';
    if (data.batchPrice > data.originalPrice) {
      return 'Batch price cannot be higher than original price';
    }
    
    // Validate schedule JSON - ensure it matches the API requirements
    try {
      const schedule = JSON.parse(data.schedule);
      
      // Check if it's an array
      if (!Array.isArray(schedule)) {
        return 'Schedule must be an array';
      }
      
      // Check if array is empty
      if (schedule.length === 0) {
        return 'At least one schedule entry is required';
      }
      
      // Validate each schedule entry
      for (const entry of schedule) {
        if (!entry.day) return 'Each schedule entry must have a day';
        if (!entry.startTime) return 'Each schedule entry must have a start time';
        if (!entry.endTime) return 'Each schedule entry must have an end time';
        if (!entry.room) return 'Each schedule entry must have a room';
      }
      
      // Ensure the schedule is properly formatted as a string for the API
      const formattedSchedule = JSON.stringify(schedule);
      console.log('Validated schedule format:', formattedSchedule);
    } catch (error) {
      console.error('Schedule validation error:', error);
      return 'Invalid schedule format. Please check the schedule entries.';
    }
    
    return null;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Batch Management</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleGetAllBatches}
            disabled={isLoadingBatches}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBatches ? 'animate-spin' : ''}`} />
            {isLoadingBatches ? 'Loading...' : 'Get All Batches'}
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Batch
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
            <input
              type="text"
              value={filters.courseId || ''}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filter by course ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
            <input
              type="number"
              value={filters.page || 1}
              onChange={(e) => handleFilterChange('page', parseInt(e.target.value) || 1)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
            <input
              type="number"
              value={filters.limit || 10}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value) || 10)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max="100"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => fetchBatches(filters)}
            disabled={isLoadingBatches}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {batchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {batchError}
        </div>
      )}

      {/* API Batches Display */}
      {apiBatches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">API Batches ({apiBatches.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {apiBatches.map((batch) => (
              <div key={batch.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base md:text-lg">{batch.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <BookOpen className="w-4 h-4" />
                      Course ID: {batch.courseId}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Students
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {batch.currentStudents}/{batch.maxStudents}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {new Date(batch.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-sm font-medium text-gray-800">
                      ${batch.batchPrice}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(batch.currentStudents / batch.maxStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg transition-colors text-sm">
                    Edit Batch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Static Batches Display */}
     

      {/* Batch Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Create New Batch</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {apiError && (
              <div className="p-3 m-4 rounded bg-red-100 text-red-800">
                {apiError}
              </div>
            )}
            
            {successMessage && (
              <div className="p-3 m-4 rounded bg-green-100 text-green-800">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Morning Batch"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Morning session batch"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
                <input
                  type="text"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="course_id_here"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Price</label>
                  <input
                    type="number"
                    name="batchPrice"
                    value={formData.batchPrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="flex flex-col space-y-2">
                  {scheduleData.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2">
                      <select
                        value={item.day}
                        onChange={(e) => {
                          const newSchedule = [...scheduleData];
                          newSchedule[index].day = e.target.value;
                          setScheduleData(newSchedule);
                          
                          // Update form data with the new schedule immediately
                          try {
                            const scheduleJson = JSON.stringify(newSchedule);
                            setFormData(prev => ({
                              ...prev,
                              schedule: scheduleJson
                            }));
                            console.log(`Updated schedule[${index}].day to ${e.target.value}`);
                          } catch (error) {
                            console.error('Error updating day in schedule:', error);
                          }
                        }}
                        className="p-2 border rounded-md text-sm"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => {
                          const newSchedule = [...scheduleData];
                          newSchedule[index].startTime = e.target.value;
                          setScheduleData(newSchedule);
                          
                          // Update form data with the new schedule immediately
                          try {
                            const scheduleJson = JSON.stringify(newSchedule);
                            setFormData(prev => ({
                              ...prev,
                              schedule: scheduleJson
                            }));
                            console.log(`Updated schedule[${index}].startTime to ${e.target.value}`);
                          } catch (error) {
                            console.error('Error updating startTime in schedule:', error);
                          }
                        }}
                        className="p-2 border rounded-md text-sm"
                      />
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => {
                          const newSchedule = [...scheduleData];
                          newSchedule[index].endTime = e.target.value;
                          setScheduleData(newSchedule);
                          
                          // Update form data with the new schedule immediately
                          try {
                            const scheduleJson = JSON.stringify(newSchedule);
                            setFormData(prev => ({
                              ...prev,
                              schedule: scheduleJson
                            }));
                            console.log(`Updated schedule[${index}].endTime to ${e.target.value}`);
                          } catch (error) {
                            console.error('Error updating endTime in schedule:', error);
                          }
                        }}
                        className="p-2 border rounded-md text-sm"
                      />
                      <input
                        type="text"
                        value={item.room}
                        placeholder="Room"
                        onChange={(e) => {
                          const newSchedule = [...scheduleData];
                          newSchedule[index].room = e.target.value;
                          setScheduleData(newSchedule);
                          
                          // Update form data with the new schedule immediately
                          try {
                            const scheduleJson = JSON.stringify(newSchedule);
                            setFormData(prev => ({
                              ...prev,
                              schedule: scheduleJson
                            }));
                            console.log(`Updated schedule[${index}].room to ${e.target.value}`);
                          } catch (error) {
                            console.error('Error updating room in schedule:', error);
                          }
                        }}
                        className="p-2 border rounded-md text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const newScheduleEntry = {
                        day: 'monday',
                        startTime: '09:00',
                        endTime: '11:00',
                        room: 'Room 101'
                      };
                      const updatedSchedule = [...scheduleData, newScheduleEntry];
                      setScheduleData(updatedSchedule);
                      
                      // Update form data with the new schedule immediately
                      try {
                        const scheduleJson = JSON.stringify(updatedSchedule);
                        setFormData(prev => ({
                          ...prev,
                          schedule: scheduleJson
                        }));
                      } catch (error) {
                        console.error('Error updating schedule after adding entry:', error);
                      }
                      
                      console.log('Added new schedule entry, current schedule:', JSON.stringify(updatedSchedule));
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Schedule
                  </button>
                  {scheduleData.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSchedule = [...scheduleData];
                        newSchedule.pop();
                        setScheduleData(newSchedule);
                        
                        // Log the updated schedule after removal
                        console.log('Removed last schedule entry, current schedule:', JSON.stringify(newSchedule));
                        
                        // Update form data with the new schedule immediately
                        try {
                          const scheduleJson = JSON.stringify(newSchedule);
                          setFormData(prev => ({
                            ...prev,
                            schedule: scheduleJson
                          }));
                        } catch (error) {
                          console.error('Error updating schedule after removal:', error);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      - Remove Last
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batch;