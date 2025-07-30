import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Upload } from 'lucide-react';

const Enrolment: React.FC = () => {
  // State for uploaded images
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [studentSignature, setStudentSignature] = useState<string | null>(null);
  const [parentSignature, setParentSignature] = useState<string | null>(null);
  
  // Handle image uploads
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImageFunction: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFunction(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would collect form data and send it to your backend
    alert('Form submitted successfully!');
    // You can replace the alert with your actual submission logic
  };
  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 border print:border-0 print:shadow-none print:p-0 print:bg-white">
        {/* Institution Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide">
            M.H ACADEMY
          </h1>
          <p className="text-sm text-gray-600 mt-2">ENROLLMENT FORM</p>
        </div>

        {/* Institution Details */}
        <div className="space-y-6 mb-8">
          <div className="flex items-start">
            <span className="text-lg font-medium text-gray-700 w-32 inline-block">Office Address:</span>
            <div className="flex-1 border-b border-gray-400 pb-1">
              <input 
                type="text" 
                className="w-full bg-transparent focus:outline-none text-gray-700"
                placeholder="28, Pocket 1st, Sector 24, Rohini, New Delhi-110085"
              />
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-lg font-medium text-gray-700 w-32 inline-block">Mobile No.:</span>
            <div className="flex-1 border-b border-gray-400 pb-1">
              <input 
                type="text" 
                className="w-full bg-transparent focus:outline-none text-gray-700"
                placeholder="9958610292"
              />
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-lg font-medium text-gray-700 w-32 inline-block">Email id:</span>
            <div className="flex-1 border-b border-gray-400 pb-1">
              <input 
                type="email" 
                className="w-full bg-transparent focus:outline-none text-gray-700"
                placeholder="mhacademy.online@gmail.com & Sonu21sharma1962@gmail.com"
              />
            </div>
          </div>
        </div>

        {/* Form Start */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Main Form Content */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Student Full Name:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700 font-medium"
                  placeholder="Enter student name"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Father's Name:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  placeholder="Enter father's name"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Date of Birth:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="date" 
                  className="bg-transparent focus:outline-none text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-20 inline-block">Gender:</span>
              <div className="w-32 border-b border-gray-400 pb-1 mr-4">
                <select className="bg-transparent focus:outline-none text-gray-700 w-full">
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <span className="text-lg font-medium text-gray-700 w-20 inline-block ml-4">Age:</span>
              <div className="w-20 border-b border-gray-400 pb-1">
                <input 
                  type="number" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Complete Address:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  placeholder="Enter complete address"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Mobile Number:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Course/Program:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  placeholder="Enter course/program name"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Academic Session:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  placeholder="e.g., 2024-2025"
                />
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-700 w-40 inline-block">Enrollment Fee Rs.:</span>
              <div className="w-32 border-b border-gray-400 pb-1 mr-4">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  placeholder="5000/-"
                />
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-lg font-medium text-gray-700 w-20 inline-block">Remarks:</span>
              <div className="flex-1 border-b border-gray-400 pb-1">
                <input 
                  type="text" 
                  className="w-full bg-transparent focus:outline-none text-gray-700"
                  placeholder="Any additional remarks"
                />
              </div>
            </div>
          </div>

          {/* Declaration Section */}
          <section className="mt-8 print:mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Declaration</h3>
            <p className="text-sm mb-4">I hereby declare that the information provided above is true to the best of my knowledge and belief. I shall abide by the rules and regulations of the institution.</p>
            <div className="flex flex-col md:flex-row justify-between mt-6 print:mt-2">
              <div className="flex flex-col items-center">
                <span className="block text-sm font-medium">Student Signature</span>
                <div className="w-40 h-24 border border-gray-400 mt-2 relative flex items-center justify-center">
                  {studentSignature ? (
                    <img src={studentSignature} alt="Student Signature" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full border-b border-gray-400 absolute bottom-6"></div>
                  )}
                  <label className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-xs flex items-center justify-center py-1 cursor-pointer hover:bg-opacity-70">
                    <Upload size={12} className="mr-1" />
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, setStudentSignature)} 
                    />
                  </label>
                </div>
               </div>
              <div className="flex flex-col items-center mt-6 md:mt-0">
                <span className="block text-sm font-medium">Parent/Guardian Signature</span>
                <div className="w-40 h-24 border border-gray-400 mt-2 relative flex items-center justify-center">
                  {parentSignature ? (
                    <img src={parentSignature} alt="Parent Signature" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full border-b border-gray-400 absolute bottom-6"></div>
                  )}
                  <label className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-xs flex items-center justify-center py-1 cursor-pointer hover:bg-opacity-70">
                    <Upload size={12} className="mr-1" />
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, setParentSignature)} 
                    />
                  </label>
                </div>
                </div>
            </div>
          </section>

          {/* For Office Use Only */}
          <section className="mt-8 print:mt-4 border-t pt-4 print:border-t print:pt-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">For Office Use Only</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium">Admission No.</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Enrollment Date</label>
                <input type="date" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Class/Course Allotted</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Roll No.</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Verified By</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
            </div>
          </section>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-md shadow-sm transition duration-150 ease-in-out flex items-center"
            >
              Submit Enrollment Form
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Enrolment;