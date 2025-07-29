import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../../components/Layout';

const StudentsLayout: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Students Management</h1>
        <Outlet />
      </div>
    </Layout>
  );
};

export default StudentsLayout;