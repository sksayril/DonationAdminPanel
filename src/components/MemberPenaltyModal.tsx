import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Penalty {
  hasPenalty: boolean;
  penaltyAmount: number;
  daysLate: number;
  penaltyDays: number;
  penaltyPerDay: number;
  dueDate: string;
  currentDate: string;
  message: string;
}

interface PenaltyBreakdown {
  requestId: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  status: string;
  penalty: Penalty;
  totalAmountWithPenalty: number;
}

interface PenaltySummary {
  totalPayments: number;
  overduePayments: number;
  onTimePayments: number;
  totalPenalty: number;
  totalAmount: number;
  totalAmountWithPenalty: number;
  penaltyBreakdown: PenaltyBreakdown[];
  summary: {
    message: string;
    hasOverdue: boolean;
  };
}

interface MemberInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberAccountNumber: string;
}

interface MemberPenaltyResponse {
  success: boolean;
  data: {
    member: MemberInfo;
    penaltySummary: PenaltySummary;
  };
}

interface MemberPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

const MemberPenaltyModal: React.FC<MemberPenaltyModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName
}) => {
  const [memberData, setMemberData] = useState<MemberInfo | null>(null);
  const [penaltySummary, setPenaltySummary] = useState<PenaltySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberPenalties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCDPenaltiesByMember(memberId, 1, 10);
      
      if (response.success && response.data) {
        // The API response structure is: response.data.data.member and response.data.data.penaltySummary
        const actualData = response.data.data || response.data;
        
        if (actualData.member && actualData.penaltySummary) {
          setMemberData(actualData.member);
          setPenaltySummary(actualData.penaltySummary);
        } else {
          console.error('Response structure:', response.data);
          setError('Invalid response structure received');
          setMemberData(null);
          setPenaltySummary(null);
        }
      } else {
        setError(response.error || 'Failed to fetch member penalties');
        setMemberData(null);
        setPenaltySummary(null);
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('Error fetching member penalties:', err);
      setMemberData(null);
      setPenaltySummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && memberId) {
      fetchMemberPenalties();
    }
  }, [isOpen, memberId]);

  const handleRefresh = () => {
    fetchMemberPenalties();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      waived: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const defaultClass = 'bg-gray-100 text-gray-800';
    const statusClass = statusClasses[status.toLowerCase() as keyof typeof statusClasses] || defaultClass;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPenaltyStatusBadge = (penalty: Penalty) => {
    if (!penalty.hasPenalty) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          No Penalty
        </span>
      );
    }
    
    if (penalty.daysLate > 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Late ({penalty.daysLate} days)
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        On Time
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    CD Penalties for {memberData?.firstName} {memberData?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Member ID: {memberData?.memberAccountNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Member Information */}
            {memberData && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Member Details</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Name:</span> {memberData.firstName} {memberData.lastName}
                      </p>
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Email:</span> {memberData.email}
                      </p>
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Phone:</span> {memberData.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Account Information</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Account Number:</span> {memberData.memberAccountNumber}
                      </p>
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Member ID:</span> {memberData._id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Penalty Summary Cards */}
            {penaltySummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Payments</p>
                      <p className="text-xl font-bold text-gray-900">{penaltySummary.totalPayments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Overdue</p>
                      <p className="text-xl font-bold text-gray-900">{penaltySummary.overduePayments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Penalty</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(penaltySummary.totalPenalty)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(penaltySummary.totalAmountWithPenalty)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Message */}
            {penaltySummary?.summary && (
              <div className={`mb-6 p-4 rounded-lg ${
                penaltySummary.summary.hasOverdue 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <p className={`text-sm font-medium ${
                  penaltySummary.summary.hasOverdue ? 'text-red-800' : 'text-green-800'
                }`}>
                  {penaltySummary.summary.message}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Penalties Table */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading penalties...</p>
              </div>
            ) : !penaltySummary?.penaltyBreakdown || penaltySummary.penaltyBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No penalties found for this member</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penalty Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {penaltySummary.penaltyBreakdown.map((item) => (
                      <tr key={item.requestId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.requestId}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.paymentType}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              Base: {formatCurrency(item.amount)}
                            </div>
                            {item.penalty.hasPenalty && (
                              <div className="text-sm text-red-600">
                                Penalty: {formatCurrency(item.penalty.penaltyAmount)}
                              </div>
                            )}
                            <div className="text-sm font-semibold text-blue-600">
                              Total: {formatCurrency(item.totalAmountWithPenalty)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            {getPenaltyStatusBadge(item.penalty)}
                            {item.penalty.hasPenalty && (
                              <div className="text-xs text-gray-600 max-w-xs">
                                {item.penalty.message}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(item.dueDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPenaltyModal;
