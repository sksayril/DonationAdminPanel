import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const [studentsOpen, setStudentsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isStudentsActive = () => location.pathname.startsWith('/students');

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
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

          <div>
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isStudentsActive() 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                Students
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
                  to="/students/all"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students/all' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Get All Students
                </Link>
                
                <Link
                  to="/students/kyc"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students/kyc' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  KYC Request
                </Link>
                
                <Link
                  to="/students/batch"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students/batch' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Batch
                </Link>
                
                <Link
                  to="/students/courses"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students/courses' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Courses
                </Link>
                
                <Link
                  to="/students/fees"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students/fees' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Fees
                </Link>
                
                <Link
                  to="/students/revenue"
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/students/revenue' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  My Revenue
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;