import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import EmergencyBanner from './components/EmergencyBanner';
import Toast from './components/Toast';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import Appointments from './pages/Appointments';
import Emergency from './pages/Emergency';
import MedicalHistory from './pages/MedicalHistory';
import Patients from './pages/Patients';
import HospitalDashboard from './pages/HospitalDashboard';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }
  
  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="app">
      <EmergencyBanner />
      <Navbar />
      <main>
        {children}
      </main>
      <Toast />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
            
            {/* Patient Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/symptoms" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SymptomChecker />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Appointments />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emergency" 
              element={
                <AppLayout>
                  <Emergency />
                </AppLayout>
              } 
            />
            <Route 
              path="/medical-history" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MedicalHistory />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Doctor Routes */}
            <Route 
              path="/patients" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Patients />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/hospital-dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HospitalDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
