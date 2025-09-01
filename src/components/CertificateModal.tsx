import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Save, Move, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StudentItem {
  _id?: string;
  firstName?: string;
  lastName?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem | null;
}

interface CertificateData {
  studentName: string;
  tuitionCenter: string;
  course: string;
  grade: string;
  issueDate: string;
  enrollmentNo: string;
  description: string;
  signature: string;
  signatureFile: File | null;
}

interface OverlayPositions {
  studentName: { top: number; left: number };
  tuitionCenter: { top: number; left: number };
  
  course: { top: number; left: number };
  grade: { top: number; left: number };
  issueDate: { top: number; left: number };
  enrollmentNo: { top: number; left: number };
  description: { top: number; left: number };
  signature: { top: number; left: number };
}

const defaultPositions: OverlayPositions = {
  studentName: { top: 45, left: 50 },
  tuitionCenter: { top: 25, left: 50 },
  course: { top: 60, left: 50 },
  grade: { top: 68, left: 30 },
  issueDate: { top: 75, left: 35 },
  enrollmentNo: { top: 75, left: 65 },
  description: { top: 52, left: 50 },
  signature: { top: 80, left: 75 },
};

const fontOptions = [
  { label: 'Playfair Display (Elegant Serif)', value: '"Playfair Display", serif' },
  { label: 'Cinzel (Roman Imperial)', value: 'Cinzel, serif' },
  { label: 'Cormorant Garamond (Classical)', value: '"Cormorant Garamond", serif' },
  { label: 'EB Garamond (Traditional)', value: '"EB Garamond", serif' },
  { label: 'Libre Baskerville (Refined)', value: '"Libre Baskerville", serif' },
  { label: 'Crimson Text (Academic)', value: '"Crimson Text", serif' },
  { label: 'Merriweather (Classic Serif)', value: 'Merriweather, serif' },
  { label: 'Montserrat (Clean Sans)', value: 'Montserrat, sans-serif' },
  { label: 'Roboto (Modern Sans)', value: 'Roboto, sans-serif' },
  { label: 'Great Vibes (Script)', value: '"Great Vibes", cursive' }
];

