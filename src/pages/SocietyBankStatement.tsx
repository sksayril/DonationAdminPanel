import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Filter, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

interface BankDocumentStatus {
  id: string;
  firstName: string;
  lastName: string;
  memberAccountNumber: string;
  email: string;
  bankDocuments: {
    hasAccountStatement: boolean;
    hasPassbook: boolean;
    uploadedAt: string | null;
    hasAnyDocument: boolean;
  };
}

interface MemberBankDocuments {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberAccountNumber: string;
    email: string;
  };
  bankDocuments: {
    accountStatement: string;
    passbook: string;
    uploadedAt: string;
    hasDocuments: boolean;
  };
}

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balance: number;
  reference: string;
  category: string;
}

const SocietyBankStatement: React.FC = () => {
  const [bankDocuments, setBankDocuments] = useState<BankDocumentStatus[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Member bank documents modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<BankDocumentStatus | null>(null);
  const [memberBankDocuments, setMemberBankDocuments] = useState<any>(null);

  // Fetch bank documents status from API
  const fetchBankDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching bank documents status...');
      const response = await apiService.getBankDocumentsStatus();
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // Handle different response structures
        let documentsData = response.data;
        
        if (response.data.members) {
          documentsData = response.data.members;
        } else if (response.data.data && response.data.data.members) {
          documentsData = response.data.data.members;
        } else if (Array.isArray(response.data)) {
          documentsData = response.data;
        }
        
        if (Array.isArray(documentsData)) {
          setBankDocuments(documentsData);
        } else {
          console.warn('Unexpected response structure:', response.data);
          setBankDocuments([]);
        }
      } else {
        setError(response.error || 'Failed to fetch bank documents status');
        setBankDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching bank documents:', err);
      setError('Failed to fetch bank documents status');
      setBankDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for transactions (keeping for now)
  useEffect(() => {
    const mockTransactions: BankTransaction[] = [
      {
        id: '1',
        date: '2024-01-15',
        description: 'Student Fee Collection',
        type: 'CREDIT',
        amount: 50000,
        balance: 150000,
        reference: 'REF001',
        category: 'Fees'
      },
      {
        id: '2',
        date: '2024-01-14',
        description: 'Utility Bill Payment',
        type: 'DEBIT',
        amount: 15000,
        balance: 100000,
        reference: 'REF002',
        category: 'Utilities'
      },
      {
        id: '3',
        date: '2024-01-13',
        description: 'Loan Repayment',
        type: 'CREDIT',
        amount: 25000,
        balance: 115000,
        reference: 'REF003',
        category: 'Loan'
      },
      {
        id: '4',
        date: '2024-01-12',
        description: 'Staff Salary',
        type: 'DEBIT',
        amount: 80000,
        balance: 90000,
        reference: 'REF004',
        category: 'Salary'
      },
      {
        id: '5',
        date: '2024-01-11',
        description: 'Course Registration Fee',
        type: 'CREDIT',
        amount: 30000,
        balance: 170000,
        reference: 'REF005',
        category: 'Fees'
      }
    ];

    setTransactions(mockTransactions);
  }, []);

  // Fetch bank documents when component mounts or refresh key changes
  useEffect(() => {
    fetchBankDocuments();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType !== 'ALL' && transaction.type !== filterType) {
      return false;
    }
    
    if (dateRange.startDate && new Date(transaction.date) < new Date(dateRange.startDate)) {
      return false;
    }
    
    if (dateRange.endDate && new Date(transaction.date) > new Date(dateRange.endDate)) {
      return false;
    }
    
    return true;
  });

  const totalCredits = filteredTransactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = filteredTransactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = transactions.length > 0 ? transactions[0].balance : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'VERIFIED': 'bg-blue-100 text-blue-800'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const handleMemberClick = (member: BankDocumentStatus) => {
    setSelectedMember(member);
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setMemberBankDocuments(null);
    fetchMemberBankDocuments(member.id);
  };

  const fetchMemberBankDocuments = async (memberId: string) => {
    try {
      setModalLoading(true);
      setModalError(null);
      
      const response = await apiService.getMemberBankDocuments(memberId);
      console.log('Member bank documents response:', response);
      console.log('Response data structure:', response.data);
      console.log('Bank documents:', response.data?.bankDocuments);
      
      if (response.success && response.data) {
        console.log('✅ API Response received successfully');
        console.log('Full response data:', response.data);
        console.log('Bank documents structure:', response.data.bankDocuments);
        console.log('Account statement path:', response.data.bankDocuments?.accountStatement);
        console.log('Passbook path:', response.data.bankDocuments?.passbook);
        
        // The API response structure is: { success: true, data: { member: {...}, bankDocuments: {...} } }
        // We need to set just the data portion, not the entire response
        setMemberBankDocuments(response.data);
        console.log('Set memberBankDocuments state:', response.data);
        console.log('memberBankDocuments.bankDocuments should be:', response.data.bankDocuments);
      } else {
        setModalError(response.error || 'Failed to fetch member bank documents');
        setMemberBankDocuments(null);
      }
    } catch (err) {
      console.error('Error fetching member bank documents:', err);
      setModalError('Failed to fetch member bank documents');
      setMemberBankDocuments(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
    setMemberBankDocuments(null);
  };

  // Construct full image URL from backend path
  const getFullImageUrl = (relativePath: string | undefined) => {
    if (!relativePath) {
      console.log('❌ getFullImageUrl: relativePath is undefined or empty');
      return '';
    }
    
    // If the path is already a full URL, return as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      console.log('✅ getFullImageUrl: Path is already full URL:', relativePath);
      return relativePath;
    }
    
    // Construct full URL by combining backend base URL with relative path
    const backendBaseUrl = 'https://psmw75hs-3500.inc1.devtunnels.ms'; // Backend server URL
    const fullUrl = `${backendBaseUrl}${relativePath}`;
    console.log('🔗 getFullImageUrl: Constructed full URL:', fullUrl);
    return fullUrl;
  };

  // Test if backend image URL is accessible
  const testImageUrl = async (imagePath: string) => {
    if (!imagePath) return;
    
    const fullUrl = getFullImageUrl(imagePath);
    console.log('🧪 Testing image URL accessibility:', fullUrl);
    
    try {
      const response = await fetch(fullUrl, { method: 'HEAD' });
      console.log('🧪 Image URL test result:', {
        url: fullUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        alert(`✅ Image URL is accessible!\nStatus: ${response.status}\nURL: ${fullUrl}`);
      } else {
        alert(`❌ Image URL returned status: ${response.status} ${response.statusText}\nURL: ${fullUrl}`);
      }
    } catch (error) {
      console.error('🧪 Image URL test failed:', error);
      alert(`❌ Failed to test image URL: ${error}\nURL: ${fullUrl}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-2">Error</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Society Bank Statement</h1>
            <p className="text-gray-600">Monitor all financial transactions and account balance</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentBalance)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Documents Status Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Member Bank Documents Status</h3>
            <p className="text-sm text-gray-600 mt-1">Current status of all member bank document uploads</p>
          </div>
          
          {/* Summary Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{bankDocuments.length}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bankDocuments.filter(doc => doc.bankDocuments.hasAnyDocument).length}
                </div>
                <div className="text-sm text-gray-600">Documents Uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {bankDocuments.filter(doc => !doc.bankDocuments.hasAnyDocument).length}
                </div>
                <div className="text-sm text-gray-600">Pending Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {bankDocuments.filter(doc => doc.bankDocuments.hasAccountStatement && doc.bankDocuments.hasPassbook).length}
                </div>
                <div className="text-sm text-gray-600">Complete Sets</div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Statement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passbook
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bankDocuments.length > 0 ? (
                  bankDocuments.map((document) => (
                    <tr 
                      key={document.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleMemberClick(document)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.firstName} {document.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {document.memberAccountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {document.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(document.bankDocuments.hasAnyDocument ? 'VERIFIED' : 'PENDING')}`}>
                          {document.bankDocuments.hasAnyDocument ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {document.bankDocuments.hasAccountStatement ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {document.bankDocuments.hasPassbook ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {document.bankDocuments.uploadedAt ? formatDate(document.bankDocuments.uploadedAt) : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">No bank documents found</h3>
                      <p className="text-sm text-gray-500">There are currently no bank documents to display.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Member Bank Documents Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Bank Documents - {selectedMember?.firstName} {selectedMember?.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  Member ID: {selectedMember?.memberAccountNumber}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              {modalLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : modalError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 text-lg mb-2">Error</div>
                  <div className="text-gray-600 mb-4">{modalError}</div>
                  <button
                    onClick={() => selectedMember && fetchMemberBankDocuments(selectedMember.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : memberBankDocuments ? (
                <div className="space-y-6">

                  {/* Member Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Member Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">
                          {selectedMember?.firstName} {selectedMember?.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Account Number:</span>
                        <span className="ml-2 font-medium">{selectedMember?.memberAccountNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{selectedMember?.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Document Status:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedMember?.bankDocuments.hasAnyDocument ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedMember?.bankDocuments.hasAnyDocument ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Documents Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Bank Documents Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-600">Account Statement:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedMember?.bankDocuments.hasAccountStatement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedMember?.bankDocuments.hasAccountStatement ? 'UPLOADED' : 'NOT UPLOADED'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600">Passbook:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedMember?.bankDocuments.hasPassbook ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedMember?.bankDocuments.hasPassbook ? 'UPLOADED' : 'NOT UPLOADED'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Last Upload:</span>
                        <span className="ml-2 font-medium">
                          {selectedMember?.bankDocuments.uploadedAt ? formatDate(selectedMember.bankDocuments.uploadedAt) : 'No documents uploaded yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Account Statement Image Section */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Account Statement Document
                    </h4>
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-200">
                      {memberBankDocuments?.data?.bankDocuments?.accountStatement && memberBankDocuments.data.bankDocuments.accountStatement.trim() !== '' ? (
                        <div className="text-center">
                          <div className="relative mb-3">
                            <img
                              src={getFullImageUrl(memberBankDocuments.data.bankDocuments.accountStatement)}
                              alt="Account Statement"
                              className="w-48 h-32 object-cover rounded-lg border shadow-sm mx-auto"
                              onLoad={() => {
                                console.log('✅ Account statement image loaded successfully');
                                console.log('Image source:', getFullImageUrl(memberBankDocuments.data.bankDocuments.accountStatement));
                              }}
                              onError={(e) => {
                                console.error('❌ Failed to load account statement image:', e);
                                console.error('Image source that failed:', getFullImageUrl(memberBankDocuments.data.bankDocuments.accountStatement));
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const errorDiv = target.nextElementSibling as HTMLElement;
                                if (errorDiv) {
                                  errorDiv.classList.remove('hidden');
                                }
                              }}
                            />
                            <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="text-center text-gray-500">
                                <div className="text-lg mb-2">⚠️</div>
                                <div>Image could not be loaded</div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-blue-700 font-medium">Account Statement Available</p>
                          <div className="flex justify-center space-x-3 mt-2">
                            <a
                              href={getFullImageUrl(memberBankDocuments.data.bankDocuments.accountStatement)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              View Full Size
                            </a>
                            <a
                              href={getFullImageUrl(memberBankDocuments.data.bankDocuments.accountStatement)}
                              download
                              className="text-green-600 hover:text-green-800 text-xs underline"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-32 h-32 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">No Account Statement</p>
                          <p className="text-xs text-gray-500 mt-1">Document not uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Passbook Image Section */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Passbook Document
                    </h4>
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-200">
                      {memberBankDocuments?.data?.bankDocuments?.passbook && memberBankDocuments.data.bankDocuments.passbook.trim() !== '' ? (
                        <div className="text-center">
                          <div className="relative mb-3">
                            <img
                              src={getFullImageUrl(memberBankDocuments.data.bankDocuments.passbook)}
                              alt="Passbook"
                              className="w-48 h-32 object-cover rounded-lg border shadow-sm mx-auto"
                              onLoad={() => {
                                console.log('✅ Passbook image loaded successfully');
                                console.log('Image source:', getFullImageUrl(memberBankDocuments.data.bankDocuments.passbook));
                              }}
                              onError={(e) => {
                                console.error('❌ Failed to load passbook image:', e);
                                console.error('Image source that failed:', getFullImageUrl(memberBankDocuments.data.bankDocuments.passbook));
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const errorDiv = target.nextElementSibling as HTMLElement;
                                if (errorDiv) {
                                  errorDiv.classList.remove('hidden');
                                }
                              }}
                            />
                            <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="text-center text-gray-500">
                                <div className="text-lg mb-2">⚠️</div>
                                <div>Image could not be loaded</div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-green-700 font-medium">Passbook Available</p>
                          <div className="flex justify-center space-x-3 mt-2">
                            <a
                              href={getFullImageUrl(memberBankDocuments.data.bankDocuments.passbook)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-xs underline"
                            >
                              View Full Size
                            </a>
                            <a
                              href={getFullImageUrl(memberBankDocuments.data.bankDocuments.passbook)}
                              download
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-32 h-32 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">No Passbook</p>
                          <p className="text-xs text-gray-500 mt-1">Document not uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Document Images */}
                  {memberBankDocuments?.bankDocuments && (
                    <div className="space-y-6">
                      {/* Debug Image Paths */}
                      <div className="bg-yellow-50 rounded-lg p-4 text-xs">
                        <div className="font-medium text-yellow-800 mb-2">Image Paths Debug:</div>
                        <div className="text-yellow-700 space-y-1">
                          <div>Account Statement Path: {memberBankDocuments.data.bankDocuments.accountStatement || 'Not available'}</div>
                          <div>Passbook Path: {memberBankDocuments.data.bankDocuments.passbook || 'Not available'}</div>
                          <div>Full Account Statement URL: {getFullImageUrl(memberBankDocuments.data.bankDocuments.accountStatement)}</div>
                          <div>Full Passbook URL: {getFullImageUrl(memberBankDocuments.data.bankDocuments.passbook)}</div>
                        </div>
                        <div className="mt-3 space-x-2">
                          {memberBankDocuments.data.bankDocuments.accountStatement && (
                            <button
                              onClick={() => testImageUrl(memberBankDocuments.data.bankDocuments.accountStatement)}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              🧪 Test Account Statement URL
                            </button>
                          )}
                          {memberBankDocuments.data.bankDocuments.passbook && (
                            <button
                              onClick={() => testImageUrl(memberBankDocuments.data.bankDocuments.passbook)}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            >
                              🧪 Test Passbook URL
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Simple Image Display Test */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-3">🖼️ Simple Image Display Test</h4>
                        <div className="text-sm text-green-700 mb-3">
                          Testing if images can be displayed at all:
                        </div>
                        
                        {/* Test with placeholder image */}
                        <div className="mb-4">
                          <div className="text-xs text-green-600 mb-2">1. Placeholder Image (should work):</div>
                          <img 
                            src="https://via.placeholder.com/300x200/10B981/FFFFFF?text=Test+Image" 
                            alt="Placeholder Test" 
                            className="w-48 h-32 border rounded shadow-sm"
                          />
                        </div>

                        {/* Test with backend image URLs */}
                        {memberBankDocuments.bankDocuments.accountStatement && (
                          <div className="mb-4">
                            <div className="text-xs text-green-600 mb-2">2. Backend Account Statement Image:</div>
                            <img 
                              src={getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement)}
                              alt="Backend Account Statement" 
                              className="w-48 h-32 border rounded shadow-sm"
                              onLoad={() => console.log('✅ Backend account statement image loaded!')}
                              onError={(e) => {
                                console.error('❌ Backend account statement image failed to load:', e);
                                const target = e.target as HTMLImageElement;
                                target.style.border = '2px solid red';
                                target.style.backgroundColor = '#FEE2E2';
                              }}
                            />
                          </div>
                        )}

                        {memberBankDocuments.bankDocuments.passbook && (
                          <div className="mb-4">
                            <div className="text-xs text-green-600 mb-2">3. Backend Passbook Image:</div>
                            <img 
                              src={getFullImageUrl(memberBankDocuments.bankDocuments.passbook)}
                              alt="Backend Passbook" 
                              className="w-48 h-32 border rounded shadow-sm"
                              onLoad={() => console.log('✅ Backend passbook image loaded!')}
                              onError={(e) => {
                                console.error('❌ Backend passbook image failed to load:', e);
                                const target = e.target as HTMLImageElement;
                                target.style.border = '2px solid red';
                                target.style.backgroundColor = '#FEE2E2';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Account Statement Image */}
                      {memberBankDocuments.bankDocuments.accountStatement && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-3">Account Statement</h4>
                          <div className="flex justify-center">
                            <div className="relative">
                              <img
                                src={getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement)}
                                alt="Account Statement"
                                className="max-w-full h-auto max-h-96 rounded-lg border shadow-sm"
                                onLoad={() => {
                                  console.log('Account statement image loaded successfully');
                                  console.log('Image source:', getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement));
                                }}
                                onError={(e) => {
                                  console.error('Failed to load account statement image:', e);
                                  console.error('Image source that failed:', getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement));
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const errorDiv = target.nextElementSibling as HTMLElement;
                                  if (errorDiv) {
                                    errorDiv.classList.remove('hidden');
                                  }
                                }}
                              />
                              <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                <div className="text-center text-gray-500">
                                  <div className="text-lg mb-2">⚠️</div>
                                  <div>Image could not be loaded</div>
                                  <div className="text-sm mt-1 break-all">
                                    Path: {getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement)}
                                  </div>
                                  <div className="text-xs mt-2">
                                    <a 
                                      href={getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement)} 
                                      target="_blank" 
                                      className="text-blue-500 underline"
                                    >
                                      Try opening in new tab
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center space-x-4">
                            <a
                              href={getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Full Size
                            </a>
                            <a
                              href={getFullImageUrl(memberBankDocuments.bankDocuments.accountStatement)}
                              download
                              className="text-green-600 hover:text-green-800 text-sm underline"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Passbook Image */}
                      {memberBankDocuments.bankDocuments.passbook && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-3">Passbook</h4>
                          <div className="flex justify-center">
                            <div className="relative">
                              <img
                                src={getFullImageUrl(memberBankDocuments.bankDocuments.passbook)}
                                alt="Passbook"
                                className="max-w-full h-auto max-h-96 rounded-lg border shadow-sm"
                                onLoad={() => {
                                  console.log('Passbook image loaded successfully');
                                  console.log('Image source:', getFullImageUrl(memberBankDocuments.bankDocuments.passbook));
                                }}
                                onError={(e) => {
                                  console.error('Failed to load passbook image:', e);
                                  console.error('Image source that failed:', getFullImageUrl(memberBankDocuments.bankDocuments.passbook));
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const errorDiv = target.nextElementSibling as HTMLElement;
                                  if (errorDiv) {
                                    errorDiv.classList.remove('hidden');
                                  }
                                }}
                              />
                              <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                <div className="text-center text-gray-500">
                                  <div className="text-lg mb-2">⚠️</div>
                                  <div>Image could not be loaded</div>
                                  <div className="text-sm mt-1 break-all">
                                    Path: {getFullImageUrl(memberBankDocuments.bankDocuments.passbook)}
                                  </div>
                                  <div className="text-xs mt-2">
                                    <a 
                                      href={getFullImageUrl(memberBankDocuments.bankDocuments.passbook)} 
                                      target="_blank" 
                                      className="text-blue-500 underline"
                                    >
                                      Try opening in new tab
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center space-x-4">
                            <a
                              href={getFullImageUrl(memberBankDocuments.bankDocuments.passbook)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Full Size
                            </a>
                            <a
                              href={getFullImageUrl(memberBankDocuments.bankDocuments.passbook)}
                              download
                              className="text-green-600 hover:text-green-800 text-sm underline"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      )}

                      {/* No Images Message */}
                      {!memberBankDocuments.bankDocuments.accountStatement && !memberBankDocuments.bankDocuments.passbook && (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-gray-500">
                            <div className="text-lg mb-2">📄</div>
                            <div>No document images available</div>
                            <div className="text-sm mt-1">Images will appear here when documents are uploaded</div>
                          </div>
                        </div>
                      )}

                      {/* Test Image Section */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-3">Test Image Display</h4>
                        <div className="text-sm text-blue-700 mb-3">
                          This is a test image to verify that image display is working correctly:
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src="https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Test+Image" 
                            alt="Test Image" 
                            className="w-64 h-48 border rounded shadow-sm"
                          />
                        </div>
                        <div className="text-center mt-2 text-xs text-blue-600">
                          If you can see this test image, the image display functionality is working correctly.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-600">No data available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SocietyBankStatement;
