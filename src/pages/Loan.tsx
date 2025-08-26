import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { HandCoins, RefreshCw, AlertCircle, X, User, CreditCard, Calendar, Percent, Target, FileText, Building } from 'lucide-react';
import Layout from '../components/Layout';

interface Loan {
  loanId: string;
  loanType: string;
  amount: number;
  duration: number;
  emiAmount: number;
  totalAmount: number;
  purpose: string;
  status: string;
  currentBalance: number;
  overdueAmount: number;
  totalLateFee: number;
  isOverdue: boolean;
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  interestRate: number;
  totalInterest: number;
  collateral: any;
  educationDetails: any;
  emergencyDetails: any;
  personalDetails: any;
  documents: any[];
  notes: any[];
  member: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    memberAccountNumber: string;
  };
}

const Loan: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Interest rate update modal states
  const [interestRateModalOpen, setInterestRateModalOpen] = useState(false);
  const [interestRateModalLoading, setInterestRateModalLoading] = useState(false);
  const [interestRateModalError, setInterestRateModalError] = useState<string | null>(null);
  const [interestRateModalSuccess, setInterestRateModalSuccess] = useState(false);
  const [interestRateFormData, setInterestRateFormData] = useState({
    interestRate: 0,
    notes: ''
  });
  
  const [updatingLoan, setUpdatingLoan] = useState<string | null>(null);

  // Ensure loans is always an array
  const safeLoans = Array.isArray(loans) ? loans : [];

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting API call to /loans...');
      const response = await apiService.get('/loans');
      console.log('API call completed');
      
      console.log('=== API DEBUG INFO ===');
      console.log('Full API Response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No data');
      console.log('Is response.data an array?', Array.isArray(response.data));
      console.log('response.data.loans exists?', response.data && response.data.loans ? 'Yes' : 'No');
      console.log('response.data.loans is array?', response.data && response.data.loans && Array.isArray(response.data.loans) ? 'Yes' : 'No');
      console.log('response.data.loans length:', response.data && response.data.loans && Array.isArray(response.data.loans) ? response.data.loans.length : 'N/A');
      
      // Test direct access to see the structure
      if (response.data && response.data.data) {
        console.log('response.data.data exists:', response.data.data);
        console.log('response.data.data.loans exists:', response.data.data.loans);
        console.log('response.data.data.loans is array:', Array.isArray(response.data.data.loans));
        console.log('response.data.data.loans length:', response.data.data.loans ? response.data.data.loans.length : 'N/A');
      }
      
      console.log('=== END DEBUG INFO ===');
      
      if (response.success && response.data) {
        // Ensure we always set an array, even if the API returns different structure
        let loansData = response.data;
        
        // Handle the actual API response structure: response.data.loans
        if (loansData.loans && Array.isArray(loansData.loans)) {
          console.log('Found loans in loansData.loans:', loansData.loans);
          setLoans(loansData.loans);
        } else if (loansData.data && loansData.data.loans && Array.isArray(loansData.data.loans)) {
          // Double-wrapped structure: response.data.data.loans
          console.log('Found loans in loansData.data.loans:', loansData.data.loans);
          setLoans(loansData.data.loans);
        } else if (Array.isArray(loansData)) {
          // Direct array response
          console.log('Found direct array response:', loansData);
          setLoans(loansData);
        } else if (loansData.data && Array.isArray(loansData.data)) {
          // Nested data property
          console.log('Found loans in loansData.data:', loansData.data);
          setLoans(loansData.data);
        } else if (typeof loansData === 'object' && loansData !== null) {
          // If it's an object but not an array, try to extract any array-like structure
          const keys = Object.keys(loansData);
          console.log('Object keys:', keys);
          
          // Look for any property that might contain an array
          for (const key of keys) {
            if (Array.isArray(loansData[key])) {
              console.log(`Found array in property '${key}':`, loansData[key]);
              setLoans(loansData[key]);
              return;
            }
          }
          
          // If no array found, set empty array
          console.warn('API response does not contain loans array:', loansData);
          setLoans([]);
        } else {
          // Handle other data types (string, number, etc.)
          console.warn('API response is not an object or array:', loansData, 'Type:', typeof loansData);
          setLoans([]);
        }
      } else {
        console.error('API response not successful or no data:', response);
        setError(response.error || 'Failed to fetch loans');
        setLoans([]); // Ensure loans is always an array
      }
    } catch (err) {
      console.error('Error in fetchLoans:', err);
      setError('An error occurred while fetching loans');
      console.error('Error fetching loans:', err);
      setLoans([]); // Ensure loans is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [refreshKey]);

  // Ensure loans is always an array
  useEffect(() => {
    if (!Array.isArray(loans)) {
      setLoans([]);
    }
  }, [loans]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchLoanDetails = async (loanId: string) => {
    try {
      setModalLoading(true);
      setModalError(null);
      
      console.log('Fetching loan details for:', loanId);
      const response = await apiService.get(`/loans/${loanId}`);
      
      console.log('Loan details response:', response);
      
      if (response.success && response.data) {
        setSelectedLoan(response.data);
        setModalOpen(true);
      } else {
        setModalError(response.error || 'Failed to fetch loan details');
      }
    } catch (err) {
      console.error('Error fetching loan details:', err);
      setModalError('An error occurred while fetching loan details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLoan(null);
    setModalError(null);
  };

  const openInterestRateModal = (loan: Loan) => {
    setInterestRateFormData({
      interestRate: loan.interestRate || 0,
      notes: ''
    });
    setSelectedLoan(loan);
    setInterestRateModalOpen(true);
    setInterestRateModalError(null);
  };

  const closeInterestRateModal = () => {
    setInterestRateModalOpen(false);
    setInterestRateFormData({
      interestRate: 0,
      notes: ''
    });
    setInterestRateModalError(null);
    setInterestRateModalSuccess(false);
  };

  const handleApproveLoan = async (loanId: string) => {
    try {
      setUpdatingLoan(loanId);
      console.log('Approving loan:', loanId);
      
      // Call API to approve loan using POST method
      const response = await apiService.approveLoan(loanId, {
        status: 'APPROVED',
        approvedAt: new Date().toISOString()
      });
      
      if (response.success) {
        // Update the loan status in the local state
        setLoans(prevLoans => 
          prevLoans.map(loan => 
            loan.loanId === loanId 
              ? { ...loan, status: 'APPROVED' }
              : loan
          )
        );
        
        // Show success message
        alert('Loan approved successfully!');
      } else {
        alert('Failed to approve loan: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Error approving loan. Please try again.');
    } finally {
      setUpdatingLoan(null);
    }
  };

  const handleDeclineLoan = async (loanId: string) => {
    try {
      setUpdatingLoan(loanId);
      console.log('Declining loan:', loanId);
      
      // Call API to decline loan using POST method
      const response = await apiService.declineLoan(loanId, {
        status: 'REJECTED',
        rejectedAt: new Date().toISOString()
      });
      
      if (response.success) {
        // Update the loan status in the local state
        setLoans(prevLoans => 
          prevLoans.map(loan => 
            loan.loanId === loanId 
              ? { ...loan, status: 'REJECTED' }
              : loan
          )
        );
        
        // Show success message
        alert('Loan declined successfully!');
      } else {
        alert('Failed to decline loan: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error declining loan:', error);
      alert('Error declining loan. Please try again.');
    } finally {
      setUpdatingLoan(null);
    }
  };

  const handleUpdateInterestRate = async () => {
    if (!selectedLoan) return;
    
    try {
      setInterestRateModalLoading(true);
      setInterestRateModalError(null);
      
      const requestPayload = {
        interestRate: interestRateFormData.interestRate,
        notes: interestRateFormData.notes
      };
      
      console.log('=== INTEREST RATE UPDATE DEBUG ===');
      console.log('Loan ID:', selectedLoan.loanId);
      console.log('API Endpoint:', `/api/admin/loans/${selectedLoan.loanId}/interest-rate`);
      console.log('Request Method:', 'PUT');
      console.log('Request Payload:', requestPayload);
      console.log('Current Interest Rate:', selectedLoan.interestRate);
      console.log('New Interest Rate:', interestRateFormData.interestRate);
      console.log('Notes:', interestRateFormData.notes);
      console.log('=== END DEBUG ===');
      
      // Call API to update interest rate using the specific endpoint
      const response = await apiService.updateLoanInterestRate(selectedLoan.loanId, requestPayload);
      
      console.log('API Response:', response);
      
      if (response.success) {
        // Update the loan in the local state
        setLoans(prevLoans => 
          prevLoans.map(loan => 
            loan.loanId === selectedLoan.loanId 
              ? { ...loan, interestRate: interestRateFormData.interestRate }
              : loan
          )
        );
        
        // Show success message and close modal after delay
        setInterestRateModalError(null);
        setInterestRateModalSuccess(true);
        setTimeout(() => {
          closeInterestRateModal();
        }, 1500);
      } else {
        setInterestRateModalError(response.error || 'Failed to update interest rate');
      }
    } catch (error) {
      console.error('Error updating interest rate:', error);
      setInterestRateModalError('Error updating interest rate. Please try again.');
    } finally {
      setInterestRateModalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
      
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">N/A</span>;
    
    const statusConfig = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800',
      'overdue': 'bg-orange-100 text-orange-800'
    };

    const badgeClass = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading loans...</p>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <HandCoins className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
                <p className="text-gray-600">View and manage all loan applications</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HandCoins className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900">{safeLoans.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <HandCoins className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(safeLoans.reduce((sum, loan) => sum + (loan?.amount || 0), 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <HandCoins className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {safeLoans.filter(loan => loan?.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HandCoins className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Interest Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {safeLoans.length > 0 
                    ? `${(safeLoans.reduce((sum, loan) => sum + (loan?.interestRate || 0), 0) / safeLoans.length).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loans Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                All Loans ({safeLoans.length})
              </h3>
              <p className="text-sm text-gray-500">
                💡 Click on any loan row to view detailed information
              </p>
            </div>
          </div>
          
          {safeLoans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <HandCoins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
              <p className="text-gray-500">There are no loan applications at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Loan Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Purpose
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Interest Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      EMI Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeLoans.map((loan) => (
                    <tr 
                      key={loan?.loanId || Math.random()} 
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-l-4 border-l-transparent hover:border-l-blue-500"
                      onClick={() => handleLoanClick(loan)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-40">
                            {loan?.member?.firstName || 'N/A'} {loan?.member?.lastName || ''}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-40">
                            ID: {loan?.member?.memberAccountNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-28">
                          {loan?.loanType || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-28">
                          {loan?.amount ? formatCurrency(loan.amount) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-28">
                          {loan?.totalAmount ? formatCurrency(loan.totalAmount) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-36" title={loan?.purpose || 'N/A'}>
                          {loan?.purpose || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {loan?.interestRate ? `${loan.interestRate}%` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(loan?.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan?.duration ? `${loan.duration} months` : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="truncate max-w-28">
                          {loan?.emiAmount ? formatCurrency(loan.emiAmount) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan?.status === 'PENDING' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveLoan(loan.loanId);
                              }}
                              disabled={updatingLoan === loan.loanId}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                updatingLoan === loan.loanId
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {updatingLoan === loan.loanId ? (
                                <RefreshCw className="h-3 w-3 animate-spin mx-auto" />
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeclineLoan(loan.loanId);
                              }}
                              disabled={updatingLoan === loan.loanId}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                updatingLoan === loan.loanId
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                            >
                              {updatingLoan === loan.loanId ? (
                                <RefreshCw className="h-3 w-3 animate-spin mx-auto" />
                              ) : (
                                'Decline'
                              )}
                            </button>
                          </div>
                        )}
                        {loan?.status === 'APPROVED' && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Approved
                          </span>
                        )}
                        {loan?.status === 'REJECTED' && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            Rejected
                          </span>
                        )}
                        
                        {/* Update Interest Rate Button - Available for all loan statuses */}
                        <div className="mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInterestRateModal(loan);
                            }}
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                          >
                            Update Interest Rate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Loan Details Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Loan Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading loan details...</span>
                </div>
              ) : modalError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-800">{modalError}</p>
                  </div>
                </div>
              ) : selectedLoan ? (
                <div className="space-y-6">
                  {/* Basic Loan Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                        Loan Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loan ID:</span>
                          <span className="font-medium">{selectedLoan.loanId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedLoan.loanType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">{formatCurrency(selectedLoan.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium">{formatCurrency(selectedLoan.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Interest Rate:</span>
                          <span className="font-medium">{selectedLoan.interestRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{selectedLoan.duration} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">EMI Amount:</span>
                          <span className="font-medium">{formatCurrency(selectedLoan.emiAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium">{getStatusBadge(selectedLoan.status)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2 text-green-600" />
                        Member Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedLoan.member.firstName} {selectedLoan.member.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedLoan.member.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedLoan.member.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member ID:</span>
                          <span className="font-medium">{selectedLoan.member.memberAccountNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purpose and Additional Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-purple-600" />
                      Loan Purpose & Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purpose:</span>
                        <span className="font-medium">{selectedLoan.purpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Interest:</span>
                        <span className="font-medium">{formatCurrency(selectedLoan.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Balance:</span>
                        <span className="font-medium">{formatCurrency(selectedLoan.currentBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overdue Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedLoan.overdueAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Late Fee:</span>
                        <span className="font-medium">{formatCurrency(selectedLoan.totalLateFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Is Overdue:</span>
                        <span className="font-medium">{selectedLoan.isOverdue ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Installment Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                      Installment Information
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedLoan.totalInstallments}</div>
                        <div className="text-sm text-gray-600">Total Installments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedLoan.paidInstallments}</div>
                        <div className="text-sm text-gray-600">Paid Installments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{selectedLoan.pendingInstallments}</div>
                        <div className="text-sm text-gray-600">Pending Installments</div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  {selectedLoan.personalDetails && Object.keys(selectedLoan.personalDetails).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                        Personal Details
                      </h3>
                      <div className="space-y-2">
                        {selectedLoan.personalDetails.employmentType && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Employment Type:</span>
                            <span className="font-medium">{selectedLoan.personalDetails.employmentType}</span>
                          </div>
                        )}
                        {selectedLoan.personalDetails.monthlyIncome && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Income:</span>
                            <span className="font-medium">{formatCurrency(selectedLoan.personalDetails.monthlyIncome)}</span>
                          </div>
                        )}
                        {selectedLoan.personalDetails.existingObligations !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Existing Obligations:</span>
                            <span className="font-medium">{formatCurrency(selectedLoan.personalDetails.existingObligations)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Collateral Information */}
                  {selectedLoan.collateral && Object.keys(selectedLoan.collateral).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-red-600" />
                        Collateral Information
                      </h3>
                      <div className="space-y-2">
                        {selectedLoan.collateral.type && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium">{selectedLoan.collateral.type}</span>
                          </div>
                        )}
                        {selectedLoan.collateral.weight && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weight:</span>
                            <span className="font-medium">{selectedLoan.collateral.weight} grams</span>
                          </div>
                        )}
                        {selectedLoan.collateral.purity && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Purity:</span>
                            <span className="font-medium">{selectedLoan.collateral.purity}%</span>
                          </div>
                        )}
                        {selectedLoan.collateral.estimatedValue && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Value:</span>
                            <span className="font-medium">{formatCurrency(selectedLoan.collateral.estimatedValue)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interest Rate Update Modal */}
      {interestRateModalOpen && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Update Interest Rate</h2>
              <button
                onClick={closeInterestRateModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan ID: <span className="font-semibold">{selectedLoan.loanId}</span>
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member: <span className="font-semibold">{selectedLoan.member?.firstName} {selectedLoan.member?.lastName}</span>
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Interest Rate: <span className="font-semibold">{selectedLoan.interestRate}%</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2">
                    New Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    id="interestRate"
                    min="0"
                    max="100"
                    step="0.01"
                    value={interestRateFormData.interestRate}
                    onChange={(e) => setInterestRateFormData(prev => ({
                      ...prev,
                      interestRate: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new interest rate"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={interestRateFormData.notes}
                    onChange={(e) => setInterestRateFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter notes for the interest rate update"
                  />
                </div>

                {interestRateModalError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                      <p className="text-red-800 text-sm">{interestRateModalError}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {interestRateModalSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full mr-2"></div>
                      <p className="text-green-800 text-sm">Interest rate updated successfully! Closing modal...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeInterestRateModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateInterestRate}
                disabled={interestRateModalLoading || interestRateFormData.interestRate <= 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  interestRateModalLoading || interestRateFormData.interestRate <= 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {interestRateModalLoading ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </div>
                ) : (
                  'Update Interest Rate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default Loan;
