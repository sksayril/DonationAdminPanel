import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { Award, Edit3, Save, FileDown, Plus, Trash2 } from 'lucide-react';
import Draggable from 'react-draggable';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Field {
  id: number;
  text: string; // Holds text or image data URL
  x: number;
  y: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  fontFamily: string;
  type: 'text' | 'date' | 'signature';
  width?: number;
  height?: number;
}

const googleFonts = [
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Merriweather', family: 'Merriweather, serif' },
  { name: 'Playfair Display', family: 'Playfair Display, serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Great Vibes', family: 'Great Vibes, cursive' },
];

const Certificates: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [fields, setFields] = useState<Field[]>([
    { id: 1, text: 'Recipient Name', x: 350, y: 280, fontSize: 48, fontWeight: 'bold', color: '#1F2937', fontFamily: 'Great Vibes, cursive', type: 'text' },
    { id: 2, text: 'For successfully completing the', x: 320, y: 350, fontSize: 20, fontWeight: 'normal', color: '#4B5563', fontFamily: 'Merriweather, serif', type: 'text' },
    { id: 3, text: 'Course Name', x: 400, y: 380, fontSize: 32, fontWeight: 'bold', color: '#1D4ED8', fontFamily: 'Playfair Display, serif', type: 'text' },
    { id: 4, text: new Date().toISOString().split('T')[0], x: 420, y: 430, fontSize: 20, fontWeight: 'normal', color: '#4B5563', fontFamily: 'Merriweather, serif', type: 'date' },
    { id: 5, text: 'University of Higher Learning', x: 300, y: 100, fontSize: 28, fontWeight: 'bold', color: '#374151', fontFamily: 'Merriweather, serif', type: 'text' },
    { id: 6, text: 'CERTIFICATE', x: 420, y: 40, fontSize: 52, fontWeight: 'bold', color: '#1F2937', fontFamily: 'Playfair Display, serif', type: 'text' },
    { id: 7, text: 'OF ACHIEVEMENT', x: 410, y: 150, fontSize: 24, fontWeight: 'normal', color: '#4B5563', fontFamily: 'Merriweather, serif', type: 'text' },
    
    // Single, centered signature block
    { id: 8, text: '', x: 380, y: 480, fontSize: 0, fontWeight: 'normal', color: '', fontFamily: '', type: 'signature', width: 200, height: 50 },
    { id: 10, text: 'Authorized Signature', x: 410, y: 540, fontSize: 16, fontWeight: 'bold', color: '#4B5563', fontFamily: 'Merriweather, serif', type: 'text' },
  ]);

  const handleDragStop = (id: number, e: any, data: any) => {
    setFields(fields.map(field => (field.id === id ? { ...field, x: data.x, y: data.y } : field)));
  };

  const handleTextChange = (id: number, newText: string) => {
    setFields(fields.map(field => (field.id === id ? { ...field, text: newText } : field)));
  };

  const handleFontSizeChange = (id: number, delta: number) => {
    setFields(fields.map(field => (field.id === id ? { ...field, fontSize: Math.max(8, field.fontSize + delta) } : field)));
  };

  const handleFontChange = (id: number, newFontFamily: string) => {
    setFields(fields.map(field => (field.id === id ? { ...field, fontFamily: newFontFamily } : field)));
  };
  
  const handleImageUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFields(fields.map(field => (field.id === id ? { ...field, text: dataUrl } : field)));
      };
      reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file (PNG, JPG).");
    }
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now(),
      text: 'New Field',
      x: 100,
      y: 100,
      fontSize: 20,
      fontWeight: 'normal',
      color: '#000000',
      fontFamily: 'Roboto, sans-serif',
      type: 'text',
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: number) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const downloadPdf = () => {
    const certificate = certificateRef.current;
    if (certificate) {
      const wasEditing = isEditing;
      setIsEditing(false);

      setTimeout(() => {
        html2canvas(certificate, { scale: 2, useCORS: true, backgroundColor: null })
          .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'px',
              format: [canvas.width, canvas.height],
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('certificate.pdf');
            
            if (wasEditing) {
                setIsEditing(true);
            }
          });
      }, 100);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Certificate Generator</h1>
          <p className="text-gray-600">Use the controls to edit the certificate. Click and drag fields in edit mode.</p>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6">
          
          {/* Certificate Preview (main area) */}
          <div className="w-full md:w-2/3">
            <div 
              id="certificate"
              ref={certificateRef} 
              className="relative w-full aspect-[1.5/1] bg-cover bg-center bg-no-repeat shadow-2xl overflow-hidden border"
              style={{ backgroundImage: "url('/certificate-template.jpg')" }}
            >
              {fields.map(field => (
                <Draggable
                  key={field.id}
                  position={{ x: field.x, y: field.y }}
                  onStop={(e, data) => handleDragStop(field.id, e, data)}
                  disabled={!isEditing}
                >
                  <div 
                    className="absolute"
                    style={{
                      width: field.type === 'signature' ? field.width : 'auto',
                      height: field.type === 'signature' ? field.height : 'auto',
                    }}
                  >
                    {(() => {
                        if (field.type === 'signature') {
                            return (
                                <div className={`relative w-full h-full ${isEditing ? 'border border-dashed border-blue-500 cursor-move' : ''}`}>
                                    {field.text ? (
                                        <img src={field.text} alt="Signature" className="w-full h-full object-contain" />
                                    ) : (
                                        isEditing && (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 bg-opacity-75">
                                                <span className="text-xs text-gray-500">Upload Signature</span>
                                            </div>
                                        )
                                    )}
                                    {isEditing && (
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => handleImageUpload(field.id, e)}
                                        />
                                    )}
                                </div>
                            );
                        }
                        
                        // Handler for text and date fields
                        if (isEditing) {
                            return (
                                <div className="p-2 border border-dashed border-blue-500 cursor-move hover:bg-blue-100 hover:bg-opacity-50">
                                    {field.type === 'date' ? (
                                        <input
                                            type="date"
                                            value={field.text}
                                            onChange={(e) => handleTextChange(field.id, e.target.value)}
                                            className="bg-transparent focus:outline-none focus:ring-0 border-none p-0"
                                            style={{ fontFamily: field.fontFamily, fontSize: `${field.fontSize}px`, fontWeight: field.fontWeight, color: field.color }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={field.text}
                                            onChange={(e) => handleTextChange(field.id, e.target.value)}
                                            className="bg-transparent focus:outline-none focus:ring-0 border-none p-0"
                                            style={{ fontFamily: field.fontFamily, fontSize: `${field.fontSize}px`, fontWeight: field.fontWeight, color: field.color, width: `${field.text.length + 3}ch`, minWidth: '50px' }}
                                        />
                                    )}
                                </div>
                            );
                        }
                        
                        return (
                             <span style={{ fontFamily: field.fontFamily, fontSize: `${field.fontSize}px`, fontWeight: field.fontWeight, color: field.color }}>
                                {field.text}
                            </span>
                        );
                    })()}
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
          
          {/* Controls Sidebar */}
          <div className="w-full md:w-1/3">
            <div className="sticky top-6">
              <div className="bg-white p-4 rounded-lg shadow-md border">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800">Editor Controls</h2>
                </div>
                
                <div className="flex space-x-2 mb-4">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      isEditing 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {isEditing ? <Save size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
                    {isEditing ? 'Finish Editing' : 'Edit Mode'}
                  </button>
                  <button 
                    onClick={downloadPdf}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-md"
                  >
                    <FileDown size={16} className="mr-2" />
                    Download
                  </button>
                </div>

                <button
                    onClick={addField}
                    className="w-full flex items-center justify-center px-4 py-2 mb-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-md font-medium transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Add New Field
                </button>
                
                {isEditing && (
                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-700">Field Properties</h3>
                        {fields.map(field => (
                            <div key={field.id} className="p-3 bg-gray-50 rounded-lg border space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800 truncate pr-2">
                                        {field.type === 'signature' ? `Signature Image ${field.id}` : field.text}
                                    </p>
                                    <button onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 p-1">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>

                                {field.type !== 'signature' && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Font Size</span>
                                            <div className="flex items-center">
                                                <button onClick={() => handleFontSizeChange(field.id, -2)} className="px-2 py-1 bg-gray-200 rounded-l text-xs">-</button>
                                                <span className="px-3 py-1 bg-white border-t border-b text-xs">{field.fontSize}px</span>
                                                <button onClick={() => handleFontSizeChange(field.id, 2)} className="px-2 py-1 bg-gray-200 rounded-r text-xs">+</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Font Family</span>
                                            <select
                                                value={field.fontFamily}
                                                onChange={(e) => handleFontChange(field.id, e.target.value)}
                                                className="text-xs border-gray-300 rounded-md w-1/2"
                                            >
                                                {googleFonts.map(font => (
                                                <option key={font.name} value={font.family}>
                                                    {font.name}
                                                </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Certificates;