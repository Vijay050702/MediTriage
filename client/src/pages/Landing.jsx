import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Activity, Calendar, Ambulance, Stethoscope, Shield, ArrowRight, User, Car, Zap, Clock, AlertTriangle, Phone, MapPin, Check, Navigation, Hospital, Building2, Bed } from 'lucide-react';
import { emergencyAPI } from '../api';
import { showToast } from '../components/Toast';
import { hospitals } from '../data/mockData';

const Landing = () => {
  const [emergencyState, setEmergencyState] = useState('idle');
  const [publicLocation, setPublicLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  const getLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPublicLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          });
          setLocationStatus('success');
        },
        () => {
          setPublicLocation({ lat: 28.6314, lng: 77.2197, address: 'New Delhi - Default' });
          setLocationStatus('success');
        }
      );
    } else {
      setPublicLocation({ lat: 28.6314, lng: 77.2197, address: 'New Delhi - Default' });
      setLocationStatus('success');
    }
  };

  const handleEmergency = () => {
    setEmergencyState('locating');
    getLocation();
  };

  const sendEmergency = useCallback(async () => {
    setEmergencyState('sending');
    try {
      await emergencyAPI.requestPublic({
        patientName: 'Guest (Landing Page)',
        patientPhone: null,
        location: publicLocation,
        description: 'Emergency alert from Landing page - Immediate assistance required'
      });
      setEmergencyState('sent');
      showToast('Emergency alert sent to hospitals and ambulance drivers!', 'success');
    } catch (error) {
      showToast('Failed to send emergency alert', 'error');
      setEmergencyState('idle');
    }
  }, [publicLocation]);

  useEffect(() => {
    if (emergencyState === 'locating' && locationStatus === 'success' && publicLocation) {
      sendEmergency();
    }
  }, [emergencyState, locationStatus, publicLocation, sendEmergency]);

  const calculateDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const resetEmergency = () => {
    setEmergencyState('idle');
    setPublicLocation(null);
    setLocationStatus('idle');
  };

  return (
    <div className="landing">
      <section className="hero-animated" style={{
        color: 'white',
        padding: '100px 16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating decorative icons */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', opacity: 0.15 }} className="hero-float">
          <Heart size={48} />
        </div>
        <div style={{ position: 'absolute', top: '25%', right: '10%', opacity: 0.12 }} className="hero-float-slow">
          <Activity size={56} />
        </div>
        <div style={{ position: 'absolute', bottom: '20%', left: '15%', opacity: 0.1 }} className="hero-float-slow">
          <Stethoscope size={44} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', right: '12%', opacity: 0.12 }} className="hero-float">
          <Shield size={40} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-float" style={{ display: 'inline-block' }}>
            <Heart size={64} style={{ marginBottom: 24 }} />
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>
            MediTriage India
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            AI-Powered Medical & Dental Triage System for Patients, Doctors, and Emergency Services across India
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup?role=patient" className="btn" style={{ background: 'white', color: '#0D9488', fontWeight: 600, padding: '14px 28px' }}>
              <User size={20} />
              I'm a Patient
            </Link>
            <Link to="/signup?role=doctor" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', padding: '14px 28px' }}>
              <Stethoscope size={20} />
              I'm a Doctor
            </Link>
            <Link to="/signup?role=driver" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', padding: '14px 28px' }}>
              <Ambulance size={20} />
              I'm an Ambulance Driver
            </Link>
            <Link to="/signup?role=admin" className="btn" style={{ background: 'rgba(13,148,136,0.25)', color: 'white', border: '2px solid rgba(13,148,136,0.5)', backdropFilter: 'blur(8px)', padding: '14px 28px' }}>
              <Building2 size={20} />
              Hospital Admin
            </Link>
          </div>
          <div style={{ marginTop: 32 }}>
            {emergencyState === 'idle' && (
              <button onClick={handleEmergency} className="btn" style={{ background: '#DC2626', color: 'white', fontWeight: 700, padding: '18px 48px', fontSize: '1.25rem', border: '3px solid #FCA5A5', animation: 'pulse 2s infinite', boxShadow: '0 0 40px rgba(220,38,38,0.4)', cursor: 'pointer' }}>
                <AlertTriangle size={24} style={{ marginRight: 12 }} />
                SOS — Emergency? Press Here
                <Phone size={20} style={{ marginLeft: 12 }} />
              </button>
            )}
            {emergencyState === 'locating' && (
              <div style={{ background: 'rgba(220,38,38,0.2)', borderRadius: 16, padding: '24px 48px', border: '2px solid rgba(255,255,255,0.3)' }}>
                <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', borderColor: '#FCA5A5', borderTopColor: 'white' }}></div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Detecting your location...</p>
              </div>
            )}
            {emergencyState === 'sending' && (
              <div style={{ background: 'rgba(220,38,38,0.2)', borderRadius: 16, padding: '24px 48px', border: '2px solid rgba(255,255,255,0.3)' }}>
                <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', borderColor: '#FCA5A5', borderTopColor: 'white' }}></div>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sending emergency alert to hospitals & ambulance drivers...</p>
              </div>
            )}
            {emergencyState === 'sent' && (
              <div style={{ background: 'rgba(16,185,129,0.2)', borderRadius: 16, padding: '24px 32px', border: '2px solid rgba(167,243,208,0.5)' }}>
                <Check size={40} style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Emergency Alert Sent!</h3>
                <p style={{ opacity: 0.9, marginBottom: 16 }}>Your location has been shared with nearby hospitals and ambulance drivers. Help is on the way.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                  <a href="tel:102" className="btn" style={{ background: 'white', color: '#059669', fontWeight: 600, padding: '12px 24px' }}>
                    <Phone size={20} /> Call 102
                  </a>
                  <a href="tel:108" className="btn" style={{ background: 'white', color: '#DC2626', fontWeight: 600, padding: '12px 24px' }}>
                    <Phone size={20} /> Call 108
                  </a>
                </div>
                {publicLocation && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 8, fontSize: '0.85rem' }}>
                    <p style={{ marginBottom: 8, fontWeight: 500 }}>Nearby Emergency Hospitals:</p>
                    {hospitals.filter(h => h.emergency).slice(0, 3).map(h => {
                      const dist = calculateDist(publicLocation.lat, publicLocation.lng, h.latitude, h.longitude);
                      return (
                        <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                          <span>{h.name}</span>
                          <span>{dist} km</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button onClick={resetEmergency} className="btn" style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px' }}>
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 16px', background: '#F8FAFC' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 48, letterSpacing: '-0.02em' }}>
            How MediTriage Works
          </h2>
          <div className="grid grid-4 stagger">
            <div className="card card-interactive" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Activity size={32} color="#0D9488" />
              </div>
              <h3 style={{ marginBottom: 8 }}>AI Symptom Analysis</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Enter your symptoms and get instant AI-powered analysis with triage recommendations
              </p>
            </div>
            <div className="card card-interactive" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Calendar size={32} color="#0D9488" />
              </div>
              <h3 style={{ marginBottom: 8 }}>Easy Appointments</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Book appointments with doctors across India based on availability and specialization
              </p>
            </div>
            <div className="card card-interactive" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Ambulance size={32} color="#0D9488" />
              </div>
              <h3 style={{ marginBottom: 8 }}>Emergency Response</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Quick access to 102/108 ambulance services with location sharing and medical history
              </p>
            </div>
            <div className="card card-interactive" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Shield size={32} color="#0D9488" />
              </div>
              <h3 style={{ marginBottom: 8 }}>Secure Records</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Your medical history is secure and accessible to authorized healthcare providers
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 16px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 48, letterSpacing: '-0.02em' }}>
            Who Can Use MediTriage?
          </h2>
          <div className="grid grid-4 stagger">
            <div className="card card-interactive" style={{ borderTop: '4px solid #0D9488' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <User size={28} color="#0D9488" />
              </div>
              <h3 style={{ marginBottom: 12 }}>Patients</h3>
              <ul style={{ color: '#64748B', listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={14} color="#0D9488" /> Check symptoms with AI
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="#0D9488" /> Book doctor appointments
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={14} color="#0D9488" /> Store medical history
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ambulance size={14} color="#0D9488" /> Emergency ambulance (102/108)
                </li>
              </ul>
              <Link to="/signup?role=patient" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
                Register as Patient <ArrowRight size={16} />
              </Link>
            </div>
            <div className="card card-interactive" style={{ borderTop: '4px solid #1E293B' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(30,41,59,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Stethoscope size={28} color="#1E293B" />
              </div>
              <h3 style={{ marginBottom: 12 }}>Doctors</h3>
              <ul style={{ color: '#64748B', listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color="#1E293B" /> Manage appointments
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} color="#1E293B" /> View patient history
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ambulance size={14} color="#1E293B" /> Emergency alerts
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={14} color="#1E293B" /> Patient management
                </li>
              </ul>
              <Link to="/signup?role=doctor" className="btn btn-secondary" style={{ width: '100%', marginTop: 16 }}>
                Register as Doctor <ArrowRight size={16} />
              </Link>
            </div>
            <div className="card card-interactive" style={{ borderTop: '4px solid #DC2626' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Car size={28} color="#DC2626" />
              </div>
              <h3 style={{ marginBottom: 12 }}>Ambulance Drivers</h3>
              <ul style={{ color: '#64748B', listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ambulance size={14} color="#DC2626" /> Emergency assignments
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={14} color="#DC2626" /> Fast route navigation
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={14} color="#DC2626" /> Patient medical info
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={14} color="#DC2626" /> Hospital coordination
                </li>
              </ul>
              <Link to="/signup?role=driver" className="btn btn-emergency" style={{ width: '100%', marginTop: 16 }}>
                Register as Driver <ArrowRight size={16} />
              </Link>
            </div>
            <div className="card card-interactive" style={{ borderTop: '4px solid #0D9488' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Building2 size={28} color="#0D9488" />
              </div>
              <h3 style={{ marginBottom: 12 }}>Hospital Admin</h3>
              <ul style={{ color: '#64748B', listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={14} color="#0D9488" /> Manage hospital details
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Stethoscope size={14} color="#0D9488" /> View all doctors
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bed size={14} color="#0D9488" /> Bed & blood bank tracking
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ambulance size={14} color="#0D9488" /> Emergency monitoring
                </li>
              </ul>
              <Link to="/signup?role=admin" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
                Register as Admin <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 16px', background: '#F8FAFC' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 48, letterSpacing: '-0.02em' }}>
            Emergency Numbers in India
          </h2>
          <div className="grid grid-3 stagger">
            <div className="card card-interactive" style={{ textAlign: 'center', borderLeft: '4px solid #DC2626' }}>
              <h3 style={{ color: '#DC2626', fontSize: '2.5rem', marginBottom: 8, fontWeight: 700 }}>102</h3>
              <h4 style={{ marginBottom: 8 }}>Ambulance Service</h4>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>For medical emergencies</p>
            </div>
            <div className="card card-interactive" style={{ textAlign: 'center', borderLeft: '4px solid #DC2626' }}>
              <h3 style={{ color: '#DC2626', fontSize: '2.5rem', marginBottom: 8, fontWeight: 700 }}>108</h3>
              <h4 style={{ marginBottom: 8 }}>Emergency Response</h4>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>24/7 emergency ambulance</p>
            </div>
            <div className="card card-interactive" style={{ textAlign: 'center', borderLeft: '4px solid #DC2626' }}>
              <h3 style={{ color: '#DC2626', fontSize: '2.5rem', marginBottom: 8, fontWeight: 700 }}>112</h3>
              <h4 style={{ marginBottom: 8 }}>Police Emergency</h4>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>All emergency services</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white', padding: '48px 16px', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <Heart size={24} />
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>MediTriage India</span>
          </div>
          <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>© 2026 MediTriage India. All rights reserved.</p>
          <p style={{ opacity: 0.4, marginTop: 8, fontSize: '0.8rem' }}>This is a demo application. Not for actual medical use.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
