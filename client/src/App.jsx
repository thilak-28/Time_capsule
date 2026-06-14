import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateCapsule from './pages/CreateCapsule';
import CreateCSReminder from './pages/CreateCSReminder';
import Inbox from './pages/Inbox';
import ViewCapsule from './pages/ViewCapsule';
import ViewCSCapsule from './pages/ViewCSCapsule';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserView from './pages/AdminUserView';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAdmin = user?.isAdmin;

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300">
        {isAuthenticated && !isAdmin && <Navbar />}
        <main className={isAuthenticated && !isAdmin ? "container mx-auto px-4 pt-8 pb-24 md:pb-8" : ""}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
              !isAuthenticated ? <Login /> :
              isAdmin ? <Navigate to="/admin" /> :
              <Navigate to="/dashboard" />
            } />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />

            {/* Admin Routes */}
            <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/users/:id" element={isAuthenticated && isAdmin ? <AdminUserView /> : <Navigate to="/login" />} />

            {/* Regular User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/capsule/new" element={<CreateCapsule />} />
              <Route path="/capsule/:id" element={<ViewCapsule />} />
              <Route path="/cs-capsule/new" element={<CreateCSReminder />} />
              <Route path="/cs-capsule/:id" element={<ViewCSCapsule />} />
              <Route path="/inbox" element={<Inbox />} />
            </Route>

            <Route path="*" element={<Navigate to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'} />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
