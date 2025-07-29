import React from 'react';
import { Plus, Users, Calendar, BookOpen } from 'lucide-react';

const Batch: React.FC = () => {
  const batches = [
    { id: 1, name: 'CS-2024-A', course: 'Computer Science', students: 45, startDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'ENG-2024-B', course: 'Engineering', students: 38, startDate: '2024-02-01', status: 'Active' },
    { id: 3, name: 'BUS-2024-A', course: 'Business Studies', students: 42, startDate: '2024-01-20', status: 'Active' },
    { id: 4, name: 'ART-2023-C', course: 'Arts & Literature', students: 28, startDate: '2023-09-15', status: 'Completed' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Batch Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Create Batch
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {batches.map((batch) => (
          <div key={batch.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 text-base md:text-lg">{batch.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <BookOpen className="w-4 h-4" />
                  {batch.course}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                batch.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {batch.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Students
                </span>
                <span className="text-sm font-medium text-gray-800">{batch.students}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </span>
                <span className="text-sm font-medium text-gray-800">{batch.startDate}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(batch.students / 50) * 100}%` }}
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
  );
};

export default Batch;