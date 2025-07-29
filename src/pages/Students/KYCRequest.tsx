import React from 'react';
import { Eye, Check, X, Clock } from 'lucide-react';

const KYCRequest: React.FC = () => {
  const kycRequests = [
    { id: 1, name: 'Alex Turner', email: 'alex@example.com', submitted: '2024-01-15', status: 'Pending', documents: 3 },
    { id: 2, name: 'Emma Watson', email: 'emma@example.com', submitted: '2024-01-14', status: 'Under Review', documents: 4 },
    { id: 3, name: 'David Miller', email: 'david@example.com', submitted: '2024-01-13', status: 'Approved', documents: 3 },
    { id: 4, name: 'Lisa Johnson', email: 'lisa@example.com', submitted: '2024-01-12', status: 'Rejected', documents: 2 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Under Review': return <Eye className="w-4 h-4" />;
      case 'Approved': return <Check className="w-4 h-4" />;
      case 'Rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">KYC Requests</h2>
        <div className="flex space-x-2">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            5 Pending Review
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kycRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.submitted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.documents} files
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                      {request.status === 'Pending' || request.status === 'Under Review' ? (
                        <>
                          <button className="text-green-600 hover:text-green-900 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button className="text-red-600 hover:text-red-900 flex items-center gap-1">
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {kycRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{request.name}</h3>
                <p className="text-xs text-gray-500">{request.email}</p>
              </div>
              <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                {request.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div>
                <span className="block text-gray-500">Submitted</span>
                <span className="font-medium">{request.submitted}</span>
              </div>
              <div>
                <span className="block text-gray-500">Documents</span>
                <span className="font-medium">{request.documents} files</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-3 border-t">
              <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm">
                <Eye className="w-4 h-4" />
                Review
              </button>
              {request.status === 'Pending' || request.status === 'Under Review' ? (
                <>
                  <button className="text-green-600 hover:text-green-900 flex items-center gap-1 text-sm">
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm">
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KYCRequest;