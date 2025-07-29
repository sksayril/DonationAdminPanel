import React, { useState } from 'react';
import { Search, Filter, Download, Plus, MoreVertical } from 'lucide-react';

const GetAllStudents: React.FC = () => {
  const students = [
    { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', batch: 'CS-2024', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Engineering', batch: 'ENG-2024', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', course: 'Business', batch: 'BUS-2024', status: 'Inactive' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', course: 'Arts', batch: 'ART-2024', status: 'Active' },
  ];

  const [isActionsOpen, setIsActionsOpen] = useState<number | null>(null);

  const toggleActions = (id: number) => {
    if (isActionsOpen === id) {
      setIsActionsOpen(null);
    } else {
      setIsActionsOpen(id);
    }
  };

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
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 justify-center sm:justify-start">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.batch}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
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

        {/* Mobile Card View */}
        <div className="md:hidden">
          {students.map((student) => (
            <div key={student.id} className="border-b p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => toggleActions(student.id)} 
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {isActionsOpen === student.id && (
                    <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-24">
                      <button className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100">
                        Edit
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="block text-gray-500">Course</span>
                  <span className="font-medium">{student.course}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Batch</span>
                  <span className="font-medium">{student.batch}</span>
                </div>
              </div>
              
              <div>
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                  student.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetAllStudents;