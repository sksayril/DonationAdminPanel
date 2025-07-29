import React from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock, MoreVertical } from 'lucide-react';

const Fees: React.FC = () => {
  const feeRecords = [
    { 
      id: 1, 
      student: 'John Doe', 
      course: 'Computer Science', 
      amount: 15000, 
      dueDate: '2024-01-30', 
      status: 'Paid',
      paidDate: '2024-01-25'
    },
    { 
      id: 2, 
      student: 'Jane Smith', 
      course: 'Engineering', 
      amount: 18000, 
      dueDate: '2024-02-01', 
      status: 'Pending',
      paidDate: null
    },
    { 
      id: 3, 
      student: 'Mike Johnson', 
      course: 'Business', 
      amount: 12000, 
      dueDate: '2024-01-15', 
      status: 'Overdue',
      paidDate: null
    },
    { 
      id: 4, 
      student: 'Sarah Wilson', 
      course: 'Arts', 
      amount: 10000, 
      dueDate: '2024-02-05', 
      status: 'Pending',
      paidDate: null
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const totalPending = feeRecords
    .filter(record => record.status !== 'Paid')
    .reduce((sum, record) => sum + record.amount, 0);

  const totalCollected = feeRecords
    .filter(record => record.status === 'Paid')
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Fee Management</h2>
        <div className="flex flex-wrap gap-2">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Collected: ₹{totalCollected.toLocaleString()}
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
            Pending: ₹{totalPending.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Collected</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Pending Amount</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Overdue</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">
                {feeRecords.filter(r => r.status === 'Overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.student}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{record.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.paidDate || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.status !== 'Paid' ? (
                      <button className="text-green-600 hover:text-green-900">Mark as Paid</button>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-900">View Receipt</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {feeRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{record.student}</h3>
                <p className="text-xs text-gray-500">{record.course}</p>
              </div>
              <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                {getStatusIcon(record.status)}
                {record.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="block text-gray-500">Amount</span>
                <span className="font-medium">₹{record.amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-gray-500">Due Date</span>
                <span className="font-medium">{record.dueDate}</span>
              </div>
              <div>
                <span className="block text-gray-500">Paid Date</span>
                <span className="font-medium">{record.paidDate || '-'}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              {record.status !== 'Paid' ? (
                <button className="w-full text-center text-green-600 hover:text-green-900 py-1">
                  Mark as Paid
                </button>
              ) : (
                <button className="w-full text-center text-blue-600 hover:text-blue-900 py-1">
                  View Receipt
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fees;