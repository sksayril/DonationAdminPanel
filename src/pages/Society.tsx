import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Building2, Plus, Edit, Trash2, Users, Calendar, Loader2, AlertCircle, RefreshCw, MapPin, Phone, FileText } from 'lucide-react';

interface SocietyMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  memberAccountNumber?: string;
  membershipType?: string;
  isMembershipActive?: boolean;
  monthlyContribution?: number;
  totalContribution?: number;
  membershipStartDate?: string;
  kycStatus?: string;
  isKycApproved?: boolean;
  isAccountActive?: boolean;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  signupTime: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalMembers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SocietyData {
  members: SocietyMember[];
  pagination: PaginationData;
}

const Society: React.FC = () => {
  const [societyData, setSocietyData] = useState<SocietyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<SocietyMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isLoadingMemberDetails, setIsLoadingMemberDetails] = useState(false);
  const [memberDetails, setMemberDetails] = useState<any>(null);
  const [memberDetailsError, setMemberDetailsError] = useState<string | null>(null);
  const [kycAction, setKycAction] = useState<string>('');
  const [isUpdatingKyc, setIsUpdatingKyc] = useState<string | null>(null);
  const [kycSuccessMessage, setKycSuccessMessage] = useState<string>('');
  const [kycApiResponse, setKycApiResponse] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<SocietyMember | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    membershipType: '',
    monthlyContribution: 0,
    isAccountActive: true,
    isMembershipActive: true
  });
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [editApiResponse, setEditApiResponse] = useState<any>(null);
  const [showPendingKycModal, setShowPendingKycModal] = useState(false);
  const [pendingKycData, setPendingKycData] = useState<any>(null);
  const [isLoadingPendingKyc, setIsLoadingPendingKyc] = useState(false);
  const [pendingKycError, setPendingKycError] = useState<string | null>(null);
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
  const [createAgentFormData, setCreateAgentFormData] = useState({
    agentCode: '',
    agentName: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    commissionRate: '',
    idProof: null as File | null,
    addressProof: null as File | null,
    agentProfilePhoto: null as File | null
  });
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [createAgentApiResponse, setCreateAgentApiResponse] = useState<any>(null);

  // Handle KYC action (approve/reject)
  const handleKycAction = async (memberId: string, action: string) => {
    try {
      setIsUpdatingKyc(memberId);
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      // Call KYC update API
      const response = await fetch(`https://api.padyai.co.in/api/admin-society/members/${memberId}/kyc`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('KYC API Response:', result); // Log the API response
      setKycApiResponse(result); // Store the API response
      
      if (result.success) {
        // Update local state to reflect the change
        setSocietyData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            members: prev.members.map(member => 
              member._id === memberId 
                ? { 
                    ...member, 
                    isKycApproved: action === 'approve',
                    kycStatus: action === 'approve' ? 'approved' : 'rejected'
                  }
                : member
            )
          };
        });
        
        // Reset KYC action
        setKycAction('');
        
        // Find member name for success message
        const updatedMember = societyData?.members.find(m => m._id === memberId);
        setKycSuccessMessage(`KYC status updated successfully for ${updatedMember?.firstName || ''} ${updatedMember?.lastName || ''}`);
        setTimeout(() => setKycSuccessMessage(''), 5000); // Clear message after 5 seconds
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      setError(`Failed to update KYC status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdatingKyc(null);
    }
  };

  // Handle opening edit modal
  const handleEditMember = (member: SocietyMember) => {
    setEditingMember(member);
    setEditFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      phone: member.phone || '',
      membershipType: member.membershipType || '',
      monthlyContribution: member.monthlyContribution || 0,
      isAccountActive: member.isAccountActive || true,
      isMembershipActive: member.isMembershipActive || true
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleFormInputChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleEditSubmit = async () => {
    if (!editingMember) return;
    
    try {
      setIsUpdatingMember(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      // Call update member API
      const response = await fetch(`https://api.padyai.co.in/api/admin-society/members/${editingMember._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update Member API Response:', result);
      setEditApiResponse(result); // Store the API response
      
      if (result.success) {
        // Update local state
        setSocietyData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            members: prev.members.map(member => 
              member._id === editingMember._id 
                ? { ...member, ...editFormData }
                : member
            )
          };
        });
        
        // Close modal and show success message
        setShowEditModal(false);
        setEditingMember(null);
        setKycSuccessMessage(`Member updated successfully: ${editFormData.firstName} ${editFormData.lastName}`);
        setTimeout(() => setKycSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      setError(`Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdatingMember(false);
    }
  };

  // Fetch pending KYC data
  const fetchPendingKyc = async () => {
    try {
      setIsLoadingPendingKyc(true);
      setPendingKycError(null);

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setPendingKycError('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch('https://api.padyai.co.in/api/admin-society/kyc/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Pending KYC API Response:', data);
      setPendingKycData(data);
      setShowPendingKycModal(true);
    } catch (error) {
      console.error('Error fetching pending KYC:', error);
      setPendingKycError(`Failed to fetch pending KYC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingPendingKyc(false);
    }
  };

  // Handle opening create agent modal
  const handleOpenCreateAgent = () => {
    setShowCreateAgentModal(true);
    // Reset form data
    setCreateAgentFormData({
      agentCode: '',
      agentName: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      commissionRate: '',
      idProof: null,
      addressProof: null,
      agentProfilePhoto: null
    });
  };

  // Handle form input changes
  const handleCreateAgentInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCreateAgentFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCreateAgentFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle file input changes
  const handleFileChange = (field: string, file: File | null) => {
    setCreateAgentFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  // Handle form submission
  const handleCreateAgentSubmit = async () => {
    try {
      // Validate required fields
      if (!createAgentFormData.agentCode.trim()) {
        setError('Agent Code is required');
        return;
      }
      if (!createAgentFormData.agentName.trim()) {
        setError('Agent Name is required');
        return;
      }
      if (!createAgentFormData.phone.trim()) {
        setError('Phone is required');
        return;
      }
      if (!createAgentFormData.email.trim()) {
        setError('Email is required');
        return;
      }
      if (!createAgentFormData.address.street.trim()) {
        setError('Street address is required');
        return;
      }
      if (!createAgentFormData.address.city.trim()) {
        setError('City is required');
        return;
      }
      if (!createAgentFormData.address.state.trim()) {
        setError('State is required');
        return;
      }
      if (!createAgentFormData.address.pincode.trim()) {
        setError('Pincode is required');
        return;
      }
      if (!createAgentFormData.commissionRate.trim()) {
        setError('Commission Rate is required');
        return;
      }
      if (!createAgentFormData.idProof) {
        setError('ID Proof document is required');
        return;
      }
      if (!createAgentFormData.addressProof) {
        setError('Address Proof document is required');
        return;
      }

      setIsCreatingAgent(true);
      setError(null); // Clear any previous errors
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('agentCode', createAgentFormData.agentCode);
      formData.append('agentName', createAgentFormData.agentName);
      formData.append('phone', createAgentFormData.phone);
      formData.append('email', createAgentFormData.email);
      formData.append('address[street]', createAgentFormData.address.street);
      formData.append('address[city]', createAgentFormData.address.city);
      formData.append('address[state]', createAgentFormData.address.state);
      formData.append('address[pincode]', createAgentFormData.address.pincode);
      formData.append('commissionRate', createAgentFormData.commissionRate);
      
      if (createAgentFormData.idProof) {
        formData.append('idProof', createAgentFormData.idProof);
      }
      if (createAgentFormData.addressProof) {
        formData.append('addressProof', createAgentFormData.addressProof);
      }
      if (createAgentFormData.agentProfilePhoto) {
        formData.append('agentProfilePhoto', createAgentFormData.agentProfilePhoto);
      }

      // Validate file sizes and log file information
      console.log('File validation:');
      if (createAgentFormData.idProof) {
        console.log('ID Proof:', createAgentFormData.idProof.name, 'Size:', createAgentFormData.idProof.size, 'bytes');
      }
      if (createAgentFormData.addressProof) {
        console.log('Address Proof:', createAgentFormData.addressProof.name, 'Size:', createAgentFormData.addressProof.size, 'bytes');
      }
      if (createAgentFormData.agentProfilePhoto) {
        console.log('Profile Photo:', createAgentFormData.agentProfilePhoto.name, 'Size:', createAgentFormData.agentProfilePhoto.size, 'bytes');
      }

      // Log the form data being sent
      console.log('Form Data being sent:', {
        agentCode: createAgentFormData.agentCode,
        agentName: createAgentFormData.agentName,
        phone: createAgentFormData.phone,
        email: createAgentFormData.email,
        address: createAgentFormData.address,
        commissionRate: createAgentFormData.commissionRate,
        files: {
          idProof: createAgentFormData.idProof?.name || 'No file',
          addressProof: createAgentFormData.addressProof?.name || 'No file',
          agentProfilePhoto: createAgentFormData.agentProfilePhoto?.name || 'No file'
        }
      });

      // Log FormData entries for debugging
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Call create agent API
      const response = await fetch('https://api.padyai.co.in/api/admin-society/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type for FormData - browser sets it automatically
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create Agent API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Create Agent API Response:', result);
      setCreateAgentApiResponse(result); // Store the API response
      
      if (result.success) {
        // Close modal and show success message
        setShowCreateAgentModal(false);
        setKycSuccessMessage(`Agent created successfully: ${createAgentFormData.agentName}`);
        setTimeout(() => setKycSuccessMessage(''), 5000);
        
        // Optionally refresh the page data
        // fetchSocieties();
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      setError(`Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingAgent(false);
    }
  };

  // Fetch societies data from API
  const fetchSocieties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch('https://api.padyai.co.in/api/admin-society/members', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Societies API Response:', data); 

      // Handle the actual API response structure
      if (data.success && data.data && data.data.members && data.data.pagination) {
        setSocietyData(data.data);
        console.log('Society data set successfully:', data.data.members.length, 'members');
      } else {
        console.error('Invalid data format received:', data);
        setError('Invalid data format received from API. Expected members and pagination data.');
        setSocietyData(null);
      }
    } catch (err) {
      console.error('Error fetching societies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch societies');
      setSocietyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch individual member details
  const fetchMemberDetails = async (memberId: string) => {
    try {
      setIsLoadingMemberDetails(true);
      setMemberDetailsError(null);

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setMemberDetailsError('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(`https://api.padyai.co.in/api/admin-society/members/${memberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Member Details API Response:', data);

      if (data.success && data.data) {
        setMemberDetails(data.data);
      } else {
        setMemberDetailsError('Failed to fetch member details');
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
      setMemberDetailsError(err instanceof Error ? err.message : 'Failed to fetch member details');
    } finally {
      setIsLoadingMemberDetails(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleViewMember = async (member: SocietyMember) => {
    setSelectedMember(member);
    setShowMemberModal(true);
    setMemberDetails(null); // Reset previous member details
    setMemberDetailsError(null);
    
    // Fetch detailed member information
    await fetchMemberDetails(member._id);
  };

  const handleCloseModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getKycStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading societies...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-red-800">Error Loading Societies</h2>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSocieties}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Society Members</h1>
            <p className="text-gray-600">View and manage society member information and details</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchSocieties}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={fetchPendingKyc}
              disabled={isLoadingPendingKyc}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:bg-orange-400"
            >
              {isLoadingPendingKyc ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              Pending KYC
            </button>
          {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Add Society
          </button> */}
          </div>
        </div>

        {/* Success Message */}
        {kycSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">{kycSuccessMessage}</span>
            </div>
          </div>
        )}

        {/* Create Agent API Response Display */}
        {createAgentApiResponse && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-purple-800">Create Agent API Response</h3>
              </div>
              <button
                onClick={() => setCreateAgentApiResponse(null)}
                className="text-purple-400 hover:text-purple-600 transition-colors"
                title="Clear Response"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-white rounded border p-3">
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {JSON.stringify(createAgentApiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {!societyData || societyData.members.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Society Members Found</h3>
            <p className="text-gray-500 mb-4">No society members have been registered yet.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Register First Member
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.isArray(societyData?.members) && societyData.members.map((member) => (
              <div key={member._id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div>
                      <h3 className="font-semibold text-gray-800">{member.firstName || 'Unknown'} {member.lastName || 'Name'}</h3>
                      <p className="text-sm text-gray-600">{member.email || 'No email'}</p>
                      {member.memberAccountNumber && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          ID: {member.memberAccountNumber}
                        </span>
                      )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditMember(member)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Member"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Total Members
                    </span>
                    <span className="text-sm font-medium text-gray-800">{societyData.pagination.totalMembers || 0}</span>
                </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Members</span>
                    <span className="text-sm font-medium text-green-600">{societyData.pagination.totalMembers || 0}</span>
                </div>
                  
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((societyData.pagination.totalMembers || 0) / Math.max(societyData.pagination.totalMembers || 1, 1)) * 100}%` }}
                  ></div>
                </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(member.createdAt)}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      member.isAccountActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isAccountActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
              </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.isKycApproved 
                            ? 'bg-green-100 text-green-800' 
                            : member.kycStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.isKycApproved ? 'KYC Approved' : member.kycStatus === 'rejected' ? 'KYC Rejected' : 'KYC Pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* KYC Action Dropdown */}
                        <div className="relative">
                          <select
                            value={kycAction}
                            onChange={(e) => setKycAction(e.target.value)}
                            className="block w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isUpdatingKyc === member._id}
                          >
                            <option value="">KYC Action</option>
                            <option value="approve">Approve</option>
                            <option value="reject">Reject</option>
                          </select>
                        </div>
                        
                        {/* Apply KYC Action Button */}
                        {kycAction && (
                          <button
                            onClick={() => handleKycAction(member._id, kycAction)}
                            disabled={isUpdatingKyc === member._id}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              kycAction === 'approve'
                                ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                                : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                            }`}
                          >
                            {isUpdatingKyc === member._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              kycAction === 'approve' ? 'Approve' : 'Reject'
                            )}
                          </button>
                        )}
                        
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewMember(member)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                View Details
              </button>
                      </div>
                    </div>
            </div>
          ))}
        </div>
        )}

        {/* Members Modal */}
        {showMemberModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedMember.firstName || 'Unknown'} {selectedMember.lastName || 'Name'} - Details
                  </h2>
                  <p className="text-gray-600">
                    Member since: {formatDate(selectedMember.createdAt)}
                  </p>
      </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {isLoadingMemberDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                    <span className="text-gray-600">Loading member details...</span>
                  </div>
                ) : memberDetailsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-red-800">Error Loading Details</h3>
                    </div>
                    <p className="text-red-600 mb-4">{memberDetailsError}</p>
                    <button
                      onClick={() => fetchMemberDetails(selectedMember!._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </button>
                  </div>
                ) : memberDetails ? (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">First Name</label>
                          <p className="text-gray-900 font-medium">{memberDetails.firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Last Name</label>
                          <p className="text-gray-900 font-medium">{memberDetails.lastName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-900 font-medium">{memberDetails.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Phone</label>
                          <p className="text-gray-900 font-medium">{memberDetails.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                          <p className="text-gray-900 font-medium">
                            {memberDetails.dateOfBirth ? formatDate(memberDetails.dateOfBirth) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Gender</label>
                          <p className="text-gray-900 font-medium capitalize">{memberDetails.gender || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Membership Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-green-600" />
                        Membership Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Member Account Number</label>
                          <p className="text-gray-900 font-medium font-mono">{memberDetails.memberAccountNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Membership Type</label>
                          <p className="text-gray-900 font-medium capitalize">{memberDetails.membershipType || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Membership Start Date</label>
                          <p className="text-gray-900 font-medium">
                            {memberDetails.membershipStartDate ? formatDate(memberDetails.membershipStartDate) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Monthly Contribution</label>
                          <p className="text-gray-900 font-medium">₹{memberDetails.monthlyContribution || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Total Contribution</label>
                          <p className="text-gray-900 font-medium">₹{memberDetails.totalContribution || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Referral Code</label>
                          <p className="text-gray-900 font-medium font-mono">{memberDetails.referralCode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        Status Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">KYC Status</label>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(memberDetails.kycStatus || '')}`}>
                            {memberDetails.kycStatus || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">KYC Approved</label>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            memberDetails.isKycApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {memberDetails.isKycApproved ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Account Active</label>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMembershipStatusColor(memberDetails.isAccountActive || false)}`}>
                            {memberDetails.isAccountActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Membership Active</label>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMembershipStatusColor(memberDetails.isMembershipActive || false)}`}>
                            {memberDetails.isMembershipActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {memberDetails.kycRejectionReason && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600">KYC Rejection Reason</label>
                            <p className="text-red-600 text-sm mt-1">{memberDetails.kycRejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Information */}
                    {memberDetails.address && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-purple-600" />
                          Address Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Street</label>
                            <p className="text-gray-900 font-medium">{memberDetails.address.street || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">City</label>
                            <p className="text-gray-900 font-medium">{memberDetails.address.city || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">State</label>
                            <p className="text-gray-900 font-medium">{memberDetails.address.state || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Pincode</label>
                            <p className="text-gray-900 font-medium">{memberDetails.address.pincode || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {memberDetails.emergencyContact && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Phone className="w-5 h-5 text-red-600" />
                          Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Name</label>
                            <p className="text-gray-900 font-medium">{memberDetails.emergencyContact.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Relationship</label>
                            <p className="text-gray-900 font-medium">{memberDetails.emergencyContact.relationship || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-gray-900 font-medium">{memberDetails.emergencyContact.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* KYC Documents */}
                    {memberDetails.kycDocuments && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          KYC Documents
                        </h3>
                        <div className="space-y-4">
                          {memberDetails.kycDocuments.aadharCard && (
                            <div className="border rounded-lg p-3 bg-white">
                              <h4 className="font-medium text-gray-800 mb-2">Aadhar Card</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600">Number</label>
                                  <p className="text-sm font-mono text-gray-900">{memberDetails.kycDocuments.aadharCard.number || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600">Document</label>
                                  <a 
                                    href={memberDetails.kycDocuments.aadharCard.document} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                                  >
                                    View Document
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {memberDetails.kycDocuments.panCard && (
                            <div className="border rounded-lg p-3 bg-white">
                              <h4 className="font-medium text-gray-800 mb-2">PAN Card</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600">Number</label>
                                  <p className="text-sm font-mono text-gray-900">{memberDetails.kycDocuments.panCard.number || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600">Document</label>
                                  <a 
                                    href={memberDetails.kycDocuments.panCard.document} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                                  >
                                    View Document
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {memberDetails.kycDocuments.profilePhoto && (
                            <div className="border rounded-lg p-3 bg-white">
                              <h4 className="font-medium text-gray-800 mb-2">Profile Photo</h4>
                              <a 
                                href={memberDetails.kycDocuments.profilePhoto} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                View Profile Photo
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* System Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        System Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Created At</label>
                          <p className="text-gray-900 font-medium">
                            {memberDetails.createdAt ? formatDate(memberDetails.createdAt) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Updated At</label>
                          <p className="text-gray-900 font-medium">
                            {memberDetails.updatedAt ? formatDate(memberDetails.updatedAt) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Signup Time</label>
                          <p className="text-gray-900 font-medium">
                            {memberDetails.signupTime ? formatDate(memberDetails.signupTime) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Database ID</label>
                          <p className="text-gray-900 font-medium font-mono text-xs">{memberDetails._id || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No member details available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Edit Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => handleFormInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => handleFormInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleFormInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
                <select
                  value={editFormData.membershipType}
                  onChange={(e) => handleFormInputChange('membershipType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select membership type</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution</label>
                <input
                  type="number"
                  value={editFormData.monthlyContribution}
                  onChange={(e) => handleFormInputChange('monthlyContribution', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter monthly contribution"
                  min="0"
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.isAccountActive}
                    onChange={(e) => handleFormInputChange('isAccountActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Account Active</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.isMembershipActive}
                    onChange={(e) => handleFormInputChange('isMembershipActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Membership Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isUpdatingMember}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isUpdatingMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
              >
                {isUpdatingMember ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Member'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending KYC Modal */}
      {showPendingKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Pending KYC Requests</h2>
                <p className="text-gray-600">Review and manage pending KYC applications</p>
              </div>
              <button
                onClick={() => setShowPendingKycModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {isLoadingPendingKyc ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600 mr-3" />
                  <span className="text-gray-600">Loading pending KYC requests...</span>
                </div>
              ) : pendingKycError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-800">Error Loading Pending KYC</h3>
                  </div>
                  <p className="text-red-600 mb-4">{pendingKycError}</p>
                  <button
                    onClick={fetchPendingKyc}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              ) : pendingKycData ? (
                <div className="space-y-6">
                  {/* API Response Display */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-orange-800">Pending KYC Summary</h3>
                      </div>
                      <button
                        onClick={() => setPendingKycData(null)}
                        className="text-orange-400 hover:text-orange-600 transition-colors"
                        title="Clear Response"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Beautiful Response Summary */}
                    {pendingKycData.success && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Status</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">Success</p>
                          <p className="text-xs text-gray-500 mt-1">API call completed successfully</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Total Requests</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            {Array.isArray(pendingKycData.data) ? pendingKycData.data.length : 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Pending KYC applications</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Last Updated</span>
                          </div>
                          <p className="text-lg font-bold text-orange-600">
                            {pendingKycData.timestamp ? formatDate(pendingKycData.timestamp) : 'Now'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Real-time data</p>
                        </div>
                      </div>
                    )}

                    {/* Additional API Info */}
                    {pendingKycData.message && (
                      <div className="mt-4 bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Message:</span>
                          <span className="text-sm text-gray-600">{pendingKycData.message}</span>
                        </div>
                      </div>
                    )}

                    {/* Pagination Info if available */}
                    {pendingKycData.pagination && (
                      <div className="mt-4 bg-white rounded-lg p-3 border border-orange-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-500">Current Page</p>
                            <p className="text-lg font-semibold text-orange-600">{pendingKycData.pagination.currentPage || 1}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Pages</p>
                            <p className="text-lg font-semibold text-orange-600">{pendingKycData.pagination.totalPages || 1}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Has Next</p>
                            <p className="text-lg font-semibold text-orange-600">{pendingKycData.pagination.hasNext ? 'Yes' : 'No'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Has Previous</p>
                            <p className="text-lg font-semibold text-orange-600">{pendingKycData.pagination.hasPrev ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pending KYC List */}
                  {pendingKycData.success && pendingKycData.data && Array.isArray(pendingKycData.data) && pendingKycData.data.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Pending KYC Applications ({pendingKycData.data.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingKycData.data.map((kycRequest: any) => (
                          <div key={kycRequest._id || kycRequest.memberId} className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {kycRequest.firstName || kycRequest.member?.firstName || 'Unknown'} {kycRequest.lastName || kycRequest.member?.lastName || 'Name'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {kycRequest.email || kycRequest.member?.email || 'No email'}
                                </p>
                                {kycRequest.memberAccountNumber && (
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                    ID: {kycRequest.memberAccountNumber}
                                  </span>
                                )}
                              </div>
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Pending
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-medium">{kycRequest.phone || kycRequest.member?.phone || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Submitted:</span>
                                <span className="font-medium">
                                  {kycRequest.createdAt || kycRequest.submittedAt ? formatDate(kycRequest.createdAt || kycRequest.submittedAt) : 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => {
                                  // Handle approve action
                                  if (kycRequest._id || kycRequest.memberId) {
                                    handleKycAction(kycRequest._id || kycRequest.memberId, 'approve');
                                  }
                                }}
                                className="flex-1 bg-green-600 text-white px-3 py-2 text-sm rounded-md hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  // Handle reject action
                                  if (kycRequest._id || kycRequest.memberId) {
                                    handleKycAction(kycRequest._id || kycRequest.memberId, 'reject');
                                  }
                                }}
                                className="flex-1 bg-red-600 text-white px-3 py-2 text-sm rounded-md hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending KYC requests found.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending KYC data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Agent</h2>
                <p className="text-gray-600">Add a new agent to the system</p>
              </div>
              <button
                onClick={() => setShowCreateAgentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent Code *</label>
                  <input
                    type="text"
                    value={createAgentFormData.agentCode}
                    onChange={(e) => handleCreateAgentInputChange('agentCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., AGENT001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
                  <input
                    type="text"
                    value={createAgentFormData.agentName}
                    onChange={(e) => handleCreateAgentInputChange('agentName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., John Agent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={createAgentFormData.phone}
                    onChange={(e) => handleCreateAgentInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., 9876543210"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={createAgentFormData.email}
                    onChange={(e) => handleCreateAgentInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., agent@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%) *</label>
                  <input
                    type="number"
                    value={createAgentFormData.commissionRate}
                    onChange={(e) => handleCreateAgentInputChange('commissionRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., 5"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={createAgentFormData.address.street}
                      onChange={(e) => handleCreateAgentInputChange('address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 123 Agent Street"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={createAgentFormData.address.city}
                      onChange={(e) => handleCreateAgentInputChange('address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Mumbai"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={createAgentFormData.address.state}
                      onChange={(e) => handleCreateAgentInputChange('address.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., Maharashtra"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={createAgentFormData.address.pincode}
                      onChange={(e) => handleCreateAgentInputChange('address.pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 400001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Uploads</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof *</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('idProof', e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      accept="image/*,.pdf"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Accept: Images, PDF</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Proof *</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('addressProof', e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      accept="image/*,.pdf"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Accept: Images, PDF</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('agentProfilePhoto', e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      accept="image/*"
                    />
                    <p className="text-xs text-gray-500 mt-1">Accept: Images only</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowCreateAgentModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isCreatingAgent}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgentSubmit}
                disabled={isCreatingAgent}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center gap-2"
              >
                {isCreatingAgent ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Society;