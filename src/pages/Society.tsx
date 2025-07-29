import React from 'react';
import Layout from '../components/Layout';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';

const Society: React.FC = () => {
  const societies = [
    { id: 1, name: 'Computer Science Society', members: 450, established: '2018' },
    { id: 2, name: 'Engineering Society', members: 320, established: '2019' },
    { id: 3, name: 'Business Studies Society', members: 280, established: '2020' },
    { id: 4, name: 'Arts & Literature Society', members: 180, established: '2021' },
  ];

  return (
    <Layout>
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Societies</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Add Society
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {societies.map((society) => (
            <div key={society.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{society.name}</h3>
                    <p className="text-sm text-gray-600">Est. {society.established}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="text-sm font-medium text-gray-800">{society.members}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(society.members / 500) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Society;