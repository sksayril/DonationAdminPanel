import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Marksheet: React.FC = () => {
  const [template, setTemplate] = useState('');
  const [formData, setFormData] = useState({
    studentName: 'MANISH',
    fatherName: 'Mr. JAI SINGH',
    year: 'CG/04/2925',
    enrollmentNo: 'Pc022',
    duration: '12 Months',
    grade: 'A',
  });

  useEffect(() => {
    fetch('/marksheet.html')
      .then(response => response.text())
      .then(data => setTemplate(data))
      .catch(error => console.error('Error loading marksheet template:', error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getProcessedHtml = () => {
    if (!template) return '';
    return template
      .replace('<strong>MANISH</strong>', `<strong>${formData.studentName}</strong>`)
      .replace('<strong>Mr. JAI SINGH</strong>', `<strong>${formData.fatherName}</strong>`)
      .replace('in the <strong>CG/04/2925</strong> year', `in the <strong>${formData.year}</strong> year`)
      .replace('Enroll no. <strong>Pc022</strong>', `Enroll no. <strong>${formData.enrollmentNo}</strong>`)
      .replace('is <strong>12 Months</strong>', `is <strong>${formData.duration}</strong>`)
      .replace('Grade <strong>A</strong> certificate issue', `Grade <strong>${formData.grade}</strong> certificate issue`);
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-4 p-4 h-full">
        <div className="lg:w-1/3 bg-white p-6 rounded-lg shadow-md overflow-y-auto" style={{ height: 'calc(100vh - 100px)' }}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Marksheet</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <input type="text" name="studentName" value={formData.studentName} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year/Date</label>
              <input type="text" name="year" value={formData.year} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enrollment No.</label>
              <input type="text" name="enrollmentNo" value={formData.enrollmentNo} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <input type="text" name="grade" value={formData.grade} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </form>
        </div>
        <div className="lg:w-2/3 h-full">
          <iframe
            srcDoc={getProcessedHtml()}
            title="Marksheet Preview"
            className="w-full h-full border-0 bg-white rounded-lg shadow-md"
            style={{ height: 'calc(100vh - 100px)' }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Marksheet;
