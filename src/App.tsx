
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Society from './pages/Society';
import Students from './pages/Students';
import StudentsLayout from './pages/Students/StudentsLayout';
import GetAllStudents from './pages/Students/GetAllStudents';
import KYCRequest from './pages/Students/KYCRequest';
import Batch from './pages/Students/Batch';
import Courses from './pages/Students/Courses';
import Fees from './pages/Students/Fees';
import Revenue from './pages/Students/Revenue';
import Certificates from './pages/Certificates';
import Enrolment from './pages/Enrolment';
import Marksheet from './pages/Marksheet';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/society" 
            element={
              <ProtectedRoute>
                <Society />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students" 
            element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students-management" 
            element={
              <ProtectedRoute>
                <StudentsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<GetAllStudents />} />
            <Route path="kyc" element={<KYCRequest />} />
            <Route path="batch" element={<Batch />} />
            <Route path="courses" element={<Courses />} />
            <Route path="fees" element={<Fees />} />
            <Route path="revenue" element={<Revenue />} />
          </Route>
          <Route 
            path="/certificate" 
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marksheet" 
            element={
              <ProtectedRoute>
                <Marksheet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/enrolment" 
            element={
              <ProtectedRoute>
                <Enrolment />
              </ProtectedRoute>
            } 
          />
          
          {/* Default route - always redirect to login first */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
