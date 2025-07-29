import React from 'react';
import { DollarSign, TrendingUp, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

const Revenue: React.FC = () => {
  // Mock revenue data
  const revenueData = {
    totalCollected: 155000,
    previousMonth: 48000,
    currentMonth: 52000,
    percentageChange: 8.33,
    recentTransactions: [
      { id: 1, student: 'John Doe', course: 'Computer Science', amount: 15000, date: '2024-04-15' },
      { id: 2, student: 'Jane Smith', course: 'Engineering', amount: 18000, date: '2024-04-12' },
      { id: 3, student: 'Mike Johnson', course: 'Business', amount: 12000, date: '2024-04-10' },
      { id: 4, student: 'Sarah Wilson', course: 'Arts', amount: 10000, date: '2024-04-05' },
    ],
    monthlyRevenue: [
      { month: 'Jan', amount: 42000 },
      { month: 'Feb', amount: 38000 },
      { month: 'Mar', amount: 48000 },
      { month: 'Apr', amount: 52000 },
    ],
    courseRevenue: [
      { course: 'Computer Science', amount: 68000 },
      { course: 'Engineering', amount: 42000 },
      { course: 'Business', amount: 24000 },
      { course: 'Arts', amount: 21000 },
    ]
  };

  // Function to render the horizontal bar chart for course revenue
  const renderCourseRevenueChart = () => {
    const maxAmount = Math.max(...revenueData.courseRevenue.map(item => item.amount));
    
    return (
      <div className="space-y-3">
        {revenueData.courseRevenue.map((course, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="font-medium text-gray-800">{course.course}</span>
              <span>₹{course.amount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(course.amount / maxAmount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to render monthly revenue chart
  const renderMonthlyRevenueChart = () => {
    const maxAmount = Math.max(...revenueData.monthlyRevenue.map(item => item.amount));
    
    return (
      <div className="flex items-end justify-between h-40 mt-4">
        {revenueData.monthlyRevenue.map((month, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-8 md:w-12 rounded-t-md bg-blue-500" 
              style={{ 
                height: `${(month.amount / maxAmount) * 100}%`,
                backgroundColor: month.month === 'Apr' ? '#3b82f6' : '#93c5fd'
              }}
            ></div>
            <div className="mt-2 text-xs font-medium">{month.month}</div>
            <div className="text-xs text-gray-500">₹{(month.amount/1000).toFixed(0)}k</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">My Revenue</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">₹{revenueData.totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Current Month</p>
              <div className="flex items-center">
                <p className="text-xl md:text-2xl font-bold text-green-600 mr-2">₹{revenueData.currentMonth.toLocaleString()}</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" /> 
                  {revenueData.percentageChange}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Previous Month</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600">₹{revenueData.previousMonth.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Monthly Revenue</h3>
          <p className="text-xs text-gray-500 mb-2">Revenue collected over the last 4 months</p>
          {renderMonthlyRevenueChart()}
        </div>

        {/* Course Revenue Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Revenue by Course</h3>
          <p className="text-xs text-gray-500 mb-4">Distribution of revenue across different courses</p>
          {renderCourseRevenueChart()}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Transactions</h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.student}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {revenueData.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="border-b p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{transaction.student}</h3>
                  <p className="text-xs text-gray-500">{transaction.course}</p>
                </div>
                <span className="font-medium text-blue-600">₹{transaction.amount.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500">
                {transaction.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Revenue; 