import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Society from './pages/Society';
import Payment from './pages/Payment';
import Loan from './pages/Loan';
import Students from './pages/Students';
import StudentsLayout from './pages/Students/StudentsLayout';
import GetAllStudents from './pages/Students/GetAllStudents';
import KYCRequest from './pages/Students/KYCRequest';
import Batch from './pages/Students/Batch';
import Courses from './pages/Students/Courses';
// import Fees from './pages/Students/Fees';
// import Revenue from './pages/Students/Revenue';
import Certificates from './pages/Certificates';
import Enrolment from './pages/Enrolment';
import Marksheet from './pages/Marksheet';

// Loading component for auth initialization
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// App content component that uses auth context
const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while auth is being initialized
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      <Route 
        path="/signup" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
        } 
      />
      
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
        path="/payment" 
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/loan" 
        element={
          <ProtectedRoute>
            <Loan />
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
        {/* <Route path="fees" element={<Fees />} />
        <Route path="revenue" element={<Revenue />} /> */}
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
      
      {/* Default route - redirect based on auth status */}
      <Route 
        path="/" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
      
      {/* Catch all route - redirect to appropriate page */}
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
