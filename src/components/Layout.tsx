import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block fixed md:relative inset-0 z-20 md:z-0 bg-black bg-opacity-50 md:bg-opacity-0
      `}>
        <div className="w-3/4 md:w-64 h-full bg-white shadow-lg md:shadow-none">
          <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;