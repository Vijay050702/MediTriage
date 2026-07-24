import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { authAPI } from '../api';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [loginRole, setLoginRole] = useState('patient');
  
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: ''
  });

  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    otp: ''
  });

  useEffect(() => {
    setEmailForm({ email: '', password: '' });
    setPhoneForm({ phone: '', otp: '' });
    setIsOtpSent(false);
    setDemoOtp('');
  }, [activeTab]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.password) {
      showToast('Please enter email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with:', emailForm.email);
      const response = await authAPI.login({ email: emailForm.email, password: emailForm.password, role: loginRole });
      console.log('Login response:', response);
      login(response.user);
      showToast(`Welcome back, ${response.user.name}!`, 'success');
      navigate(response.user.role === 'doctor' || response.user.role === 'driver' ? '/patients' : '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneForm.phone) {
      showToast('Please enter phone number', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.sendOtp(phoneForm.phone);
      setIsOtpSent(true);
      if (response.demo_otp) {
        setDemoOtp(response.demo_otp);
      }
      showToast('OTP sent to your phone!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!phoneForm.otp || phoneForm.otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyOtp(phoneForm.phone, phoneForm.otp, loginRole);
      login(response.user);
      showToast(`Welcome back, ${response.user.name}!`, 'success');
      navigate(response.user.role === 'doctor' || response.user.role === 'driver' ? '/patients' : '/dashboard');
    } catch (error) {
      showToast(error.message || 'OTP verification failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: 450 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <User size={48} color="#0D9488" />
            <h1 style={{ marginTop: 16, fontSize: '1.75rem' }}>Sign In</h1>
            <p style={{ color: '#64748B' }}>Welcome back! Please sign in to continue</p>
          </div>

          <div style={{ display: 'flex', gap: 8, margin: '0 0 24px 0', flexWrap: 'wrap' }}>
            <button 
              type="button"
              className={`btn ${loginRole === 'patient' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, minWidth: 70, padding: '8px', fontSize: '0.875rem' }}
              onClick={() => setLoginRole('patient')}
            >Patient</button>
            <button 
              type="button"
              className={`btn ${loginRole === 'doctor' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, minWidth: 70, padding: '8px', fontSize: '0.875rem' }}
              onClick={() => setLoginRole('doctor')}
            >Doctor</button>
            <button 
              type="button"
              className={`btn ${loginRole === 'driver' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, minWidth: 70, padding: '8px', fontSize: '0.875rem' }}
              onClick={() => setLoginRole('driver')}
            >Driver</button>
            <button 
              type="button"
              className={`btn ${loginRole === 'admin' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, minWidth: 70, padding: '8px', fontSize: '0.875rem' }}
              onClick={() => setLoginRole('admin')}
            >Admin</button>
          </div>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <Mail size={16} style={{ marginRight: 6 }} />
              Email
            </button>
            <button 
              className={`tab ${activeTab === 'phone' ? 'active' : ''}`}
              onClick={() => setActiveTab('phone')}
            >
              <Phone size={16} style={{ marginRight: 6 }} />
              Phone
            </button>
          </div>

          {activeTab === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    placeholder="Enter your password"
                    style={{ paddingRight: 40 }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me
                </label>
                <button type="button" onClick={() => showToast('Password reset feature coming soon!', 'info')} style={{ color: '#0D9488', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Forgot password?</button>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              {!isOtpSent ? (
                <>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={phoneForm.phone}
                      onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                      placeholder="+91-98765-00000"
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div className="alert alert-info">
                    OTP has been sent to your phone.{demoOtp && <> Use <strong>{demoOtp}</strong> for demo.</>}
                  </div>
                  <div className="input-group">
                    <label>Enter OTP</label>
                    <input 
                      type="text" 
                      value={phoneForm.otp}
                      onChange={(e) => setPhoneForm({ ...phoneForm, otp: e.target.value })}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: 12 }}
                    onClick={() => { setIsOtpSent(false); setPhoneForm({ ...phoneForm, otp: '' }); }}
                  >
                    Change Phone Number
                  </button>
                </>
              )}
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748B' }}>
            Don't have an account? <Link to={`/signup?role=${loginRole}`} style={{ color: '#0D9488' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
