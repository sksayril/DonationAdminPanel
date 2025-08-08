import React, { useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  Save, 
  AlertCircle, 
  Loader2, 
  X,
  MapPin,
  Users,
  Clock,
  DollarSign,
  FileText,
  Image,
  List,
  Eye,
  Calendar,
  Tag,
  Pencil
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  courseType: 'online' | 'offline';
  category: string;
  subcategory: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price: number;
  originalPrice: number;
  syllabus: { week: number; title: string; topics: string[] }[];
  prerequisites: string[];
  learningOutcomes: string[];
  offlineCourse?: {
    location: {
      address: string;
      city: string;
    };
    maxStudents: number;
  };
}

interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  courseType: 'online' | 'offline';
  category: string;
  subcategory?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price: number;
  originalPrice?: number;
  syllabus?: any[];
  prerequisites?: string[];
  learningOutcomes?: string[];
  offlineCourse?: {
    location?: {
      address: string;
      city: string;
    };
    maxStudents?: number;
    currentStudents: number;
  };
  onlineCourse?: {
    pdfContent?: string;
    videoContent?: any[];
    downloadableResources?: any[];
  };
  thumbnail?: string;
  banner?: string;
  coursePdf?: string;
  courseId: string;
  discountPercentage?: number;
  isActive: boolean;
  isPublished: boolean;
  featured: boolean;
  totalEnrollments: number;
  averageRating: number;
  totalRatings: number;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

