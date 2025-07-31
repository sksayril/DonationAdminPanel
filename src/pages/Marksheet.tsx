import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { Award, Edit3, Save, FileDown, Plus, Trash2 } from 'lucide-react';
import Draggable from 'react-draggable';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Simplified interface for standalone fields
interface StandaloneField {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  fontFamily: string;
}

// New interface for table row data
interface TableRow {
    id: number | string;
    subject: string;
    marks: string;
    total: string;
    grade: string;
}

const googleFonts = [
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Merriweather', family: 'Merriweather, serif' },
  { name: 'Playfair Display', family: 'Playfair Display, serif' },
];

const Marksheet: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const marksheetRef = useRef<HTMLDivElement>(null);

  // State for standalone, individually draggable fields
  const [standaloneFields, setStandaloneFields] = useState<StandaloneField[]>([
    { id: 1, text: 'Official Marksheet', x: 350, y: 50, fontSize: 40, fontWeight: 'bold', color: '#1F2937', fontFamily: 'Playfair Display, serif' },
    { id: 2, text: 'University of Higher Learning', x: 320, y: 100, fontSize: 24, fontWeight: 'normal', color: '#374151', fontFamily: 'Merriweather, serif' },
    { id: 3, text: 'Student Name:', x: 100, y: 180, fontSize: 18, fontWeight: 'bold', color: '#1F2937', fontFamily: 'Roboto, sans-serif' },
    { id: 4, text: 'John Doe', x: 250, y: 180, fontSize: 18, fontWeight: 'normal', color: '#1F2937', fontFamily: 'Roboto, sans-serif' },
    { id: 25, text: 'Result: PASS', x: 100, y: 520, fontSize: 20, fontWeight: 'bold', color: 'green', fontFamily: 'Roboto, sans-serif' },
  ]);

  // New state for the entire table's data
  const [tableRows, setTableRows] = useState<TableRow[]>([
    { id: 'header', subject: 'Subject', marks: 'Marks', total: 'Total', grade: 'Grade' },
    { id: 1, subject: 'Data Structures', marks: '85', total: '100', grade: 'A+' },
    { id: 2, subject: 'Algorithms', marks: '92', total: '100', grade: 'A+' },
    { id: 3, subject: 'Database Systems', marks: '78', total: '100', grade: 'B+' },
  ]);
  
  // New state for the position of the entire table block
  const [tablePosition, setTablePosition] = useState({ x: 100, y: 250 });

  const handleStandaloneDragStop = (id: number, data: { x: number; y: number }) => {
    setStandaloneFields(fields => fields.map(field => (field.id === id ? { ...field, x: data.x, y: data.y } : field)));
  };

  const handleStandaloneFieldChange = (id: number, key: keyof StandaloneField, value: string | number) => {
    setStandaloneFields(fields => fields.map(field => (field.id === id ? { ...field, [key]: value } : field)));
  };

  const handleTableChange = (rowId: number | string, key: keyof TableRow, value: string) => {
    setTableRows(rows => rows.map(row => (row.id === rowId ? { ...row, [key]: value } : row)));
  };
  
  const addTableRow = () => {
    const newId = Date.now(); // Unique ID for the new row
    setTableRows(rows => [...rows, { id: newId, subject: 'New Subject', marks: '0', total: '100', grade: 'N/A' }]);
  };

  const removeTableRow = (rowId: number | string) => {
    setTableRows(rows => rows.filter(row => row.id !== rowId));
  };


  const downloadPdf = () => {
    const marksheetNode = marksheetRef.current;
    if (!marksheetNode) return;

    const wasEditing = isEditing;
    // Hide editing elements for a clean capture
    setIsEditing(false);

    // A short delay to allow the DOM to re-render without editing artifacts
    setTimeout(() => {
      html2canvas(marksheetNode, {
        scale: 3, // Higher scale for better resolution
        useCORS: true, // Important for external images/fonts
        allowTaint: true,
        logging: false,
        width: marksheetNode.scrollWidth,
        height: marksheetNode.scrollHeight,
      }).then((canvas) => {
        // Get the image data from the canvas
        const imgData = canvas.toDataURL('image/png', 1.0); // Use max quality PNG

        // Create a PDF with the exact dimensions of the captured canvas
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height],
          hotfixes: ['px_scaling'], // A jsPDF hotfix for better pixel scaling
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('marksheet.pdf');
        
        // Restore editing state if it was previously active
        if (wasEditing) {
          setIsEditing(true);
        }
      });
    }, 200); // Increased timeout for stability
  };
  
  const getTableInputStyle = (isHeader: boolean) => ({
      fontFamily: isHeader ? 'Merriweather, serif' : 'Roboto, sans-serif',
      fontSize: '16px',
      fontWeight: isHeader ? 'bold' : 'normal',
      color: isHeader ? '#111827' : '#374151',
  } as React.CSSProperties);

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Marksheet Generator</h1>
          <p className="text-gray-600">Drag the table block and individual fields into position.</p>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6">
          
          <div className="w-full md:w-2/3">
            <div id="marksheet" ref={marksheetRef} className="relative w-full shadow-2xl">
              <img src="/marksheet-template.jpg" alt="Marksheet Background" className="w-full h-auto" />
              
              {/* Render Standalone Fields */}
              {standaloneFields.map(field => (
                <Draggable key={field.id} position={{ x: field.x, y: field.y }} onStop={(e, data) => handleStandaloneDragStop(field.id, data)} disabled={!isEditing} bounds="parent">
                  <div className="absolute" style={{ top: 0, left: 0 }}>
                    <div className={`${isEditing ? 'p-1 border border-dashed border-red-500 cursor-move' : 'p-1'}`}>
                      {isEditing ? (
                        <input type="text" value={field.text} onChange={(e) => handleStandaloneFieldChange(field.id, 'text', e.target.value)} className="bg-transparent focus:outline-none" style={{...field, width: `${field.text.length + 2}ch`}}/>
                      ) : (
                        <span style={field}>{field.text}</span>
                      )}
                    </div>
                  </div>
                </Draggable>
              ))}

              {/* Render Single Draggable Table */}
              <Draggable position={tablePosition} onStop={(e, data) => setTablePosition({ x: data.x, y: data.y })} disabled={!isEditing} bounds="parent" handle=".table-drag-handle">
                <div className="absolute" style={{ top: 0, left: 0 }}>
                  <div className={`table-container p-2 ${isEditing ? 'border border-dashed border-blue-500' : ''}`}>
                    <div className={`table-drag-handle ${isEditing ? 'cursor-move' : ''}`}>
                      <div style={{ display: 'grid', gridTemplateColumns: '300px 100px 100px 100px auto', gap: '10px 20px', alignItems: 'center' }}>
                        {tableRows.map((row) => (
                          <React.Fragment key={row.id}>
                            {(Object.keys(row) as (keyof TableRow)[]).map(key => {
                              if (key === 'id') return null;
                              const isHeader = row.id === 'header';
                              const style = getTableInputStyle(isHeader);
                              return (
                                <div key={key}>
                                  {isEditing ? (
                                    <input type="text" value={row[key]} onChange={(e) => handleTableChange(row.id, key, e.target.value)} className="bg-transparent focus:outline-none w-full" style={style} />
                                  ) : (
                                    <span style={style}>{row[key]}</span>
                                  )}
                                </div>
                              );
                            })}
                            {/* Remove button cell */}
                            <div>
                                {isEditing && row.id !== 'header' && (
                                    <button onClick={() => removeTableRow(row.id)} className="text-red-500 hover:text-red-700 p-1">
                                        <Trash2 size={16}/>
                                    </button>
                                )}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Draggable>
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="sticky top-6">
              <div className="bg-white p-4 rounded-lg shadow-md border">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800">Editor Controls</h2>
                </div>
                
                <div className="flex space-x-2 mb-4">
                    <button onClick={() => setIsEditing(!isEditing)} className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 ${ isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}>
                        {isEditing ? <Save size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
                        {isEditing ? 'Finish Editing' : 'Edit Mode'}
                    </button>
                    <button onClick={downloadPdf} className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                        <FileDown size={16} className="mr-2" />
                        Download
                    </button>
                </div>
                
                {isEditing && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Table Actions</h3>
                            <button onClick={addTableRow} className="w-full flex items-center justify-center px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-md font-medium">
                                <Plus size={16} className="mr-2" />
                                Add Subject Row
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold text-gray-700">Standalone Fields</h3>
                            {standaloneFields.map(field => (
                                <div key={field.id} className="p-3 bg-gray-50 rounded-lg border space-y-2">
                                    <p className="text-sm font-medium text-gray-800 truncate pr-2">{field.text}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Font Size</span>
                                        <div className="flex items-center">
                                            <button onClick={() => handleStandaloneFieldChange(field.id, 'fontSize', field.fontSize - 1)} className="px-2 py-1 bg-gray-200 rounded-l text-xs">-</button>
                                            <span className="px-3 py-1 bg-white border-t border-b text-xs">{field.fontSize}px</span>
                                            <button onClick={() => handleStandaloneFieldChange(field.id, 'fontSize', field.fontSize + 1)} className="px-2 py-1 bg-gray-200 rounded-r text-xs">+</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Font Family</span>
                                        <select value={field.fontFamily} onChange={(e) => handleStandaloneFieldChange(field.id, 'fontFamily', e.target.value)} className="text-xs border-gray-300 rounded-md w-1/2">
                                            {googleFonts.map(font => ( <option key={font.name} value={font.family}>{font.name}</option>))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
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

export default Marksheet;
