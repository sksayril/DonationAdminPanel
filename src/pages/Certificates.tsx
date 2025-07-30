import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Award, Upload, File, Plus, Download, Trash2, Search } from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  studentName: string;
  issueDate: string;
  type: string;
  fileUrl?: string;
}

const Certificates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'upload'>('generate');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [certificateType, setCertificateType] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };
  
  // Handle generate certificate form submission
  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would call an API to generate the certificate
    // For demo purposes, we'll add it to our local state
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      name: `${certificateType} - ${courseName}`,
      studentName,
      issueDate,
      type: certificateType,
      fileUrl: 'sample-certificate.pdf' // This would be a URL from your backend
    };
    
    setCertificates([...certificates, newCertificate]);
    // Reset form
    setCertificateType('');
    setStudentName('');
    setCourseName('');
    setIssueDate('');
  };
  
  // Handle upload certificate form submission
  const handleUploadCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) return;
    
    // In a real application, you would upload the file to a server
    // For demo purposes, we'll add it to our local state
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      name: uploadedFile.name,
      studentName,
      issueDate,
      type: 'Uploaded',
      fileUrl: URL.createObjectURL(uploadedFile) // Create a local URL for demo
    };
    
    setCertificates([...certificates, newCertificate]);
    // Reset form
    setStudentName('');
    setIssueDate('');
    setUploadedFile(null);
  };
  
  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(cert => 
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cert.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Delete certificate
  const deleteCertificate = (id: string) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };
  return (
    <Layout>
      <div>
        <div className="flex items-center mb-6">
          <Award className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Certificates</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 font-medium ${activeTab === 'generate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            <Plus size={16} className="inline mr-2" />
            Generate Certificate
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            <Upload size={16} className="inline mr-2" />
            Upload Certificate
          </button>
        </div>
        
        {/* Certificate Generator Form */}
        {activeTab === 'generate' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Generate New Certificate</h2>
            <form onSubmit={handleGenerateCertificate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certificate Type</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value)}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Completion">Course Completion</option>
                    <option value="Merit">Merit Certificate</option>
                    <option value="Participation">Participation</option>
                    <option value="Appreciation">Appreciation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course/Program Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Generate Certificate
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Certificate Upload Form */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Certificate</h2>
            <form onSubmit={handleUploadCertificate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Certificate File (PDF)</label>
                  <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <File className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            accept=".pdf" 
                            className="sr-only"
                            onChange={handleFileUpload}
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF files only</p>
                      {uploadedFile && (
                        <p className="text-sm text-green-600 mt-2">{uploadedFile.name} selected</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out flex items-center"
                  disabled={!uploadedFile}
                >
                  <Upload size={16} className="mr-1" />
                  Upload Certificate
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Certificate List */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Certificates List</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search certificates..."
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <File className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>No certificates found</p>
              <p className="text-sm">Generate or upload certificates to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Certificate</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id}>
                      <td className="p-4 text-gray-900 font-medium">{cert.name}</td>
                      <td className="p-4 text-gray-600">{cert.studentName}</td>
                      <td className="p-4 text-gray-600">{cert.type}</td>
                      <td className="p-4 text-gray-600">{cert.issueDate}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => cert.fileUrl && window.open(cert.fileUrl, '_blank')}
                        >
                          <Download size={16} className="inline" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 ml-3"
                          onClick={() => deleteCertificate(cert.id)}
                        >
                          <Trash2 size={16} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Certificates;