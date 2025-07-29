import React from 'react';
import Layout from '../components/Layout';
import { Users, Building2, GraduationCap, CreditCard } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { title: 'Societies', value: '12', icon: Building2, color: 'bg-green-500' },
    { title: 'Active Batches', value: '8', icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'Pending Fees', value: '₹45,600', icon: CreditCard, color: 'bg-red-500' },
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">New student registration</p>
                  <p className="text-xs text-gray-600">John Doe joined Computer Science batch</p>
                </div>
                <span className="text-xs text-gray-500 ml-2">2 mins ago</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Fee payment received</p>
                  <p className="text-xs text-gray-600">₹15,000 from Jane Smith</p>
                </div>
                <span className="text-xs text-gray-500 ml-2">1 hour ago</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">KYC verification pending</p>
                  <p className="text-xs text-gray-600">5 students awaiting approval</p>
                </div>
                <span className="text-xs text-gray-500 ml-2">3 hours ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border mt-4 lg:mt-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <button className="p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                <h3 className="font-medium text-blue-800">Add New Student</h3>
                <p className="text-sm text-blue-600 mt-1">Register a new student to the system</p>
              </button>
              <button className="p-3 md:p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                <h3 className="font-medium text-green-800">Process KYC</h3>
                <p className="text-sm text-green-600 mt-1">Review pending KYC applications</p>
              </button>
              <button className="p-3 md:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
                <h3 className="font-medium text-purple-800">Create Batch</h3>
                <p className="text-sm text-purple-600 mt-1">Set up a new course batch</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;