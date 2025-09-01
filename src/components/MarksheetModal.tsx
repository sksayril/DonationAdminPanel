import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Save, Move, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StudentItem {
  _id?: string;
  firstName?: string;
  lastName?: string;
}

interface MarksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem | null;
}

interface MarksheetData {
  studentName: string;
  fatherName: string;
  motherName: string;
  course: string;
  duration: string;
  year: string;
  enrollmentNo: string;
  grade: string;
  issueDate: string;
  signatureFile: File | null;
  signature: string;
}

interface OverlayPositions {
  studentName: { top: number; left: number };
  fatherName: { top: number; left: number };
  motherName: { top: number; left: number };
  course: { top: number; left: number };
  duration: { top: number; left: number };
  year: { top: number; left: number };
  enrollmentNo: { top: number; left: number };
  grade: { top: number; left: number };
  issueDate: { top: number; left: number };
  signature: { top: number; left: number };
}

const defaultPositions: OverlayPositions = {
  studentName: { top: 35, left: 50 },
  fatherName: { top: 42, left: 35 },
  motherName: { top: 42, left: 65 },
  course: { top: 50, left: 50 },
  duration: { top: 57, left: 30 },
  year: { top: 57, left: 70 },
  enrollmentNo: { top: 64, left: 50 },
  grade: { top: 71, left: 50 },
  issueDate: { top: 78, left: 35 },
  signature: { top: 78, left: 65 },
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

const MarksheetModal: React.FC<MarksheetModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const [marksheetData, setMarksheetData] = useState<MarksheetData>({
    studentName: student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : '',
    fatherName: '',
    motherName: '',
    course: 'CERTIFICATE IN INFORMATION TECHNOLOGY',
    duration: '12 Months',
    year: new Date().getFullYear().toString(),
    enrollmentNo: student?._id?.slice(-6) || '',
    grade: 'A',
    issueDate: new Date().toLocaleDateString('en-GB'),
    signatureFile: null,
    signature: 'Principal'
  });

  const [positions, setPositions] = useState<OverlayPositions>(defaultPositions);
  const [draggingKey, setDraggingKey] = useState<keyof OverlayPositions | null>(null);
  const [isMoveMode, setIsMoveMode] = useState<boolean>(true);
  const [selectedFont, setSelectedFont] = useState<string>(fontOptions[0].value);
  const [fontSize, setFontSize] = useState<number>(16);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const marksheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMoveMode(true);
    }
  }, [isOpen]);

  // Update student name when student prop changes
  useEffect(() => {
    if (student) {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
      setMarksheetData(prev => ({
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

  const handleInputChange = (field: keyof MarksheetData, value: string) => {
    setMarksheetData(prev => ({
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
    
    setMarksheetData(prev => ({
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

  const downloadMarksheet = async () => {
    if (!marksheetRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      
      // Temporarily disable move mode and hide cursor during capture
      const originalMoveMode = isMoveMode;
      setIsMoveMode(false);

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the marksheet as canvas
      const canvas = await html2canvas(marksheetRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: marksheetRef.current.offsetWidth,
        height: marksheetRef.current.offsetHeight,
      });

      // Create PDF
      const imgWidth = 210; // A4 width in mm (portrait)
      const imgHeight = 297; // A4 height in mm (portrait)
      
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename with student name and date
      const studentName = marksheetData.studentName || 'Marksheet';
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `${studentName.replace(/\s+/g, '_')}_Marksheet_${date}.pdf`;
      
      pdf.save(filename);

      // Restore original move mode
      setIsMoveMode(originalMoveMode);
    } catch (error) {
      console.error('Error generating marksheet:', error);
      alert('Failed to generate marksheet. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = () => {
    console.log('Saving marksheet for:', marksheetData, positions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left side - Marksheet Preview */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="relative mx-auto" style={{ maxWidth: '800px' }}>
              {/* Header with controls */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Marksheet Preview
                  </h3>
                  <p className="text-sm text-gray-600">
                    Student: {marksheetData.studentName}
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
                    onClick={downloadMarksheet}
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
              
              {/* Marksheet Container */}
              <div
                ref={marksheetRef}
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
                  src="/marksheet.jpg" 
                  alt="Marksheet Template"
                  className="w-full h-auto"
                  style={{ display: 'block' }}
                />
                
                {/* Text Overlays */}
                <div className="absolute inset-0">
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
                    {marksheetData.studentName || 'Student Name Not Set'}
                  </div>
                  
                  {/* Father's Name */}
                  <div 
                    className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                    style={{ 
                      top: `${positions.fatherName.top}%`,
                      left: `${positions.fatherName.left}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${fontSize}px`,
                      fontFamily: selectedFont
                    }}
                    onMouseDown={(e) => startDrag('fatherName', e)}
                    onTouchStart={(e) => startDrag('fatherName', e)}
                  >
                    {marksheetData.fatherName}
                  </div>
                  
                  {/* Mother's Name */}
                  <div 
                    className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                    style={{ 
                      top: `${positions.motherName.top}%`,
                      left: `${positions.motherName.left}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${fontSize}px`,
                      fontFamily: selectedFont
                    }}
                    onMouseDown={(e) => startDrag('motherName', e)}
                    onTouchStart={(e) => startDrag('motherName', e)}
                  >
                    {marksheetData.motherName}
                  </div>
                  
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
                    {marksheetData.course}
                  </div>
                  
                  {/* Duration */}
                  <div 
                    className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                    style={{ 
                      top: `${positions.duration.top}%`,
                      left: `${positions.duration.left}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${fontSize}px`,
                      fontFamily: selectedFont
                    }}
                    onMouseDown={(e) => startDrag('duration', e)}
                    onTouchStart={(e) => startDrag('duration', e)}
                  >
                    {marksheetData.duration}
                  </div>
                  
                  {/* Year */}
                  <div 
                    className={`absolute text-center font-semibold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                    style={{ 
                      top: `${positions.year.top}%`,
                      left: `${positions.year.left}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${fontSize}px`,
                      fontFamily: selectedFont
                    }}
                    onMouseDown={(e) => startDrag('year', e)}
                    onTouchStart={(e) => startDrag('year', e)}
                  >
                    {marksheetData.year}
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
                    {marksheetData.enrollmentNo}
                  </div>
                  
                  {/* Grade */}
                  <div 
                    className={`absolute text-center font-bold text-blue-800 cursor-${isMoveMode ? 'move' : 'default'}`}
                    style={{ 
                      top: `${positions.grade.top}%`,
                      left: `${positions.grade.left}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${fontSize + 4}px`,
                      fontFamily: selectedFont
                    }}
                    onMouseDown={(e) => startDrag('grade', e)}
                    onTouchStart={(e) => startDrag('grade', e)}
                  >
                    {marksheetData.grade}
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
                    {marksheetData.issueDate}
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
                      {marksheetData.signature}
                    </div>
                  )}
                </div>
                </div>
              </div>

              {/* Helper note */}
              <p className="text-xs text-gray-500 mt-2">Tip: Choose a font and toggle Move to reposition fields. Positions are responsive.</p>
            </div>
          </div>

          {/* Right side - Editing Fields */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Edit Marksheet Details</h4>
            
            <div className="space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={marksheetData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={marksheetData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter father's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  value={marksheetData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mother's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={marksheetData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={marksheetData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 12 Months"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="text"
                  value={marksheetData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  value={marksheetData.enrollmentNo}
                  onChange={(e) => handleInputChange('enrollmentNo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={marksheetData.grade}
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
                  value={marksheetData.issueDate.split('/').reverse().join('-')}
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
                  Signature
                </label>
                <input
                  type="text"
                  value={marksheetData.signature}
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
                  {marksheetData.signatureFile && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {marksheetData.signatureFile.name} uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500">Drag fields on the preview when Move is ON. Positions are responsive.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksheetModal;
