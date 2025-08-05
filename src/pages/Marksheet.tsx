import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Plus, FileText, User, BookOpen, Award, X, Save, RefreshCw, Search, Filter } from 'lucide-react';

interface Marksheet {
  id?: string;
  studentId: string;
  courseId: string;
  marks: number;
  grade: string;
  issuedDate?: string;
  issuedBy?: string;
  studentName?: string;
  courseName?: string;
}

interface MarksheetFormData {
  studentId: string;
  courseId: string;
  marks: number;
  grade: string;
}

const Marksheet: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MarksheetFormData>({
    studentId: '',
    courseId: '',
    marks: 0,
    grade: ''
  });

  // Grade options
  const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'marks' ? parseInt(value) || 0 : value
    }));
  };

  const calculateGrade = (marks: number): string => {
    if (marks >= 95) return 'A+';
    if (marks >= 90) return 'A';
    if (marks >= 85) return 'A-';
    if (marks >= 80) return 'B+';
    if (marks >= 75) return 'B';
    if (marks >= 70) return 'B-';
    if (marks >= 65) return 'C+';
    if (marks >= 60) return 'C';
    if (marks >= 55) return 'C-';
    if (marks >= 50) return 'D';
    return 'F';
  };

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const marks = parseInt(e.target.value) || 0;
    const grade = calculateGrade(marks);
    setFormData(prev => ({
      ...prev,
      marks,
      grade
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setResponseMessage({
          type: 'error',
          message: 'Authentication token not found. Please login again.'
        });
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Submitting marksheet data:', formData);

      const response = await fetch('http://localhost:3100/api/admin/marksheets', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResponseMessage({
          type: 'success',
          message: data.message || 'Marksheet created successfully!'
        });
        
        // Reset form and close modal after success
        setTimeout(() => {
          setShowForm(false);
          setFormData({
            studentId: '',
            courseId: '',
            marks: 0,
            grade: ''
          });
        }, 2000);
      } else {
        setResponseMessage({
          type: 'error',
          message: data.message || data.error || 'Failed to create marksheet'
        });
      }
    } catch (error) {
      console.error('Error creating marksheet:', error);
      setResponseMessage({
        type: 'error',
        message: 'Network error: Unable to connect to the server. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setResponseMessage(null);
    setFormData({
      studentId: '',
      courseId: '',
      marks: 0,
      grade: ''
    });
  };





  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Marksheet Management</h1>
            <p className="text-gray-600">Create and manage student marksheets</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Marksheet
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Marksheet</h3>
          <p className="text-gray-500 mb-6">Use the button above to create a new marksheet for a student.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Marksheet
          </button>
        </div>

        {/* Marksheet Creation Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">Create Marksheet</h3>
                  <button 
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {responseMessage && (
                <div className={`p-4 m-4 rounded ${responseMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {responseMessage.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter student ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course ID *</label>
                    <input
                      type="text"
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter course ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Marks (%) *
                    </label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleMarksChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="85"
                      min="0"
                      max="100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Grade</option>
                      {gradeOptions.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create Marksheet
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marksheet;