const Courses: React.FC = () => {
  const [formData, setFormData] = useState<CourseFormData>({
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
    syllabus: [{ week: 1, title: '', topics: [''] }],
    prerequisites: [''],
    learningOutcomes: [''],
    offlineCourse: {
      location: { address: '', city: '' },
      maxStudents: 30
    }
  });

  const [files, setFiles] = useState<{
    thumbnail: File | null;
    banner: File | null;
    coursePdf: File | null;
  }>({
    thumbnail: null,
    banner: null,
    coursePdf: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Courses list state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [showCoursesList, setShowCoursesList] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [updatedCourseData, setUpdatedCourseData] = useState<Partial<Course>>({});

  const categories = [
    'programming', 'design', 'business', 'marketing', 'data-science',
    'photography', 'music', 'language', 'health', 'lifestyle'
  ];

  const subcategories = {
    programming: ['web-development', 'mobile-development', 'data-structures', 'algorithms'],
    design: ['ui-ux', 'graphic-design', 'web-design', 'illustration'],
    business: ['entrepreneurship', 'management', 'finance', 'strategy'],
    marketing: ['digital-marketing', 'social-media', 'content-marketing', 'seo'],
    'data-science': ['machine-learning', 'data-analysis', 'statistics', 'python']
  };

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setUpdatedCourseData({
      title: course.title,
      description: course.description,
      price: course.price,
      isActive: course.isActive,
      isPublished: course.isPublished,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateInputChange = (field: keyof Partial<Course>, value: any) => {
    setUpdatedCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) {
      setError('No course selected for editing.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.updateCourse(editingCourse._id, updatedCourseData);
      if (response.success) {
        setSuccess('Course updated successfully!');
        setIsEditModalOpen(false);
        // Optimistically update the local state
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === editingCourse._id ? { ...course, ...updatedCourseData } : course
          )
        );
      } else {
        setError(response.message || 'Failed to update course.');
      }
    } catch (err) {
      setError('An error occurred while updating the course.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all courses function
  const fetchAllCourses = async () => {
    setIsLoadingCourses(true);
    setError(''); // Clear any previous errors
    try {
      const response = await apiService.get('/courses');
      console.log('Courses API Response:', response);
      
      if (response.success && response.data) {
        // Handle the double-nested API response structure: response.data.data.courses
        let coursesData = [];
        
        if (response.data.data && response.data.data.courses) {
          // Double nested structure
          coursesData = response.data.data.courses;
        } else if (response.data.courses) {
          // Single nested structure
          coursesData = response.data.courses;
        } else if (Array.isArray(response.data)) {
          // Direct array
          coursesData = response.data;
        }
        
        setCourses(coursesData);
        setShowCoursesList(true);
        console.log(`Loaded ${coursesData.length} courses`);
      } else {
        setError('Failed to fetch courses: ' + (response.error || response.message || 'No courses data found'));
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('An error occurred while fetching courses');
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Required fields validation
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.courseType) errors.push('Course type is required');
    if (!formData.category.trim()) errors.push('Category is required');
    if (!formData.level) errors.push('Level is required');
    if (formData.duration <= 0) errors.push('Duration must be greater than 0');
    if (formData.price < 0) errors.push('Price cannot be negative');

    // Validate category against allowed values
    const validCategories = ['programming', 'design', 'marketing', 'business', 'language', 'music', 'art', 'technology', 'health', 'other'];
    if (formData.category && !validCategories.includes(formData.category.toLowerCase())) {
      errors.push('Invalid category selected');
    }

    // Validate level against allowed values
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (formData.level && !validLevels.includes(formData.level.toLowerCase())) {
      errors.push('Invalid level selected');
    }

    // Validate course type
    if (formData.courseType && !['online', 'offline'].includes(formData.courseType)) {
      errors.push('Course type must be either "online" or "offline"');
    }

    // Validate offline course specific requirements
    if (formData.courseType === 'offline') {
      if (!formData.offlineCourse?.location?.address?.trim()) {
        errors.push('Address is required for offline courses');
      }
      if (!formData.offlineCourse?.location?.city?.trim()) {
        errors.push('City is required for offline courses');
      }
      if (!formData.offlineCourse?.maxStudents || formData.offlineCourse.maxStudents <= 0) {
        errors.push('Max students must be greater than 0 for offline courses');
      }
    }

    // Validate online course specific requirements
    if (formData.courseType === 'online' && !files.coursePdf) {
      errors.push('Course PDF is required for online courses');
    }

    // Price validation
    if (formData.originalPrice > 0 && formData.price > formData.originalPrice) {
      errors.push('Price cannot be higher than original price');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic course data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('shortDescription', formData.shortDescription);
      formDataToSend.append('courseType', formData.courseType);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('level', formData.level);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('originalPrice', formData.originalPrice.toString());
      
      // Add JSON data - filter out empty values and ensure proper structure
      const filteredSyllabus = formData.syllabus
        .filter(week => week.title.trim() && week.topics.some(topic => topic.trim()))
        .map(week => ({
          week: week.week,
          title: week.title.trim(),
          topics: week.topics.filter(topic => topic.trim())
        }));
      
      const filteredPrerequisites = formData.prerequisites.filter(p => p.trim());
      const filteredLearningOutcomes = formData.learningOutcomes.filter(o => o.trim());
      
      // Ensure we have at least some data for required arrays
      const syllabusToSend = filteredSyllabus.length > 0 ? filteredSyllabus : [{ week: 1, title: "Introduction", topics: ["Basic concepts"] }];
      const prerequisitesToSend = filteredPrerequisites.length > 0 ? filteredPrerequisites : ["None"];
      const learningOutcomesToSend = filteredLearningOutcomes.length > 0 ? filteredLearningOutcomes : ["Complete the course"];
      
      formDataToSend.append('syllabus', JSON.stringify(syllabusToSend));
      formDataToSend.append('prerequisites', JSON.stringify(prerequisitesToSend));
      formDataToSend.append('learningOutcomes', JSON.stringify(learningOutcomesToSend));
      
      // Add offline course data if applicable
      if (formData.courseType === 'offline' && formData.offlineCourse) {
        formDataToSend.append('offlineCourse', JSON.stringify(formData.offlineCourse));
      }
      
      // Add files
      if (files.thumbnail) {
        formDataToSend.append('thumbnail', files.thumbnail);
      }
      if (files.banner) {
        formDataToSend.append('banner', files.banner);
      }
      if (files.coursePdf) {
        formDataToSend.append('coursePdf', files.coursePdf);
      }

      // Comprehensive debugging
      console.log('=== COURSE CREATION DEBUG ===');
      console.log('Form Data Object:', formData);
      console.log('Files Object:', files);
      console.log('Filtered Syllabus:', syllabusToSend);
      console.log('Filtered Prerequisites:', prerequisitesToSend);
      console.log('Filtered Learning Outcomes:', learningOutcomesToSend);
      
      // Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log('=== END DEBUG ===');

      const response = await apiService.createCourse(formDataToSend);
      
      console.log('API Response:', response);
      
      if (response.success) {
        setSuccess('Course created successfully!');
        console.log('Course created:', response.data);
        
        // Reset form
        setFormData({
          title: '', description: '', shortDescription: '', courseType: 'online',
          category: '', subcategory: '', duration: 0, level: 'beginner',
          language: 'English', price: 0, originalPrice: 0,
          syllabus: [{ week: 1, title: '', topics: [''] }],
          prerequisites: [''], learningOutcomes: [''],
          offlineCourse: { location: { address: '', city: '' }, maxStudents: 30 }
        });
        setFiles({ thumbnail: null, banner: null, coursePdf: null });
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => input.value = '');
      } else {
        const errorMessage = response.error || response.message || 'Failed to create course';
        setError(errorMessage);
        console.error('Course creation failed:', response);
        
        // Additional debugging for 400 errors
        if (response.error && response.error.includes('400')) {
          console.error('400 Bad Request Details:', {
            possibleCauses: [
              'Missing required fields',
              'Invalid data format',
              'File upload issues',
              'JSON parsing errors',
              'Authentication issues'
            ],
            formDataSent: Object.fromEntries(formDataToSend.entries())
          });
        }
      }
    } catch (error) {
      console.error('Course creation error:', error);
      setError('An unexpected error occurred. Please try again.');
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const discountPercentage = formData.originalPrice > 0 
    ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
              <p className="text-gray-600">Create and manage courses on your platform</p>
            </div>
          </div>
          
          {/* Get All Courses Button */}
          <button
            type="button"
            onClick={fetchAllCourses}
            disabled={isLoadingCourses}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingCourses ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <List className="w-4 h-4" />
                Get All Courses
              </>
            )}
          </button>
        </div>
      </div>

      {/* Courses List Display */}
      {showCoursesList && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <List className="w-5 h-5" />
              All Courses ({courses.length})
            </h2>
            <button
              onClick={() => setShowCoursesList(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {!Array.isArray(courses) || courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{!Array.isArray(courses) ? 'Error loading courses' : 'No courses found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 line-clamp-1">{course.title}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {course.courseId}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Course Details */}
                  <div className="space-y-2 text-sm">
                    {/* Category & Subcategory */}
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-500" />
                      <span className="capitalize">{course.category}</span>
                      {course.subcategory && (
                        <span className="text-gray-500">• {course.subcategory}</span>
                      )}
                    </div>
                    
                    {/* Duration & Level */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{course.duration} hours</span>
                      <span className="text-gray-500">• {course.level}</span>
                    </div>
                    
                    {/* Pricing */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">${course.price}</span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <>
                          <span className="text-gray-500 line-through text-xs">${course.originalPrice}</span>
                          <span className="text-green-600 text-xs font-medium">
                            ({course.discountPercentage}% off)
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Course Type & Language */}
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-orange-500" />
                      <span className="capitalize">{course.courseType}</span>
                      <span className="text-gray-500">• {course.language}</span>
                    </div>
                    
                    {/* Enrollment & Rating */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span>{course.totalEnrollments} enrolled</span>
                      {course.totalRatings > 0 && (
                        <span className="text-gray-500">
                          • ⭐ {course.averageRating.toFixed(1)} ({course.totalRatings})
                        </span>
                      )}
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.isPublished ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {course.featured && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleEditClick(course)} className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-semibold py-1 px-2 rounded-full">
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    
                    {/* Offline Course Details */}
                    {course.courseType === 'offline' && course.offlineCourse && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-xs">
                          Current: {course.offlineCourse.currentStudents}
                          {course.offlineCourse.maxStudents && ` / ${course.offlineCourse.maxStudents}`}
                        </span>
                      </div>
                    )}
                    
                    {/* Created By & Date */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {course.createdBy && (
                      <div className="text-xs text-gray-500">
                        By: {course.createdBy.firstName} {course.createdBy.lastName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Course Creation Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Create New Course</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., JavaScript Fundamentals"
                required
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description for course cards"
                required
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed course description..."
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Type *</label>
              <select
                value={formData.courseType}
                onChange={(e) => handleInputChange('courseType', e.target.value as 'online' | 'offline')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  handleInputChange('category', e.target.value);
                  handleInputChange('subcategory', '');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
              <select
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading || !formData.category}
              >
                <option value="">Select Subcategory</option>
                {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map(subcat => (
                  <option key={subcat} value={subcat}>
                    {subcat.charAt(0).toUpperCase() + subcat.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (hours) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="40"
                min="1"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="English"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Current Price *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2999"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price *</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3999"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            {discountPercentage > 0 && (
              <div className="flex items-center">
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                  {discountPercentage}% OFF
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Offline Course Details */}
        {formData.courseType === 'offline' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <MapPin className="w-5 h-5 inline mr-2" />
              Offline Course Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.offlineCourse?.location.address || ''}
                  onChange={(e) => handleInputChange('offlineCourse', {
                    ...formData.offlineCourse,
                    location: { ...formData.offlineCourse?.location, address: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.offlineCourse?.location.city || ''}
                  onChange={(e) => handleInputChange('offlineCourse', {
                    ...formData.offlineCourse,
                    location: { ...formData.offlineCourse?.location, city: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mumbai"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Max Students *
                </label>
                <input
                  type="number"
                  value={formData.offlineCourse?.maxStudents || 30}
                  onChange={(e) => handleInputChange('offlineCourse', {
                    ...formData.offlineCourse,
                    maxStudents: parseInt(e.target.value) || 30
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                  min="1"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* File Uploads */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <Upload className="w-5 h-5 inline mr-2" />
            Course Media
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                Thumbnail Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
              {files.thumbnail && (
                <p className="text-sm text-green-600 mt-1">✓ {files.thumbnail.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                Banner Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('banner', e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
              {files.banner && (
                <p className="text-sm text-green-600 mt-1">✓ {files.banner.name}</p>
              )}
            </div>

            {formData.courseType === 'online' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Course PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange('coursePdf', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
                {files.coursePdf && (
                  <p className="text-sm text-green-600 mt-1">✓ {files.coursePdf.name}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Course
              </>
            )}
          </button>
        </div>
        </form>
      </div>

      {/* Edit Course Modal */}
      {isEditModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Course</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={updatedCourseData.title || ''}
                    onChange={(e) => handleUpdateInputChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={updatedCourseData.description || ''}
                    onChange={(e) => handleUpdateInputChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={updatedCourseData.price || 0}
                    onChange={(e) => handleUpdateInputChange('price', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-8">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={updatedCourseData.isActive || false}
                      onChange={(e) => handleUpdateInputChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={updatedCourseData.isPublished || false}
                      onChange={(e) => handleUpdateInputChange('isPublished', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">Published</label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Changes
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