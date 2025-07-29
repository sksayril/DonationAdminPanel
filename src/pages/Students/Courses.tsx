import React from 'react';
import { Plus, BookOpen, Clock, Users } from 'lucide-react';

const Courses: React.FC = () => {
  const courses = [
    { 
      id: 1, 
      name: 'Computer Science Fundamentals', 
      code: 'CS101', 
      duration: '6 months', 
      enrolled: 120, 
      instructor: 'Dr. Smith',
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Advanced Engineering', 
      code: 'ENG201', 
      duration: '8 months', 
      enrolled: 85, 
      instructor: 'Prof. Johnson',
      status: 'Active'
    },
    { 
      id: 3, 
      name: 'Business Analytics', 
      code: 'BUS301', 
      duration: '4 months', 
      enrolled: 95, 
      instructor: 'Dr. Wilson',
      status: 'Active'
    },
    { 
      id: 4, 
      name: 'Creative Writing', 
      code: 'ART101', 
      duration: '3 months', 
      enrolled: 45, 
      instructor: 'Ms. Brown',
      status: 'Inactive'
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Course Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">{course.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{course.code}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                course.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {course.status}
              </span>
            </div>

            <div className="space-y-2 md:space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Duration
                </span>
                <span className="text-xs md:text-sm font-medium text-gray-800">{course.duration}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Enrolled
                </span>
                <span className="text-xs md:text-sm font-medium text-gray-800">{course.enrolled} students</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600">Instructor</span>
                <span className="text-xs md:text-sm font-medium text-gray-800">{course.instructor}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg transition-colors text-xs md:text-sm">
                View Details
              </button>
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg transition-colors text-xs md:text-sm">
                Edit Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;