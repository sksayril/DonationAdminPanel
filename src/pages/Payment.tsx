import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, Loader2, X } from 'lucide-react';

interface SocietyMember {
  _id: string;
  firstName: string;
  lastName: string;
  memberAccountNumber: string;
}

interface CreatePaymentFormData {
  societyMemberId: string;
  paymentType: string;
  amount: number;
  totalAmount: number;
  interestRate: number;
  paymentMethod: string;
  dueDate: string;
  maturityDate: string;
  description: string;
  duration: number;
  requestId: string;
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
    totalAmount: 0,
    interestRate: 0,
    paymentMethod: '',
    dueDate: '',
    maturityDate: '',
    description: '',
    duration: 0,
    requestId: '',
    recurringDetails: {
      frequency: '',
      totalInstallments: 0
    }
  });
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Fetch society members when component mounts
  useEffect(() => {
    fetchSocietyMembers();
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

      const response = await fetch('http://localhost:3100/api/admin-society/members', {
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

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    // Reset form data
    setCreatePaymentFormData({
      societyMemberId: '',
      paymentType: '',
      amount: 0,
      totalAmount: 0,
      interestRate: 0,
      paymentMethod: '',
      dueDate: '',
      maturityDate: '',
      description: '',
      duration: 0,
      requestId: '',
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
        alert('Authentication token not found. Please login again.');
        return;
      }

      // Call create payment API
      const response = await fetch('http://localhost:3100/api/payment-requests/admin/create', {
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
        alert('Payment created successfully!');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(`Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <button 
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Payment
          </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹) *</label>
                  <input
                    type="number"
                    value={createPaymentFormData.totalAmount}
                    onChange={(e) => handleFormInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 60000"
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request ID *</label>
                  <input
                    type="text"
                    value={createPaymentFormData.requestId}
                    onChange={(e) => handleFormInputChange('requestId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., REQ001"
                    required
                  />
                </div>
              </div>

              {/* Due Date, Maturity Date and Description */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Date *</label>
                  <input
                    type="date"
                    value={createPaymentFormData.maturityDate ? createPaymentFormData.maturityDate.split('T')[0] : ''}
                    onChange={(e) => handleFormInputChange('maturityDate', e.target.value + 'T00:00:00.000Z')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
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
    </Layout>
  );
};

export default Payment;
