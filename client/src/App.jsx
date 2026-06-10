import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

import CreateCapsule from './pages/CreateCapsule';
import Inbox from './pages/Inbox';
import ViewCapsule from './pages/ViewCapsule';


// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300">
        {isAuthenticated && <Navbar />}
        <main className={isAuthenticated ? "container mx-auto px-4 pt-8 pb-24 md:pb-8" : ""}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/verify-email/:token" element={!isAuthenticated ? <VerifyEmail /> : <Navigate to="/dashboard" />} />

            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/capsule/new" element={<CreateCapsule />} />
              <Route path="/capsule/:id" element={<ViewCapsule />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
