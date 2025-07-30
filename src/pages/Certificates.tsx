import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { Award, Star, Edit3, Save, FileDown } from 'lucide-react';

interface CertificateProps {
  recipientName: string;
  courseName: string;
  completionDate: string;
  instructorName?: string;
  organizationName?: string;
  certificateId?: string;
}

const Certificate: React.FC<CertificateProps> = ({
  recipientName,
  courseName,
  completionDate,
  instructorName = "John Smith",
  organizationName = "Excellence Academy",
  certificateId = "CERT-2024-001"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    recipientName,
    courseName,
    completionDate,
    instructorName,
    organizationName,
    certificateId
  });
  const certificateRef = useRef<HTMLDivElement>(null);

  // Update editable data when editing mode changes
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save to backend here
  };

  // Download certificate as image
  const downloadCertificate = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create certificate background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add blue border
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Add decorative border
        ctx.setLineDash([10, 5]);
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
        ctx.setLineDash([]);
        
        // Add title
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 140);
        
        // Add content
        ctx.font = '28px Arial';
        ctx.fillText('This is to certify that', canvas.width / 2, 220);
        
        ctx.font = 'bold 38px Arial';
        ctx.fillStyle = '#1F2937';
        ctx.fillText(editableData.recipientName, canvas.width / 2, 300);
        
        ctx.font = '28px Arial';
        ctx.fillStyle = '#4B5563';
        ctx.fillText('has successfully completed the course', canvas.width / 2, 360);
        
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#1D4ED8';
        ctx.fillText(editableData.courseName, canvas.width / 2, 420);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#6B7280';
        ctx.fillText(`Completed on ${editableData.completionDate}`, canvas.width / 2, 500);
        
        // Add footer
        ctx.font = '20px Arial';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText(editableData.instructorName, 150, 650);
        ctx.fillText('Course Instructor', 150, 675);
        
        ctx.textAlign = 'right';
        ctx.fillText('Director', canvas.width - 150, 650);
        ctx.fillText(editableData.organizationName, canvas.width - 150, 675);
        
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText(`Certificate ID: ${editableData.certificateId}`, canvas.width / 2, 740);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${editableData.recipientName.replace(/\s+/g, '-').toLowerCase()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error generating certificate. Please try again.');
    }
  };
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
                {/* Control Buttons */}
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-blue-600 mr-3" />
      <div>
              <h1 className="text-2xl font-bold text-gray-800">Certificate Management</h1>
              {isEditing && <p className="text-sm text-orange-600 font-medium">✏️ Editing Mode - Click fields to modify</p>}
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={isEditing ? handleSave : handleEdit}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {isEditing ? <Save size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
              {isEditing ? 'Save Changes' : 'Edit Certificate'}
            </button>
            <button 
              onClick={downloadCertificate}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-md"
            >
              <FileDown size={16} className="mr-2" />
              Download PDF
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-2xl border-8 border-gradient" ref={certificateRef}>
          {/* Decorative Border */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-20 h-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-br-full opacity-10"></div>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20">
          <div className="w-full h-full bg-gradient-to-bl from-blue-600 to-indigo-600 rounded-bl-full opacity-10"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-20 h-20">
          <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-tr-full opacity-10"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-20 h-20">
          <div className="w-full h-full bg-gradient-to-tl from-blue-600 to-indigo-600 rounded-tl-full opacity-10"></div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Award className="text-blue-600 w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-wide">
            CERTIFICATE OF COMPLETION
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>

                 {/* Content */}
         <div className="text-center mb-8">
           <p className="text-lg text-gray-600 mb-6 leading-relaxed">
             This is to certify that
           </p>
           
           <div className="mb-6">
             {isEditing ? (
               <input
                 type="text"
                 value={editableData.recipientName}
                 onChange={(e) => setEditableData({...editableData, recipientName: e.target.value})}
                 className="text-5xl font-bold text-gray-800 leading-tight bg-transparent border-b-2 border-blue-300 text-center w-full max-w-2xl mx-auto focus:outline-none focus:border-blue-500 px-4 py-2"
                 placeholder="Recipient Name"
               />
             ) : (
               <h2 className="text-5xl font-bold text-gray-800 leading-tight">
                 {editableData.recipientName}
               </h2>
             )}
           </div>
           
           <p className="text-lg text-gray-600 mb-4">
             has successfully completed the course
           </p>
           
           <div className="mb-8">
             {isEditing ? (
               <input
                 type="text"
                 value={editableData.courseName}
                 onChange={(e) => setEditableData({...editableData, courseName: e.target.value})}
                 className="text-3xl font-semibold text-blue-700 leading-relaxed bg-transparent border-b-2 border-blue-300 text-center w-full max-w-xl mx-auto focus:outline-none focus:border-blue-500 px-4 py-2"
                 placeholder="Course Name"
               />
             ) : (
               <h3 className="text-3xl font-semibold text-blue-700 leading-relaxed">
                 {editableData.courseName}
               </h3>
             )}
           </div>
           
           <div className="flex justify-center items-center mb-8">
             <Star className="text-yellow-500 w-6 h-6 mr-2" />
             {isEditing ? (
               <div className="flex items-center space-x-2">
                 <span className="text-lg text-gray-600">Completed on</span>
                 <input
                   type="date"
                   value={editableData.completionDate}
                   onChange={(e) => setEditableData({...editableData, completionDate: e.target.value})}
                   className="text-lg text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2 py-1"
                 />
               </div>
             ) : (
               <p className="text-lg text-gray-600">
                 Completed on {editableData.completionDate}
               </p>
             )}
             <Star className="text-yellow-500 w-6 h-6 ml-2" />
           </div>
         </div>

                 {/* Footer */}
         <div className="flex justify-between items-end mt-12">
           <div className="text-center flex-1">
             <div className="w-48 border-b-2 border-gray-400 mb-2 mx-auto"></div>
             {isEditing ? (
               <input
                 type="text"
                 value={editableData.instructorName}
                 onChange={(e) => setEditableData({...editableData, instructorName: e.target.value})}
                 className="text-sm text-gray-600 font-medium bg-transparent border-b border-gray-300 text-center w-48 focus:outline-none focus:border-blue-500 mx-auto block"
                 placeholder="Instructor Name"
               />
             ) : (
               <p className="text-sm text-gray-600 font-medium">{editableData.instructorName}</p>
             )}
             <p className="text-xs text-gray-500 mt-1">Course Instructor</p>
           </div>
           
           <div className="text-center flex-1">
             <div className="mb-4">
               <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                 <Award className="text-white w-10 h-10" />
               </div>
             </div>
             {isEditing ? (
               <input
                 type="text"
                 value={editableData.organizationName}
                 onChange={(e) => setEditableData({...editableData, organizationName: e.target.value})}
                 className="text-sm font-bold text-gray-700 bg-transparent border-b border-gray-300 text-center w-full max-w-xs focus:outline-none focus:border-blue-500 mx-auto block"
                 placeholder="Organization"
               />
             ) : (
               <p className="text-sm font-bold text-gray-700">{editableData.organizationName}</p>
             )}
             <p className="text-xs text-gray-500 mt-1">Official Seal</p>
           </div>
           
           <div className="text-center flex-1">
             <div className="w-48 border-b-2 border-gray-400 mb-2 mx-auto"></div>
             <p className="text-sm text-gray-600 font-medium">Director</p>
             {isEditing ? (
               <input
                 type="text"
                 value={editableData.organizationName}
                 onChange={(e) => setEditableData({...editableData, organizationName: e.target.value})}
                 className="text-xs text-gray-500 bg-transparent border-b border-gray-300 text-center w-48 focus:outline-none focus:border-blue-500 mx-auto block mt-1"
                 placeholder="Organization"
               />
             ) : (
               <p className="text-xs text-gray-500 mt-1">{editableData.organizationName}</p>
             )}
           </div>
         </div>

        {/* Certificate ID */}
        <div className="mt-8 text-center">
          {isEditing ? (
            <div className="flex justify-center items-center space-x-2">
              <span className="text-xs text-gray-500">Certificate ID:</span>
              <input
                type="text"
                value={editableData.certificateId}
                onChange={(e) => setEditableData({...editableData, certificateId: e.target.value})}
                className="text-xs text-gray-500 bg-transparent border-b border-gray-300 text-center w-40 focus:outline-none focus:border-blue-500 px-2 py-1"
                placeholder="Certificate ID"
              />
            </div>
          ) : (
            <p className="text-xs text-gray-500">Certificate ID: {editableData.certificateId}</p>
          )}
        </div>

        {/* Decorative Elements */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 opacity-5">
              <Award className="w-32 h-32 text-blue-600" />
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-5">
              <Award className="w-32 h-32 text-blue-600" />
            </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default Certificate;