const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const [certificateData, setCertificateData] = useState<CertificateData>({
    studentName: student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : '',
    tuitionCenter: 'PRADHAN TECHNICAL EDUCATION',
    course: 'CERTIFICATE IN INFORMATION TECHNOLOGY',
    grade: 'A',
    issueDate: new Date().toLocaleDateString('en-GB'),
    enrollmentNo: student?._id?.slice(-6) || '',
    description: 'This is to certify that the above named student has successfully completed the course with dedication and commitment.',
    signature: 'Principal',
    signatureFile: null
  });

  const [positions, setPositions] = useState<OverlayPositions>(defaultPositions);
  const [draggingKey, setDraggingKey] = useState<keyof OverlayPositions | null>(null);
  const [isMoveMode, setIsMoveMode] = useState<boolean>(true);
  const [selectedFont, setSelectedFont] = useState<string>(fontOptions[0].value);
  const [fontSize, setFontSize] = useState<number>(16);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const certificateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset move mode on open
      setIsMoveMode(true);
    }
  }, [isOpen]);

  // Update student name when student prop changes
  useEffect(() => {
    console.log('Student prop changed:', student);
    if (student) {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
      console.log('Generated full name:', fullName);
      setCertificateData(prev => ({
        ...prev,
        studentName: fullName,
        enrollmentNo: student._id?.slice(-6) || ''
      }));
    }
  }, [student]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (signatureUrl) {
        URL.revokeObjectURL(signatureUrl);
      }
    };
  }, [signatureUrl]);

  const handleInputChange = (field: keyof CertificateData, value: string) => {
    setCertificateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignatureFileChange = (file: File | null) => {
    // Clean up previous URL if exists
    if (signatureUrl) {
      URL.revokeObjectURL(signatureUrl);
    }
    
    // Create new URL if file exists
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setSignatureUrl(newUrl);
    } else {
      setSignatureUrl(null);
    }
    
    setCertificateData(prev => ({
      ...prev,
      signatureFile: file
    }));
  };

  const startDrag = (key: keyof OverlayPositions, e: React.MouseEvent | React.TouchEvent) => {
    if (!isMoveMode) return;
    e.stopPropagation();
    setDraggingKey(key);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingKey || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let clientX: number;
    let clientY: number;
    if ('touches' in e && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    } else {
      return;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setPositions(prev => ({
      ...prev,
      [draggingKey!]: {
        top: Math.min(95, Math.max(5, y)),
        left: Math.min(95, Math.max(5, x)),
      },
    }));
  };

  const endDrag = () => setDraggingKey(null);
  const resetPositions = () => setPositions(defaultPositions);

  const downloadCertificate = async () => {
    if (!certificateRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      
      // Temporarily disable move mode and hide cursor during capture
      const originalMoveMode = isMoveMode;
      setIsMoveMode(false);

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the certificate as canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
      });

      // Create PDF
      const imgWidth = 297; // A4 width in mm
      const imgHeight = 210; // A4 height in mm (landscape)
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename with student name and date
      const studentName = certificateData.studentName || 'Certificate';
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `${studentName.replace(/\s+/g, '_')}_Certificate_${date}.pdf`;
      
      pdf.save(filename);

      // Restore original move mode
      setIsMoveMode(originalMoveMode);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };



  const handleSave = () => {
    console.log('Saving certificate for:', certificateData, positions);
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Generate Certificate
                </h3>
                <p className="text-sm text-gray-600">
                  Student: {certificateData.studentName}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Font selector */}
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Select font"
                >
                  {fontOptions.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                {/* Font size control */}
                <div className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md bg-white">
                  <label className="text-xs text-gray-600">Size:</label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    title="Font size"
                  />
                  <span className="text-xs text-gray-600 w-6">{fontSize}</span>
                </div>
                <button
                  onClick={() => setIsMoveMode(!isMoveMode)}
                  className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${isMoveMode ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700 bg-white'} hover:bg-gray-50`}
                  title="Toggle Move Mode"
                >
                  <Move className="w-4 h-4 mr-2" />
                  {isMoveMode ? 'Move: ON' : 'Move: OFF'}
                </button>
                <button
                  onClick={resetPositions}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={downloadCertificate}
                  disabled={isDownloading}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    isDownloading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
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
          <div className="flex">
            {/* Left side - Certificate Preview */}
            <div className="flex-1 p-6 bg-gray-50">
              <div className="relative mx-auto" style={{ maxWidth: '800px' }}>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Certificate Preview</h4>
                
                {/* Certificate Container */}
                <div
                  ref={certificateRef}
                  className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden select-none"
                  onMouseMove={onMove}
                  onMouseUp={endDrag}
                  onMouseLeave={endDrag}
                  onTouchMove={onMove}
                  onTouchEnd={endDrag}
                >
                  <div ref={containerRef} className="relative w-full h-full">
                  {/* Background Image */}
                  <img 
                    src="/certificate-template.jpg" 
                    alt="Certificate Template"
                    className="w-full h-auto"
                    style={{ display: 'block' }}
                  />
                  
                  {/* Text Overlays */}
                  <div className="absolute inset-0">
                                         {/* Tuition Center */}
                     <div 
                       className={`absolute text-center font-bold text-blue-900 cursor-${isMoveMode ? 'move' : 'default'}`}
                       style={{ 
                         top: `${positions.tuitionCenter.top}%`,
                         left: `${positions.tuitionCenter.left}%`,
                         transform: 'translate(-50%, -50%)',
                         fontSize: `${fontSize + 4}px`,
                         fontFamily: selectedFont
                       }}
                       onMouseDown={(e) => startDrag('tuitionCenter', e)}
                       onTouchStart={(e) => startDrag('tuitionCenter', e)}
                     >
                       {certificateData.tuitionCenter}
                     </div>
                     
                     {/* Student Name */}
                     <div 
                       className={`absolute text-center font-bold text-blue-900 cursor-${isMoveMode ? 'move' : 'default'}`}
                       style={{ 
                         top: `${positions.studentName.top}%`,
                         left: `${positions.studentName.left}%`,
                         transform: 'translate(-50%, -50%)',
                         fontSize: `${fontSize + 8}px`,
                         fontFamily: selectedFont
                       }}
                       onMouseDown={(e) => startDrag('studentName', e)}
                       onTouchStart={(e) => startDrag('studentName', e)}
                     >
                       {certificateData.studentName || 'Student Name Not Set'}
                     </div>
                    
                    {/* Description */}
                    <div 
                      className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                      style={{ 
                        top: `${positions.description.top}%`,
                        left: `${positions.description.left}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${fontSize - 1}px`,
                        fontFamily: selectedFont,
                        maxWidth: '60%',
                        lineHeight: '1.4'
                      }}
                      onMouseDown={(e) => startDrag('description', e)}
                      onTouchStart={(e) => startDrag('description', e)}
                    >
                      {certificateData.description}
                    </div>
                    
                    {/* Signature */}
                    {signatureUrl ? (
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className={`absolute cursor-${isMoveMode ? 'move' : 'default'}`}
                        style={{ 
                          top: `${positions.signature.top}%`,
                          left: `${positions.signature.left}%`,
                          transform: 'translate(-50%, -50%)',
                          maxWidth: '120px',
                          maxHeight: '60px',
                          objectFit: 'contain'
                        }}
                        onMouseDown={(e) => startDrag('signature', e)}
                        onTouchStart={(e) => startDrag('signature', e)}
                      />
                    ) : (
                      <div 
                        className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                        style={{ 
                          top: `${positions.signature.top}%`,
                          left: `${positions.signature.left}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${fontSize}px`,
                          fontFamily: selectedFont
                        }}
                        onMouseDown={(e) => startDrag('signature', e)}
                        onTouchStart={(e) => startDrag('signature', e)}
                      >
                        {certificateData.signature}
                      </div>
                    )}
                    
                    {/* Course Name */}
                    <div 
                      className={`absolute text-center font-bold text-blue-900 cursor-${isMoveMode ? 'move' : 'default'}`}
                      style={{ 
                        top: `${positions.course.top}%`,
                        left: `${positions.course.left}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${fontSize + 2}px`,
                        fontFamily: selectedFont
                      }}
                      onMouseDown={(e) => startDrag('course', e)}
                      onTouchStart={(e) => startDrag('course', e)}
                    >
                      {certificateData.course}
                    </div>
                    
                    {/* Grade */}
                    <div 
                      className={`absolute text-center font-bold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                      style={{ 
                        top: `${positions.grade.top}%`,
                        left: `${positions.grade.left}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${fontSize}px`,
                        fontFamily: selectedFont
                      }}
                      onMouseDown={(e) => startDrag('grade', e)}
                      onTouchStart={(e) => startDrag('grade', e)}
                    >
                      {certificateData.grade}
                    </div>
                    
                    {/* Issue Date */}
                    <div 
                      className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                      style={{ 
                        top: `${positions.issueDate.top}%`,
                        left: `${positions.issueDate.left}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${fontSize - 2}px`,
                        fontFamily: selectedFont
                      }}
                      onMouseDown={(e) => startDrag('issueDate', e)}
                      onTouchStart={(e) => startDrag('issueDate', e)}
                    >
                      {certificateData.issueDate}
                    </div>
                    
                    {/* Enrollment Number */}
                    <div 
                      className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                      style={{ 
                        top: `${positions.enrollmentNo.top}%`,
                        left: `${positions.enrollmentNo.left}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${fontSize - 2}px`,
                        fontFamily: selectedFont
                      }}
                      onMouseDown={(e) => startDrag('enrollmentNo', e)}
                      onTouchStart={(e) => startDrag('enrollmentNo', e)}
                    >
                      {certificateData.enrollmentNo}
                    </div>
                  </div>
                  </div>
                </div>

                {/* Helper note */}
                <p className="text-xs text-gray-500 mt-2">Tip: Choose a font and toggle Move to reposition fields. Positions are responsive.</p>
              </div>
            </div>

            {/* Right side - Editing Fields */}
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Edit Certificate Details</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={certificateData.studentName}
                    onChange={(e) => handleInputChange('studentName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tuition Center Name
                  </label>
                  <input
                    type="text"
                    value={certificateData.tuitionCenter}
                    onChange={(e) => handleInputChange('tuitionCenter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={certificateData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter certificate description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature
                  </label>
                  <input
                    type="text"
                    value={certificateData.signature}
                    onChange={(e) => handleInputChange('signature', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter signature (e.g., Principal, Director)"
                  />
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Signature Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSignatureFileChange(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {certificateData.signatureFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {certificateData.signatureFile.name} uploaded
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={certificateData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                  </label>
                  <select
                    value={certificateData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={certificateData.issueDate.split('/').reverse().join('-')}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const formattedDate = date.toLocaleDateString('en-GB');
                      handleInputChange('issueDate', formattedDate);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={certificateData.enrollmentNo}
                    onChange={(e) => handleInputChange('enrollmentNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500">Drag fields on the preview when Move is ON. Positions are responsive.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
