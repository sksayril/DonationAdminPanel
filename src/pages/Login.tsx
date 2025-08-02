import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Remove auto-redirect - let user manually login each time

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      
      if (response.success) {
        // Login successful - navigate to dashboard
        console.log('Login successful, redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      } else {
        // Login failed
        setError(response.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <p className="text-xs text-gray-600 text-center mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-700 space-y-1">
            <div>Email: admin@example.com</div>
            <div>Password: admin123</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@example.com');
              setPassword('admin123');
            }}
            className="w-full mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 rounded transition-colors"
          >
            Use Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;