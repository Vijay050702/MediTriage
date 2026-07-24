import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Stethoscope, Car, Heart, ArrowLeft, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { authAPI } from '../api';
import { specializations, bloodTypes } from '../data/conditions';

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const role = searchParams.get('role') || 'patient';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    specialization: '',
    registrationNumber: '',
    yearsOfExperience: '',
    hospitalName: '',
    consultationFee: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleModel: '',
    operatingCity: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      bloodType: '',
      allergies: '',
      medicalHistory: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      specialization: '',
      registrationNumber: '',
      yearsOfExperience: '',
      hospitalName: '',
      consultationFee: '',
      licenseNumber: '',
      licenseExpiry: '',
      vehicleType: '',
      vehicleNumber: '',
      vehicleModel: '',
      operatingCity: ''
    });
    setErrors({});
  }, [role]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone format (e.g., +91-98765-12345 or 9876543210)';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (role === 'doctor') {
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.hospitalName) newErrors.hospitalName = 'Hospital name is required';
    }

    if (role === 'driver') {
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
      if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      });
      if (error) throw new Error(error.message);
      showToast('Verification email resent! Check your inbox.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to resend email.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userData = {
        role,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        ...(role === 'patient' && {
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          medicalHistory: formData.medicalHistory,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone
          },
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}`
        }),
        ...(role === 'doctor' && {
          specialization: formData.specialization,
          registrationNumber: formData.registrationNumber,
          yearsOfExperience: formData.yearsOfExperience,
          hospitalName: formData.hospitalName,
          consultationFee: formData.consultationFee
        }),
        ...(role === 'driver' && {
          licenseNumber: formData.licenseNumber,
          licenseExpiry: formData.licenseExpiry,
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber,
          vehicleModel: formData.vehicleModel,
          operatingCity: formData.operatingCity
        })
      };

      const response = await authAPI.register(userData);

      if (response.requiresEmailConfirmation) {
        setRegisteredEmail(response.user.email);
        setShowEmailConfirmation(true);
        showToast('Account created! Check your email to verify.', 'success');
        return;
      }

      login(response.user);
      showToast(`Welcome, ${response.user.name}! Registration successful.`, 'success');
      navigate(response.user.role === 'doctor' || response.user.role === 'driver' ? '/patients' : '/dashboard');
    } catch (error) {
      showToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {role === 'patient' && <User size={48} color="#0D9488" />}
            {role === 'doctor' && <Stethoscope size={48} color="#0D9488" />}
            {role === 'driver' && <Car size={48} color="#0D9488" />}
            {role === 'admin' && <Building2 size={48} color="#0D9488" />}
            <h1 style={{ marginTop: 16, fontSize: '1.75rem' }}>
              Register as {role === 'patient' ? 'Patient' : role === 'doctor' ? 'Doctor' : role === 'driver' ? 'Ambulance Driver' : 'Hospital Admin'}
            </h1>
            <p style={{ color: '#64748B' }}>Fill in your details to get started</p>
          </div>

          {showEmailConfirmation ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✉️</div>
              <h2 style={{ marginBottom: 12 }}>Verify Your Email</h2>
              <p style={{ color: '#64748B', marginBottom: 24, lineHeight: 1.6 }}>
                We sent a verification email to <strong>{registeredEmail}</strong>.
                Please check your inbox and click the confirmation link to activate your account.
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: 32 }}>
                Didn't receive the email? Check your spam folder or resend below.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: 12 }}
                onClick={() => navigate('/signin')}
              >
                Go to Sign In
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend Verification Email'}
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={20} /> Personal Information
            </h3>
            
            <div className="input-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
              {errors.name && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" />
                {errors.email && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.email}</span>}
              </div>
              <div className="input-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91-98765-00000" />
                {errors.phone && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.phone}</span>}
              </div>
            </div>

            {role === 'patient' && (
              <>
                <div className="form-row">
                  <div className="input-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Blood Type</label>
                    <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                      <option value="">Select Blood Type</option>
                      {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Allergies</label>
                    <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="List any allergies" />
                  </div>
                </div>

                <h3 style={{ margin: '32px 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={20} color="#DC2626" /> Medical Information
                </h3>

                <div className="input-group">
                  <label>Medical History</label>
                  <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} 
                    placeholder="Enter your medical history, current medications, past surgeries, etc." rows={4} />
                </div>

                <h3 style={{ margin: '32px 0 20px' }}>Address</h3>

                <div className="input-group">
                  <label>Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                  </div>
                  <div className="input-group">
                    <label>State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
                </div>

                <h3 style={{ margin: '32px 0 20px' }}>Emergency Contact</h3>

                <div className="form-row">
                  <div className="input-group">
                    <label>Contact Name</label>
                    <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Emergency contact name" />
                  </div>
                  <div className="input-group">
                    <label>Contact Phone</label>
                    <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="Emergency contact phone" />
                  </div>
                </div>
              </>
            )}

            {role === 'doctor' && (
              <>
                <h3 style={{ margin: '32px 0 20px' }}>Professional Information</h3>

                <div className="form-row">
                  <div className="input-group">
                    <label>Specialization *</label>
                    <select name="specialization" value={formData.specialization} onChange={handleChange}>
                      <option value="">Select Specialization</option>
                      {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.specialization && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.specialization}</span>}
                  </div>
                  <div className="input-group">
                    <label>Registration Number *</label>
                    <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Medical registration number" />
                    {errors.registrationNumber && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.registrationNumber}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Years of Experience</label>
                    <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} placeholder="Years of experience" />
                  </div>
                  <div className="input-group">
                    <label>Consultation Fee (₹)</label>
                    <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} placeholder="Fee per consultation" />
                  </div>
                </div>

                <div className="input-group">
                  <label>Hospital/Clinic Name *</label>
                  <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} placeholder="Hospital or clinic name" />
                  {errors.hospitalName && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.hospitalName}</span>}
                </div>
              </>
            )}

            {role === 'admin' && (
              <>
                <h3 style={{ margin: '32px 0 20px' }}>Administrator Information</h3>
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  <Building2 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Hospital admins can view and manage all hospital details, doctors, beds, blood banks, and emergencies.
                </div>
              </>
            )}

            {role === 'driver' && (
              <>
                <h3 style={{ margin: '32px 0 20px' }}>License Information</h3>

                <div className="form-row">
                  <div className="input-group">
                    <label>License Number *</label>
                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="Driving license number" />
                    {errors.licenseNumber && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.licenseNumber}</span>}
                  </div>
                  <div className="input-group">
                    <label>License Expiry Date</label>
                    <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} />
                  </div>
                </div>

                <h3 style={{ margin: '32px 0 20px' }}>Vehicle Information</h3>

                <div className="form-row">
                  <div className="input-group">
                    <label>Vehicle Type *</label>
                    <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                      <option value="">Select Type</option>
                      <option value="Ambulance">Ambulance</option>
                      <option value="Medical Van">Medical Van</option>
                      <option value="Patient Transport">Patient Transport</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Vehicle Number *</label>
                    <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="Vehicle registration number" />
                    {errors.vehicleNumber && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.vehicleNumber}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Vehicle Model</label>
                    <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Vehicle model" />
                  </div>
                  <div className="input-group">
                    <label>Operating City/Region</label>
                    <input type="text" name="operatingCity" value={formData.operatingCity} onChange={handleChange} placeholder="City you operate in" />
                  </div>
                </div>
              </>
            )}

            <h3 style={{ margin: '32px 0 20px' }}>Security</h3>

            <div className="form-row">
              <div className="input-group">
                <label>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Create password"
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
                {errors.password && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.password}</span>}
              </div>
              <div className="input-group">
                <label>Confirm Password *</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <span style={{ color: '#DC2626', fontSize: '0.875rem' }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 24, color: '#64748B' }}>
              Already have an account? <Link to="/signin" style={{ color: '#0D9488' }}>Sign In</Link>
            </p>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
