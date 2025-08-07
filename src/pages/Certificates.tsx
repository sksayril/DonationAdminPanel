import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Certificates: React.FC = () => {
  const [template, setTemplate] = useState('');
  const [formData, setFormData] = useState({
    studentName: 'MANOJ',
    fatherName: 'Mr. JAI SINGH',
    motherName: 'KELA',
    courseName: 'CERTIFICATE IN INFORMATION TECHNOLOGY',
    grade: 'A',
    issueDate: '03/04/2025',
    enrollmentNo: 'Petj027',
  });

  useEffect(() => {
    fetch('/certificate.html')
      .then(response => response.text())
      .then(data => setTemplate(data))
      .catch(error => console.error('Error loading certificate template:', error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getProcessedHtml = () => {
    if (!template) return '';
    return template
      .replace('<span class="name-field">MANOJ</span>', `<span class="name-field">${formData.studentName}</span>`)
      .replace('<span class="name-field">Mr. JAI SINGH</span>', `<span class="name-field">${formData.fatherName}</span>`)
      .replace('<span class="name-field">KELA</span>', `<span class="name-field">${formData.motherName}</span>`)
      .replace('<strong>CERTIFICATE IN INFORMATION TECHNOLOGY</strong>', `<strong>${formData.courseName}</strong>`)
      .replace('Grade <span class="grade">A</span>', `Grade <span class="grade">${formData.grade}</span>`)
      .replace('year <span class="date">03/04/2025</span>', `year <span class="date">${formData.issueDate}</span>`)
      .replace('And Enroll No. <span class="enrollment">Petj027</span>', `And Enroll No. <span class="enrollment">${formData.enrollmentNo}</span>`);
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-4 p-4 h-full">
        <div className="lg:w-1/3 bg-white p-6 rounded-lg shadow-md overflow-y-auto" style={{ height: 'calc(100vh - 100px)' }}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Certificate</h2>
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
              <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Name</label>
              <input type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <input type="text" name="grade" value={formData.grade} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Date</label>
              <input type="text" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enrollment No.</label>
              <input type="text" name="enrollmentNo" value={formData.enrollmentNo} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </form>
        </div>
        <div className="lg:w-2/3 h-full">
          <iframe
            srcDoc={getProcessedHtml()}
            title="Certificate Preview"
            className="w-full h-full border-0 bg-white rounded-lg shadow-md"
            style={{ height: 'calc(100vh - 100px)' }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Certificates;
