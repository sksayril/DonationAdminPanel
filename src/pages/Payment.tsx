import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Loader2, X, Eye, Edit, Trash2 } from 'lucide-react';

interface SocietyMember {
  _id: string;
  firstName: string;
  lastName: string;
  memberAccountNumber: string;
}

interface PaymentRequest {
  _id: string;
  societyMember: {
    _id: string;
    firstName: string;
    lastName: string;
    memberAccountNumber: string;
    email?: string;
    phone?: string;
  };
  paymentType: string;
  amount: number;
  totalAmount: number;
  interestRate: number;
  paymentMethod: string;
  dueDate: string;
  description: string;
  duration: number;
  status: string;
  isOverdue: boolean;
  lateFee: number;
  maturityDate: string;
  recurringDetails: {
    frequency: string;
    nextDueDate: string;
    installmentsPaid: number;
    totalInstallments: number;
  };
  createdAt: string;
}

interface CreatePaymentFormData {
  societyMemberId: string;
  paymentType: string;
  amount: number;
  interestRate: number;
  paymentMethod: string;
  dueDate: string;
  description: string;
  duration: number;
  recurringDetails: {
    frequency: string;
    totalInstallments: number;
  };
}

const Payment: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [societyMembers, setSocietyMembers] = useState<SocietyMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [createPaymentFormData, setCreatePaymentFormData] = useState<CreatePaymentFormData>({
    societyMemberId: '',
    paymentType: '',
    amount: 0,
    interestRate: 0,
    paymentMethod: '',
    dueDate: '',
    description: '',
    duration: 0,
    recurringDetails: {
      frequency: '',
      totalInstallments: 0
    }
  });
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  
  // New state for payment requests
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  
  // New state for view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [isLoadingRequestDetails, setIsLoadingRequestDetails] = useState(false);
  const [requestDetailsError, setRequestDetailsError] = useState<string | null>(null);
  
  // New state for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PaymentRequest | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: 0,
    interestRate: 0,
    dueDate: '',
    description: '',
    status: 'PENDING'
  });
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isMarkingPaymentReceived, setIsMarkingPaymentReceived] = useState<string | null>(null);
  const [showMarkReceivedModal, setShowMarkReceivedModal] = useState(false);
  const [markReceivedFormData, setMarkReceivedFormData] = useState({
    paymentMethod: 'CASH',
    transactionId: '',
    cashReceiptNumber: ''
  });
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'info',
    message: ''
  });
  
  // Statistics modal state
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch society members when component mounts
  useEffect(() => {
    fetchSocietyMembers();
    fetchPaymentRequests();
  }, []);

  const fetchSocietyMembers = async () => {
    try {
      setIsLoadingMembers(true);
      setMembersError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMembersError('Authentication token not found');
        return;
      }

      const response = await fetch('https://api.padyai.co.in/api/admin-society/members', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.members) {
        setSocietyMembers(data.data.members);
      } else {
        setMembersError('Failed to fetch members data');
      }
    } catch (error) {
      console.error('Error fetching society members:', error);
      setMembersError('Failed to fetch society members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      setIsLoadingRequests(true);
      setRequestsError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setRequestsError('Authentication token not found');
        return;
      }

      const response = await fetch('https://api.padyai.co.in/api/payment-requests/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug: Log the actual data structure
      console.log('Payment requests API response:', data);
      
      if (data.success && data.data) {
        // Debug: Log the first item structure to see the exact format
        if (data.data.length > 0) {
          console.log('First payment request structure:', data.data[0]);
          console.log('Member data structure:', data.data[0].societyMember);
        }
        // Validate and clean the data structure
        const validatedRequests = data.data
          .filter((request: any) => request && typeof request === 'object') // Filter out invalid entries
          .map((request: any, index: number) => {
            // Handle different possible data structures - check for societyMember first
            let memberData = request.societyMember;
            
            // If memberData is a string (ID), create a placeholder object
            if (typeof memberData === 'string') {
              memberData = {
                _id: memberData,
                firstName: 'Unknown',
                lastName: 'Member',
                memberAccountNumber: 'N/A'
              };
            }
            
            // If memberData is an object but missing properties
            if (memberData && typeof memberData === 'object') {
              memberData = {
                _id: memberData._id || memberData.id || `member-${index}`,
                firstName: memberData.firstName || memberData.first_name || 'Unknown',
                lastName: memberData.lastName || memberData.last_name || 'Member',
                memberAccountNumber: memberData.memberAccountNumber || memberData.accountNumber || 'N/A'
              };
            }
            
            return {
              _id: request._id || request.requestId || `payment-${index}-${Date.now()}`, // Check for requestId as well
              societyMember: memberData || {
                _id: `member-${index}`,
                firstName: 'Unknown',
                lastName: 'Member',
                memberAccountNumber: 'N/A'
              },
              paymentType: request.paymentType || 'N/A',
              amount: request.amount || 0,
              totalAmount: request.totalAmount || request.amount || 0,
              interestRate: request.interestRate || 0,
              paymentMethod: request.paymentMethod || 'N/A',
              dueDate: request.dueDate || new Date().toISOString(),
              description: request.description || '',
              duration: request.duration || 0,
              status: request.status || 'PENDING',
              isOverdue: request.isOverdue || false,
              lateFee: request.lateFee || 0,
              maturityDate: request.maturityDate || new Date().toISOString(),
              recurringDetails: {
                frequency: request.recurringDetails?.frequency || 'N/A',
                nextDueDate: request.recurringDetails?.nextDueDate || new Date().toISOString(),
                installmentsPaid: request.recurringDetails?.installmentsPaid || 0,
                totalInstallments: request.recurringDetails?.totalInstallments || 0
              },
              createdAt: request.createdAt || new Date().toISOString()
            };
          });
        
        setPaymentRequests(validatedRequests);
      } else {
        setRequestsError('Failed to fetch payment requests');
      }
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      setRequestsError('Failed to fetch payment requests');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    // Reset form data
    setCreatePaymentFormData({
      societyMemberId: '',
      paymentType: '',
      amount: 0,
      interestRate: 0,
      paymentMethod: '',
      dueDate: '',
      description: '',
      duration: 0,
      recurringDetails: {
        frequency: '',
        totalInstallments: 0
      }
    });
  };

  const handleFormInputChange = (field: string, value: any) => {
    if (field.startsWith('recurringDetails.')) {
      const recurringField = field.split('.')[1];
      setCreatePaymentFormData(prev => ({
        ...prev,
        recurringDetails: {
          ...prev.recurringDetails,
          [recurringField]: value
        }
      }));
    } else {
      setCreatePaymentFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsCreatingPayment(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        showNotification('error', 'Authentication token not found. Please login again.');
        return;
      }

      // Call create payment API
      const response = await fetch('https://api.padyai.co.in/api/payment-requests/admin/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createPaymentFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Create Payment API Response:', result);
      
      if (result.success) {
        // Close modal and show success message
        setShowCreateModal(false);
        showNotification('success', 'Payment created successfully!');
        // Refresh payment requests after successful creation
        fetchPaymentRequests();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      showNotification('error', `Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'RECEIVED': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleViewRequest = async (requestId: string) => {
    try {
      setIsLoadingRequestDetails(true);
      setRequestDetailsError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setRequestDetailsError('Authentication token not found');
        return;
      }

      console.log('Fetching request details for ID:', requestId);
      
      // Use the correct endpoint path as specified in the requirement
      const response = await fetch(`https://api.padyai.co.in/api/payment-requests/admin/requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Request details response:', data);
      
      if (data.success && data.data) {
        setSelectedRequest(data.data);
        setShowViewModal(true);
      } else {
        setRequestDetailsError(data.message || 'Failed to fetch request details');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      setRequestDetailsError('Failed to fetch request details');
    } finally {
      setIsLoadingRequestDetails(false);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRequest(null);
    setRequestDetailsError(null);
  };

  const handleOpenEditModal = (request: PaymentRequest) => {
    setEditingRequest(request);
    setEditFormData({
      amount: request.amount || 0,
      interestRate: request.interestRate || 0,
      dueDate: request.dueDate ? request.dueDate.split('T')[0] : '',
      description: request.description || '',
      status: request.status || 'PENDING'
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingRequest(null);
    setEditFormData({
      amount: 0,
      interestRate: 0,
      dueDate: '',
      description: '',
      status: 'PENDING'
    });
  };

  const handleEditFormInputChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePayment = async () => {
    try {
      setIsUpdatingPayment(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('error', 'Authentication token not found. Please login again.');
        return;
      }

      if (!editingRequest) {
        showNotification('error', 'No request selected for editing.');
        return;
      }

      // Prepare the data to be sent - format the due date properly
      const dataToSend = {
        ...editFormData,
        dueDate: editFormData.dueDate ? new Date(editFormData.dueDate).toISOString() : new Date().toISOString()
      };

      // Debug: Log the request details
      console.log('Updating payment request with ID:', editingRequest._id);
      console.log('Original form data:', editFormData);
      console.log('Formatted data being sent:', dataToSend);
      console.log('Full API URL:', `https://api.padyai.co.in/api/payment-requests/admin/requests/${editingRequest._id}`);

      // Call update payment API
      const response = await fetch(`https://api.padyai.co.in/api/payment-requests/admin/requests/${editingRequest._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update Payment API Response:', result);
      
            if (result.success) {
        // Close modal and show success message
        handleCloseEditModal();
        showNotification('success', 'Payment updated successfully!');
        // Refresh payment requests after successful update
        fetchPaymentRequests();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      showNotification('error', `Failed to update payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdatingPayment(false);
    }
    };

  const handleMarkPaymentReceived = (requestId: string) => {
    setIsMarkingPaymentReceived(requestId);
    setMarkReceivedFormData({
      paymentMethod: 'CASH',
      transactionId: '',
      cashReceiptNumber: ''
    });
    setShowMarkReceivedModal(true);
  };

  const handleCloseMarkReceivedModal = () => {
    setShowMarkReceivedModal(false);
    setIsMarkingPaymentReceived(null);
    setMarkReceivedFormData({
      paymentMethod: 'CASH',
      transactionId: '',
      cashReceiptNumber: ''
    });
  };

  const handleMarkReceivedFormInputChange = (field: string, value: any) => {
    setMarkReceivedFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({
      show: true,
      type,
      message
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const fetchStatistics = async () => {
    try {
      setIsLoadingStatistics(true);
      setStatisticsError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setStatisticsError('Authentication token not found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (dateFilters.startDate) {
        params.append('startDate', dateFilters.startDate);
      }
      if (dateFilters.endDate) {
        params.append('endDate', dateFilters.endDate);
      }

      const url = `https://api.padyai.co.in/api/payment-requests/admin/statistics${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('Fetching statistics from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Statistics response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Statistics API Response:', data);
      
      if (data.success) {
        setStatisticsData(data.data);
      } else {
        setStatisticsError(data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatisticsError(`Failed to fetch statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingStatistics(false);
    }
  };

  const handleOpenStatisticsModal = () => {
    setShowStatisticsModal(true);
    setDateFilters({
      startDate: '',
      endDate: ''
    });
    setStatisticsData(null);
    setStatisticsError(null);
  };

  const handleCloseStatisticsModal = () => {
    setShowStatisticsModal(false);
    setStatisticsData(null);
    setStatisticsError(null);
    setDateFilters({
      startDate: '',
      endDate: ''
    });
  };

  const handleDateFilterChange = (field: string, value: string) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitMarkReceived = async () => {
    try {
      if (!isMarkingPaymentReceived) {
        showNotification('error', 'No payment request selected.');
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('error', 'Authentication token not found. Please login again.');
        return;
      }

      // Debug: Log the request details
      console.log('Marking payment as paid for request ID:', isMarkingPaymentReceived);
      console.log('Form data being sent:', markReceivedFormData);

      // Call mark payment as paid API
      const response = await fetch(`https://api.padyai.co.in/api/payment-requests/admin/requests/${isMarkingPaymentReceived}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: markReceivedFormData.paymentMethod,
          transactionId: markReceivedFormData.transactionId,
          cashReceiptNumber: markReceivedFormData.cashReceiptNumber
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Mark Payment as Paid API Response:', result);
      
      if (result.success) {
        // Show success message and refresh the table
        showNotification('success', 'Payment marked as paid successfully!');
        handleCloseMarkReceivedModal();
        fetchPaymentRequests();
      } else {
        throw new Error(result.message || 'Failed to mark payment as paid');
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      showNotification('error', `Failed to mark payment as paid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      {/* Notification Component */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' && (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600">Manage payment requests and transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenStatisticsModal}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Payment Statistics
            </button>
            <button 
              onClick={handleOpenCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Payment
            </button>
          </div>
        </div>

        {/* Payment Requests Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Requests</h2>
          </div>
          
          {isLoadingRequests ? (
            <div className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading payment requests...</p>
            </div>
          ) : requestsError ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{requestsError}</p>
              <button 
                onClick={fetchPaymentRequests}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          ) : paymentRequests.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No payment requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentRequests.map((request, index) => (
                    <tr key={request._id || `payment-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.societyMember?.firstName || 'N/A'} {request.societyMember?.lastName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.societyMember?.memberAccountNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(request.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.interestRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              console.log('Clicking view for request:', request);
                              console.log('Request ID being passed:', request._id);
                              handleViewRequest(request._id);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(request)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleMarkPaymentReceived(request._id)}
                            disabled={isMarkingPaymentReceived === request._id || request.status === 'RECEIVED'}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                              request.status === 'RECEIVED' 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'
                            }`}
                            title={request.status === 'RECEIVED' ? 'Payment Already Received' : 'Mark Payment Received'}
                          >
                            {isMarkingPaymentReceived === request._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <div className="w-4 h-4 flex items-center justify-center">
                                  <div className="w-3 h-3 bg-current rounded-full"></div>
                                </div>
                                <span className="text-xs font-medium">Verify Payment</span>
                              </>
                            )}
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

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Payment</h2>
                <p className="text-gray-600">Add a new payment transaction</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Society Member *</label>
                  <select
                    value={createPaymentFormData.societyMemberId}
                    onChange={(e) => handleFormInputChange('societyMemberId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoadingMembers}
                  >
                    <option value="">Select a member</option>
                    {societyMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName} - {member.memberAccountNumber}
                      </option>
                    ))}
                  </select>
                  {isLoadingMembers && (
                    <p className="text-sm text-gray-500 mt-1">Loading members...</p>
                  )}
                  {membersError && (
                    <p className="text-sm text-red-500 mt-1">{membersError}</p>
                  )}
                  {societyMembers.length === 0 && !isLoadingMembers && !membersError && (
                    <p className="text-sm text-gray-500 mt-1">No members found</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
                  <select
                    value={createPaymentFormData.paymentType}
                    onChange={(e) => handleFormInputChange('paymentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select payment type</option>
                    <option value="RD">RD (Recurring Deposit)</option>
                    <option value="FD">FD (Fixed Deposit)</option>
                    <option value="OD">OD (Overdraft)</option>
                    <option value="CD">CD (Current Deposit)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={createPaymentFormData.amount}
                    onChange={(e) => handleFormInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%) *</label>
                  <input
                    type="number"
                    value={createPaymentFormData.interestRate}
                    onChange={(e) => handleFormInputChange('interestRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 8.5"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    value={createPaymentFormData.paymentMethod}
                    onChange={(e) => handleFormInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="UPI">UPI</option>
                    <option value="RAZORPAY">Razorpay</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months) *</label>
                  <input
                    type="number"
                    value={createPaymentFormData.duration}
                    onChange={(e) => handleFormInputChange('duration', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 12"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Due Date and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={createPaymentFormData.dueDate ? createPaymentFormData.dueDate.split('T')[0] : ''}
                    onChange={(e) => handleFormInputChange('dueDate', e.target.value + 'T00:00:00.000Z')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={createPaymentFormData.description}
                    onChange={(e) => handleFormInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Monthly RD contribution"
                  />
                </div>
              </div>

              {/* Recurring Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recurring Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                    <select
                      value={createPaymentFormData.recurringDetails.frequency}
                      onChange={(e) => handleFormInputChange('recurringDetails.frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select frequency</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Installments *</label>
                    <input
                      type="number"
                      value={createPaymentFormData.recurringDetails.totalInstallments}
                      onChange={(e) => handleFormInputChange('recurringDetails.totalInstallments', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 12"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isCreatingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreatingPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Request Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Payment Request Details</h2>
                <p className="text-gray-600">View complete payment request information</p>
              </div>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {isLoadingRequestDetails ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-gray-600">Loading request details...</p>
              </div>
            ) : requestDetailsError ? (
              <div className="p-12 text-center">
                <p className="text-red-600">{requestDetailsError}</p>
                <button 
                  onClick={() => selectedRequest && handleViewRequest(selectedRequest._id)}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Try again
                </button>
              </div>
            ) : selectedRequest ? (
              <div className="p-6 space-y-6">
                {/* Member Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Member Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                                              <label className="block text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-gray-900 font-medium">
                          {selectedRequest.societyMember?.firstName || 'N/A'} {selectedRequest.societyMember?.lastName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Account Number</label>
                        <p className="text-gray-900 font-medium">
                          {selectedRequest.societyMember?.memberAccountNumber || 'N/A'}
                        </p>
                      </div>
                      {selectedRequest.societyMember?.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-900">{selectedRequest.societyMember.email}</p>
                        </div>
                      )}
                      {selectedRequest.societyMember?.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Phone</label>
                          <p className="text-gray-900">{selectedRequest.societyMember.phone}</p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Payment Type</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedRequest.paymentType || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Amount</label>
                      <p className="text-gray-900 font-medium text-lg">
                        {formatCurrency(selectedRequest.amount || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                      <p className="text-gray-900 font-medium text-lg">
                        {formatCurrency(selectedRequest.totalAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Interest Rate</label>
                      <p className="text-gray-900">{selectedRequest.interestRate || 0}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                      <p className="text-gray-900">{selectedRequest.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Duration</label>
                      <p className="text-gray-900">{selectedRequest.duration || 0} months</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Due Date</label>
                      <p className="text-gray-900">{selectedRequest.dueDate ? formatDate(selectedRequest.dueDate) : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Maturity Date</label>
                      <p className="text-gray-900">{selectedRequest.maturityDate ? formatDate(selectedRequest.maturityDate) : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status || 'PENDING')}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Is Overdue</label>
                      <p className="text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedRequest.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {selectedRequest.isOverdue ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Late Fee</label>
                      <p className="text-gray-900">{formatCurrency(selectedRequest.lateFee || 0)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Created Date</label>
                      <p className="text-gray-900">{selectedRequest.createdAt ? formatDate(selectedRequest.createdAt) : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Recurring Details */}
                {selectedRequest.recurringDetails && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Recurring Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Frequency</label>
                        <p className="text-gray-900">{selectedRequest.recurringDetails.frequency || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Total Installments</label>
                        <p className="text-gray-900">{selectedRequest.recurringDetails.totalInstallments || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Installments Paid</label>
                        <p className="text-gray-900">{selectedRequest.recurringDetails.installmentsPaid || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Next Due Date</label>
                        <p className="text-gray-900">{selectedRequest.recurringDetails.nextDueDate ? formatDate(selectedRequest.recurringDetails.nextDueDate) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedRequest.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-900">{selectedRequest.description}</p>
                  </div>
                )}
              </div>
            ) : null}
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseViewModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Edit Payment Request</h2>
                <p className="text-gray-600">Update payment request details</p>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => handleEditFormInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 6000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%) *</label>
                  <input
                    type="number"
                    value={editFormData.interestRate}
                    onChange={(e) => handleEditFormInputChange('interestRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 9.0"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) => handleEditFormInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => handleEditFormInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => handleEditFormInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Updated monthly RD contribution"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isUpdatingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayment}
                disabled={isUpdatingPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center gap-2"
              >
                {isUpdatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Payment Received Modal */}
      {showMarkReceivedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Mark Payment Received</h2>
                <p className="text-gray-600">Record payment receipt details</p>
              </div>
              <button
                onClick={handleCloseMarkReceivedModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={markReceivedFormData.paymentMethod}
                  onChange={(e) => handleMarkReceivedFormInputChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              
              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={markReceivedFormData.transactionId}
                  onChange={(e) => handleMarkReceivedFormInputChange('transactionId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., TXN123456789"
                />
              </div>
              
              {/* Cash Receipt Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cash Receipt Number</label>
                <input
                  type="text"
                  value={markReceivedFormData.cashReceiptNumber}
                  onChange={(e) => handleMarkReceivedFormInputChange('cashReceiptNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CR001"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseMarkReceivedModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMarkReceived}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                Mark as Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Statistics Modal */}
      {showStatisticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Payment Statistics</h2>
                <p className="text-gray-600">View payment analytics and insights</p>
              </div>
              <button
                onClick={handleCloseStatisticsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Date Filters */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateFilters.startDate}
                    onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateFilters.endDate}
                    onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchStatistics}
                    disabled={isLoadingStatistics}
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center gap-2"
                  >
                    {isLoadingStatistics ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Generate Statistics
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Statistics Content */}
            <div className="p-6">
              {isLoadingStatistics ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
                  <p className="mt-4 text-gray-600">Loading statistics...</p>
                </div>
              ) : statisticsError ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-red-600 mb-4">{statisticsError}</p>
                  <button
                    onClick={fetchStatistics}
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : statisticsData ? (
                <div className="space-y-6">
                  {/* Summary Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">Total Requests</p>
                          <p className="text-2xl font-bold text-blue-900">{statisticsData.totalRequests?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-yellow-600">Pending Requests</p>
                          <p className="text-2xl font-bold text-yellow-900">{statisticsData.pendingRequests?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">Paid Requests</p>
                          <p className="text-2xl font-bold text-green-900">{statisticsData.paidRequests?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-600">Total Amount</p>
                          <p className="text-2xl font-bold text-purple-900">₹{statisticsData.totalAmount?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Type Statistics */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">Payment Type Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Count
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {statisticsData.paymentTypeStats?.map((stat: any, index: number) => {
                            const percentage = statisticsData.totalAmount ? ((stat.totalAmount / statisticsData.totalAmount) * 100).toFixed(1) : '0';
                            return (
                              <tr key={stat._id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    stat._id === 'RD' ? 'bg-blue-100 text-blue-800' :
                                    stat._id === 'FD' ? 'bg-green-100 text-green-800' :
                                    stat._id === 'OD' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {stat._id}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {stat.count?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                  ₹{stat.totalAmount?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {percentage}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Status Distribution */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Distribution</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Paid</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {statisticsData.totalRequests ? ((statisticsData.paidRequests / statisticsData.totalRequests) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Pending</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {statisticsData.totalRequests ? ((statisticsData.pendingRequests / statisticsData.totalRequests) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Type Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Type Summary</h3>
                      <div className="space-y-3">
                        {statisticsData.paymentTypeStats?.map((stat: any, index: number) => (
                          <div key={stat._id || index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{stat._id}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {stat.count} ({statisticsData.totalRequests ? ((stat.count / statisticsData.totalRequests) * 100).toFixed(1) : 0}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No statistics data available</p>
                  <p className="text-gray-500 text-sm">Select date range and click "Generate Statistics" to view data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Payment;
