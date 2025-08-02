import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ChevronDown, 
  ChevronRight,
  UserCheck,
  CreditCard,
  BookOpen,
  GraduationCap,
  DollarSign,
  Award,
  ClipboardList,
  FileText, // Added for Marksheet
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false); // State for new dropdown
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, adminData } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isAcademicsActive = () => location.pathname.startsWith('/certificate') || location.pathname.startsWith('/marksheet');

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        {adminData && (
          <div className="mt-2 text-sm text-gray-600">
            Welcome, {adminData.firstName} {adminData.lastName}
          </div>
        )}
      </div>
      
      <nav className="mt-4 flex-1 overflow-y-auto">
        <div className="px-4 space-y-1">
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard') 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          <Link
            to="/society"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/society') 
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-5 h-5 mr-3" />
            Society
          </Link>

          {/* Students Management Dropdown */}
          <div>
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                location.pathname.startsWith('/students-management') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                Students Management
              </div>
              {studentsOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {studentsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  to="/students"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Students
                </Link>
                <Link
                  to="/students-management/all"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students-management/all' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  All Students
                </Link>
                <Link
                  to="/students-management/kyc"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students-management/kyc' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  KYC Request
                </Link>
                <Link
                  to="/students-management/batch"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students-management/batch' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Batch
                </Link>
                <Link
                  to="/students-management/courses"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students-management/courses' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Courses
                </Link>
                <Link
                  to="/students-management/fees"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students-management/fees' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Fees
                </Link>
                <Link
                  to="/students-management/revenue"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students-management/revenue' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Revenue
                </Link>
              </div>
            )}
          </div>

          {/* Academics Dropdown (Certificate & Marksheet) */}
          <div>
            <button
              onClick={() => setAcademicsOpen(!academicsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isAcademicsActive() 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-3" />
                Certificates
              </div>
              {academicsOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {academicsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  to="/certificate"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/certificate' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Certificate
                </Link>
                
                <Link
                  to="/marksheet"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/marksheet' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Marksheet
                </Link>
              </div>
            )}
          </div>

          {/* Enrolment Section */}
          <Link
            to="/enrolment"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/enrolment')
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-5 h-5 mr-3" />
            Enrolment
          </Link>
        </div>
      </nav>

      {/* Logout button at the bottom */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
