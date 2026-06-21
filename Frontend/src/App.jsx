/* eslint-disable react/prop-types */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ConfirmDeleteAccount from "./pages/ConfirmDeleteAccount";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import PublishJob from "./pages/PublishJob";
import Applications from "./pages/Applications";
import NotFound from "./components/common/NotFound";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Profile Complete Check Route
function ProfileCompleteRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}

// Profile Redirect Component
function ProfileRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user && user.username) {
    return <Navigate to={`/profile/${user.username}`} replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function AppContent() {
  const { user } = useAuth();
  return (
    <div className="app-shell flex flex-col">
      <NavBar />
      <main className={`grow ${user ? "pb-20 md:pb-0" : ""}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/confirm-delete" element={<ConfirmDeleteAccount />} />

          {/* Protected Routes - Require Auth */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Require Auth + Profile Complete */}
          <Route
            path="/dashboard"
            element={
              <ProfileCompleteRoute>
                <Dashboard />
              </ProfileCompleteRoute>
            }
          />

          <Route
            path="/discover"
            element={
              <ProfileCompleteRoute>
                <Discover />
              </ProfileCompleteRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProfileCompleteRoute>
                <ProfileRedirect />
              </ProfileCompleteRoute>
            }
          />

          <Route
            path="/profile/:usernameOrId"
            element={
              <ProfileCompleteRoute>
                <Profile />
              </ProfileCompleteRoute>
            }
          />

          <Route
            path="/publish-job"
            element={
              <ProfileCompleteRoute>
                <PublishJob />
              </ProfileCompleteRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <ProfileCompleteRoute>
                <Applications />
              </ProfileCompleteRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
