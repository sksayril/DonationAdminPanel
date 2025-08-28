import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Receipt, Search, Filter, Download, Eye, RefreshCw, Calendar, User, DollarSign, FileText, X } from 'lucide-react';
import { apiService } from '../services/apiService';

interface SocietyMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberAccountNumber: string;
}

interface MemberReceipt {
  receiptId: string;
  title: string;
  description: string;
  receiptType: string;
  receiptDate: string;
  status: string;
  imageUrl: string;
  createdAt: string;
  societyMember: SocietyMember;
}

interface ApiResponse {
  success: boolean;
  data: {
    receipts: MemberReceipt[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReceipts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

const MemberReceipt: React.FC = () => {
  // Backend base URL for images
  const BACKEND_BASE_URL = 'http://localhost:3500';
  
  const [receipts, setReceipts] = useState<MemberReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReceipts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [receiptTypeFilter, setReceiptTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Modal states
  const [selectedReceipt, setSelectedReceipt] = useState<MemberReceipt | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewImageTitle, setPreviewImageTitle] = useState<string>('');
  
  // Loading state for mark as paid action
  const [markingAsPaid, setMarkingAsPaid] = useState<string | null>(null);

  useEffect(() => {
    // Fetch receipts from API when component mounts
    console.log('MemberReceipt component mounted, fetching receipts...');
    fetchReceipts();
  }, [refreshKey]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the real API to fetch member receipts
      console.log('Calling API to fetch member receipts...');
      const response = await apiService.get('/receipts/all');
      
      console.log('Raw API Response:', response);
      
      if (response.success && response.data) {
        console.log('API Response for receipts:', response);
        console.log('Receipts data:', response.data);
        
        // Set receipts from the API response
        if (response.data.data && response.data.data.receipts && Array.isArray(response.data.data.receipts)) {
          setReceipts(response.data.data.receipts);
          setPagination(response.data.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalReceipts: response.data.data.receipts.length,
            hasNextPage: false,
            hasPrevPage: false
          });
          setError(null);
          console.log('Successfully loaded receipts from API');
        } else {
          console.warn('API response.data.data.receipts is not an array:', response.data.data?.receipts);
          setError('API returned invalid data format - expected receipts array');
          setReceipts([]);
        }
      } else {
        console.error('API Error:', response.error);
        const errorMessage = response.error || 'Failed to fetch receipts from API';
        setError(errorMessage);
        setReceipts([]);
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to fetch receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh requested...');
    fetchReceipts();
  };

  const handleImagePreview = (receipt: MemberReceipt) => {
    setPreviewImage(getFullImageUrl(receipt.imageUrl));
    setPreviewImageTitle(`${receipt.receiptId} - ${receipt.title}`);
    setImagePreviewModal(true);
  };

  const closeImagePreview = () => {
    setImagePreviewModal(false);
    setPreviewImage('');
    setPreviewImageTitle('');
  };

  // Helper function to get full image URL
  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl; // Already a full URL
    return `${BACKEND_BASE_URL}${imageUrl}`;
  };

  // Filter receipts based on current filters
  const getFilteredReceipts = () => {
    // Ensure receipts is always an array
    if (!Array.isArray(receipts)) {
      console.warn('Receipts is not an array:', receipts);
      return [];
    }

    let filtered = receipts;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(receipt => receipt.status === statusFilter);
    }

    // Filter by receipt type
    if (receiptTypeFilter !== 'ALL') {
      filtered = filtered.filter(receipt => receipt.receiptType === receiptTypeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.receiptId.toLowerCase().includes(term) ||
        receipt.societyMember.firstName.toLowerCase().includes(term) ||
        receipt.societyMember.lastName.toLowerCase().includes(term) ||
        receipt.societyMember.memberAccountNumber.toLowerCase().includes(term) ||
        receipt.title.toLowerCase().includes(term) ||
        receipt.description.toLowerCase().includes(term)
      );
    }

    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      filtered = filtered.filter(receipt => {
        const receiptDate = new Date(receipt.receiptDate);
        return receiptDate >= startDate && receiptDate <= endDate;
      });
    }

    return filtered;
  };

