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
        <div className="flex flex-col items-center mb-8 border-b pb-4 print:border-b print:pb-2">
          <div className="flex items-center w-full justify-between mb-2">
            <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded print:border print:border-gray-400">
              {/* Logo Placeholder */}
              <span className="text-gray-400 text-xs">Logo</span>
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-800 uppercase">Institution Name</h1>
              <p className="text-gray-600 text-sm">123 Main Street, City, State, 123456</p>
              <p className="text-gray-600 text-sm">Contact: (123) 456-7890 | Email: info@institution.edu</p>
            </div>
            <div className="w-24 h-24"></div>
          </div>
          <h2 className="text-xl font-semibold text-blue-700 mt-2">Student Enrollment Form</h2>
        </div>

        {/* Form Start */}
        <form className="space-y-8 print:space-y-4" onSubmit={handleSubmit}>
          {/* Student Personal Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Student Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input type="text" className="form-input w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Date of Birth</label>
                  <input type="date" className="form-input w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Age</label>
                  <input type="number" className="form-input w-full border rounded p-2" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Gender</label>
                  <select className="form-select w-full border rounded p-2">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Nationality</label>
                  <input type="text" className="form-input w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Mother Tongue</label>
                  <input type="text" className="form-input w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select className="form-select w-full border rounded p-2">
                    <option value="">Select</option>
                    <option>General</option>
                    <option>SC</option>
                    <option>ST</option>
                    <option>OBC</option>
                    <option>EWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Religion</label>
                  <input type="text" className="form-input w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Blood Group</label>
                  <input type="text" className="form-input w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Aadhaar/ID Number</label>
                  <input type="text" className="form-input w-full border rounded p-2" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-32 h-40 border border-gray-400 flex flex-col items-center justify-center bg-gray-50 mb-2 relative overflow-hidden">
                  {studentPhoto ? (
                    <img src={studentPhoto} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">Passport Size Photo</span>
                  )}
                  <label className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white text-xs flex items-center justify-center py-1 cursor-pointer hover:bg-opacity-70">
                    <Upload size={12} className="mr-1" />
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, setStudentPhoto)} 
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Complete Address</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">City</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">State</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Pin Code</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Mobile Number</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Email ID</label>
                <input type="email" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Alternate Contact Number</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
            </div>
          </section>

          {/* Parent/Guardian Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Parent/Guardian Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Father */}
              <div>
                <label className="block text-sm font-medium">Father's Name</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Qualification</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Occupation</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Mobile Number</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Email</label>
                <input type="email" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Annual Income</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              {/* Mother */}
              <div>
                <label className="block text-sm font-medium">Mother's Name</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Qualification</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Occupation</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Mobile Number</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Email</label>
                <input type="email" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Annual Income</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              {/* Guardian (Optional) */}
              <div>
                <label className="block text-sm font-medium">Guardian's Name (Optional)</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Qualification</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Occupation</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Mobile Number</label>
                <input type="text" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Email</label>
                <input type="email" className="form-input w-full border rounded p-2" />
                <label className="block text-sm font-medium mt-2">Annual Income</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
            </div>
          </section>

          {/* Previous Academic Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Previous Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium">Last School/College</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Board/University</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Class/Year Completed</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Roll Number</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Percentage/Grade</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Transfer Certificate No.</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
            </div>
          </section>

          {/* Course/Class Enrollment Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Course/Class Enrollment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Academic Session</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Class/Course Name</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Admission Number</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Stream/Subjects</label>
                <input type="text" className="form-input w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Mode of Study</label>
                <select className="form-select w-full border rounded p-2">
                  <option value="">Select</option>
                  <option>Regular</option>
                  <option>Distance</option>
                </select>
              </div>
            </div>
          </section>

          {/* Documents Submitted Checklist */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-1">Documents Submitted Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" id="birth-cert" />
                <label htmlFor="birth-cert" className="text-sm">Birth Certificate</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" id="marksheet" />
                <label htmlFor="marksheet" className="text-sm">Previous Marksheet</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" id="tc" />
                <label htmlFor="tc" className="text-sm">Transfer Certificate</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" id="migration" />
                <label htmlFor="migration" className="text-sm">Migration Certificate</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" id="aadhaar" />
                <label htmlFor="aadhaar" className="text-sm">Aadhaar Card</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" id="photos" />
                <label htmlFor="photos" className="text-sm">Photos</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" id="caste" />
                <label htmlFor="caste" className="text-sm">Caste/Category Certificate</label>
              </div>
            </div>
          </section>

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