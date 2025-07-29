import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Society from './pages/Society';
import StudentsLayout from './pages/Students/StudentsLayout';
import GetAllStudents from './pages/Students/GetAllStudents';
import KYCRequest from './pages/Students/KYCRequest';
import Batch from './pages/Students/Batch';
import Courses from './pages/Students/Courses';
import Fees from './pages/Students/Fees';
import Revenue from './pages/Students/Revenue';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/society" element={<Society />} />
        <Route path="/students" element={<StudentsLayout />}>
          <Route index element={<Navigate to="all" replace />} />
          <Route path="all" element={<GetAllStudents />} />
          <Route path="kyc" element={<KYCRequest />} />
          <Route path="batch" element={<Batch />} />
          <Route path="courses" element={<Courses />} />
          <Route path="fees" element={<Fees />} />
          <Route path="revenue" element={<Revenue />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;