  const filteredReceipts = getFilteredReceipts();

  const clearFilters = () => {
    setStatusFilter('ALL');
    setReceiptTypeFilter('ALL');
    setSearchTerm('');
    setDateRange({ startDate: '', endDate: '' });
  };

  const isFilterActive = statusFilter !== 'ALL' || receiptTypeFilter !== 'ALL' || searchTerm || dateRange.startDate || dateRange.endDate;

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    };

    const badgeClass = statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReceiptTypeBadge = (receiptType: string) => {
    const typeConfig = {
      'other': 'bg-blue-100 text-blue-800',
      'payment': 'bg-green-100 text-green-800',
      'donation': 'bg-purple-100 text-purple-800',
      'fee': 'bg-indigo-100 text-indigo-800'
    };

    const badgeClass = typeConfig[receiptType as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
        {receiptType.charAt(0).toUpperCase() + receiptType.slice(1)}
      </span>
    );
  };

  const handleReceiptClick = (receipt: MemberReceipt) => {
    setSelectedReceipt(receipt);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReceipt(null);
  };

  const downloadReceipt = (receipt: MemberReceipt) => {
    // TODO: Implement receipt download functionality
    console.log('Downloading receipt:', receipt.receiptId);
    alert(`Downloading receipt ${receipt.receiptId}`);
  };

  const markAsPaid = async (receipt: MemberReceipt) => {
    try {
      // Validate receipt data
      if (!receipt || !receipt.receiptId) {
        alert('❌ Invalid receipt data. Please try again.');
        return;
      }
      
      console.log('Marking receipt as paid:', receipt.receiptId);
      console.log('Full receipt object:', receipt);
      
      // Show a confirmation dialog
      if (window.confirm(`Mark receipt ${receipt.receiptId} as paid?\n\nReceipt: ${receipt.title}\nMember: ${receipt.societyMember.firstName} ${receipt.societyMember.lastName}\nAmount: ${receipt.receiptType}`)) {
        
        // Set loading state
        setMarkingAsPaid(receipt.receiptId);
        
        // Make API call to mark receipt as paid
        console.log(`Making POST request to: /receipts/${receipt.receiptId}/mark-paid`);
        const response = await apiService.post(`/receipts/${receipt.receiptId}/mark-paid`);
        
        console.log('API Response:', response);
        
        if (response.success) {
          // Show success message
          alert(`✅ Receipt ${receipt.receiptId} marked as paid successfully!\n\nReceipt: ${receipt.title}\nMember: ${receipt.societyMember.firstName} ${receipt.societyMember.lastName}`);
          
          // Refresh the receipts list to show updated status
          fetchReceipts();
        } else {
          // Show error message from API
          alert(`❌ Failed to mark receipt as paid: ${response.error || 'Unknown error occurred'}`);
        }
      }
    } catch (error) {
      console.error('Error marking receipt as paid:', error);
      alert('❌ Failed to mark receipt as paid. Please try again.');
    } finally {
      // Clear loading state
      setMarkingAsPaid(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading receipts...</p>
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
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Member Receipt</h1>
                <p className="text-gray-600">Manage and view all member receipts</p>
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
              <div className="h-5 w-5 text-red-400 mr-2">⚠️</div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isFilterActive ? 'Filtered Receipts' : 'Total Receipts'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(filteredReceipts) ? filteredReceipts.length : 0}</p>
                {isFilterActive && (
                  <p className="text-xs text-gray-500">of {Array.isArray(receipts) ? receipts.length : 0} total</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isFilterActive ? 'Filtered Pending' : 'Pending Receipts'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(filteredReceipts) ? filteredReceipts.filter(receipt => receipt.status === 'pending').length : 0}
                </p>
                {isFilterActive && (
                  <p className="text-xs text-gray-500">
                    of {Array.isArray(receipts) ? receipts.filter(receipt => receipt.status === 'pending').length : 0} total pending
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Receipt className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isFilterActive ? 'Filtered Approved' : 'Approved Receipts'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(filteredReceipts) ? filteredReceipts.filter(receipt => receipt.status === 'approved').length : 0}
                </p>
                {isFilterActive && (
                  <p className="text-xs text-gray-500">
                    of {Array.isArray(receipts) ? receipts.filter(receipt => receipt.status === 'approved').length : 0} total approved
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isFilterActive ? 'Filtered Members' : 'Unique Members'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(filteredReceipts) ? new Set(filteredReceipts.map(receipt => receipt.societyMember._id)).size : 0}
                </p>
                {isFilterActive && (
                  <p className="text-xs text-gray-500">
                    of {Array.isArray(receipts) ? new Set(receipts.map(receipt => receipt.societyMember._id)).size : 0} total members
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Pending Payments Summary Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">$</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isFilterActive ? 'Filtered Pending Payments' : 'Pending Payments'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Array.isArray(filteredReceipts) ? filteredReceipts.filter(receipt => receipt.status === 'pending').length : 0}
                </p>
                {isFilterActive && (
                  <p className="text-xs text-gray-500">
                    of {Array.isArray(receipts) ? receipts.filter(receipt => receipt.status === 'pending').length : 0} total pending
                  </p>
                )}
                <p className="text-xs text-orange-600 font-medium mt-1">
                  Click $ button to mark as paid
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={receiptTypeFilter}
                onChange={(e) => setReceiptTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Receipt Types</option>
                <option value="other">Other</option>
                <option value="payment">Payment</option>
                <option value="donation">Donation</option>
                <option value="fee">Fee</option>
              </select>
              
              <input
                type="text"
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Date Range Filter */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <span className="text-gray-500">to</span>
            
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Summary */}
          {isFilterActive && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Active Filters:</span>
              {statusFilter !== 'ALL' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Status: {statusFilter}
                </span>
              )}
              {receiptTypeFilter !== 'ALL' && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Type: {receiptTypeFilter}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {(dateRange.startDate || dateRange.endDate) && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  Date Range: {dateRange.startDate || 'Start'} to {dateRange.endDate || 'End'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Receipts Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                All Receipts ({Array.isArray(filteredReceipts) ? filteredReceipts.length : 0})
              </h3>
              <p className="text-sm text-gray-500">
                💡 Click on any receipt row to view detailed information
              </p>
            </div>
          </div>
          
          {!Array.isArray(filteredReceipts) || filteredReceipts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
              <p className="text-gray-500">
                {isFilterActive 
                  ? 'Try adjusting your filters or search terms.' 
                  : 'There are no receipts at the moment.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image Preview
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(filteredReceipts) && filteredReceipts.map((receipt) => (
                    <tr 
                      key={receipt.receiptId} 
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-l-4 border-l-transparent hover:border-l-blue-500"
                      onClick={() => handleReceiptClick(receipt)}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.receiptId}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-48">
                            {receipt.title}
                          </div>
                          {receipt.description && (
                            <div className="text-xs text-gray-400 truncate max-w-48">
                              {receipt.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.societyMember.firstName} {receipt.societyMember.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {receipt.societyMember.memberAccountNumber}
                          </div>
                          <div className="text-xs text-gray-400">
                            {receipt.societyMember.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getReceiptTypeBadge(receipt.receiptType)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(receipt.status)}
                          {receipt.status === 'pending' && (
                            <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                              Can be marked as paid
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(receipt.receiptDate)}
                      </td>
                      <td className="px-4 py-4">
                        {receipt.imageUrl ? (
                          <div className="flex items-center space-x-2">
                            <img 
                              src={getFullImageUrl(receipt.imageUrl)} 
                              alt="Receipt Preview" 
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImagePreview(receipt);
                              }}
                              title="Click to view full image"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500 hidden">
                              Image Error
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImagePreview(receipt);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              View Full
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No Image</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          {/* Paid Button - Only show for pending receipts */}
                          {receipt.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsPaid(receipt);
                              }}
                              disabled={markingAsPaid === receipt.receiptId}
                              className={`p-1 transition-colors hover:scale-110 transform duration-200 ${
                                markingAsPaid === receipt.receiptId 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                              title={markingAsPaid === receipt.receiptId ? 'Marking as paid...' : 'Mark as Paid - Click to mark this receipt as paid'}
                            >
                              {markingAsPaid === receipt.receiptId ? (
                                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center shadow-sm">
                                  <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              ) : (
                                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                                  <span className="text-white text-xs font-bold">$</span>
                                </div>
                              )}
                            </button>
                          )}
                          
                          {/* Download Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadReceipt(receipt);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          
                          {/* View Details Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceiptClick(receipt);
                            }}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
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

        {/* Pagination Info */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div>
                Total receipts: {pagination.totalReceipts}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Details Modal */}
      {modalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Receipt Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Receipt Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                    Receipt Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Receipt ID:</span>
                      <span className="text-gray-900 font-semibold text-base">{selectedReceipt.receiptId}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Title:</span>
                      <span className="text-gray-900 font-semibold text-base">{selectedReceipt.title}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Receipt Type:</span>
                      <div className="mt-1">{getReceiptTypeBadge(selectedReceipt.receiptType)}</div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedReceipt.status)}</div>
                    </div>
                    {selectedReceipt.description && (
                      <div className="col-span-1 md:col-span-2">
                        <span className="text-gray-600 font-medium">Description:</span>
                        <span className="ml-2 text-gray-900">{selectedReceipt.description || 'No description provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Information */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-600" />
                    Member Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Full Name:</span>
                      <span className="text-gray-900 font-semibold text-base">
                        {selectedReceipt.societyMember.firstName} {selectedReceipt.societyMember.lastName}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Account Number:</span>
                      <span className="text-gray-900 font-semibold text-base">{selectedReceipt.societyMember.memberAccountNumber}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Email Address:</span>
                      <span className="text-gray-900 font-semibold text-base">{selectedReceipt.societyMember.email}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Member ID:</span>
                      <span className="text-gray-900 font-semibold text-base">{selectedReceipt.societyMember._id}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Receipt Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Receipt Date:</span>
                      <span className="text-gray-900 font-semibold text-base">{formatDate(selectedReceipt.receiptDate)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-medium">Created:</span>
                      <span className="text-gray-900 font-semibold text-base">{formatDate(selectedReceipt.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Image Display */}
                  {selectedReceipt.imageUrl && (
                    <div className="mt-4">
                      <span className="text-gray-600 font-medium block mb-3">Receipt Image:</span>
                      <div className="relative group">
                        <img 
                          src={getFullImageUrl(selectedReceipt.imageUrl)} 
                          alt="Receipt" 
                          className="w-full max-h-80 object-contain rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                          onClick={() => handleImagePreview(selectedReceipt)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="w-full max-h-80 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-lg text-gray-500 hidden">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📷</div>
                            <div>Image could not be loaded</div>
                            <div className="text-sm text-gray-400 mt-1">Check if the image exists on the server</div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                            Click to view full size
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-center">
                        <button
                          onClick={() => handleImagePreview(selectedReceipt)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2 inline" />
                          View Full Size Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              {/* Mark as Paid Button - Only show for pending receipts */}
              {selectedReceipt.status === 'pending' && (
                <button
                  onClick={() => {
                    markAsPaid(selectedReceipt);
                    closeModal();
                  }}
                  disabled={markingAsPaid === selectedReceipt.receiptId}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    markingAsPaid === selectedReceipt.receiptId
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {markingAsPaid === selectedReceipt.receiptId ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Marking as Paid...
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center mr-2">
                        <span className="text-green-600 text-xs font-bold">$</span>
                      </div>
                      Mark as Paid
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => downloadReceipt(selectedReceipt)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Download Receipt
              </button>
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

      {/* Image Preview Modal */}
      {imagePreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{previewImageTitle}</h2>
              <button
                onClick={closeImagePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex justify-center">
                <img 
                  src={previewImage} 
                  alt="Receipt Full Size" 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="max-w-full max-h-[70vh] bg-gray-100 rounded-lg shadow-lg flex items-center justify-center text-lg text-gray-500 hidden">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <div className="text-xl font-medium">Image could not be loaded</div>
                    <div className="text-sm text-gray-400 mt-2">Check if the image exists on the server</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewImage;
                  link.download = `receipt-${previewImageTitle.replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
                  link.click();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Download Image
              </button>
              <button
                onClick={closeImagePreview}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MemberReceipt;
