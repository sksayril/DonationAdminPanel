import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService } from '../services/apiService';
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, User, Calendar, DollarSign, Eye } from 'lucide-react';
import MemberPenaltyModal from '../components/MemberPenaltyModal';

interface SocietyMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberAccountNumber: string;
}

interface CreatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

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

interface PaymentRequest {
  requestId: string;
  _id: string;
  societyMember: SocietyMember;
  createdBy: CreatedBy;
  amount: number;
  dueDate: string;
  status: string;
  penalty: Penalty;
  totalAmountWithPenalty: number;
}

interface CDPenaltyResponse {
  success: boolean;
  data: PaymentRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const CDPenalty: React.FC = () => {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');

  const fetchPenalties = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCDPenalties(page, itemsPerPage);
      
      if (response.success && response.data) {
        const data = response.data as CDPenaltyResponse;
        setPaymentRequests(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setCurrentPage(data.pagination?.currentPage || 1);
      } else {
        setError(response.error || 'Failed to fetch CD penalties');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('Error fetching CD penalties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    fetchPenalties(currentPage);
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

  const handleMemberClick = (memberId: string, memberName: string) => {
    setSelectedMemberId(memberId);
    setSelectedMemberName(memberName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMemberId('');
    setSelectedMemberName('');
  };

  if (loading && paymentRequests.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CD Penalties...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CD Penalties</h1>
                <p className="text-gray-600">Manage and monitor certificate of deposit payment requests with penalties</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Penalties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentRequests.filter(p => p.penalty.hasPenalty).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Penalty Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paymentRequests.reduce((sum, p) => sum + (p.penalty.hasPenalty ? p.penalty.penaltyAmount : 0), 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentRequests.filter(p => p.penalty.daysLate > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Payment Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Requests with Penalties</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment requests...</p>
            </div>
          ) : paymentRequests.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment requests found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member Information
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penalty Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.requestId}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created by: {request.createdBy.firstName} {request.createdBy.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.societyMember.firstName} {request.societyMember.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {request.societyMember.memberAccountNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.societyMember.email}
                            </div>
                            <button
                              onClick={() => handleMemberClick(request.societyMember._id, `${request.societyMember.firstName} ${request.societyMember.lastName}`)}
                              className="mt-2 inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Penalties
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">Base Amount:</span> {formatCurrency(request.amount)}
                            </div>
                            {request.penalty.hasPenalty && (
                              <div className="text-sm text-red-600">
                                <span className="font-medium">Penalty:</span> {formatCurrency(request.penalty.penaltyAmount)}
                              </div>
                            )}
                            <div className="text-sm font-semibold text-blue-600">
                              <span className="font-medium">Total:</span> {formatCurrency(request.totalAmountWithPenalty)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {getPenaltyStatusBadge(request.penalty)}
                            {request.penalty.hasPenalty && (
                              <div className="text-xs text-gray-600">
                                {request.penalty.message}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(request.dueDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {currentPage} of {totalPages} ({totalItems} total items)
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Member Penalty Modal */}
      <MemberPenaltyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        memberId={selectedMemberId}
        memberName={selectedMemberName}
      />
    </Layout>
  );
};

export default CDPenalty;
