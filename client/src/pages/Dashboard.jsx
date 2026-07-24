import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, medicalRecordsAPI, emergencyAPI } from '../api';
import { Activity, Calendar, Ambulance, User, Stethoscope, Car, Clock, Heart, AlertCircle, CheckCircle, FileText, Phone, MessageSquare, Settings, MapPin, Video, AlertTriangle, Droplet, Navigation } from 'lucide-react';
import { hospitals } from '../data/mockData';
import { showToast } from '../components/Toast';
import HospitalDashboard from './HospitalDashboard';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appts, records] = await Promise.all([
          appointmentsAPI.getAll(),
          medicalRecordsAPI.getAll()
        ]);
        setAppointments(appts);
        setRecordsCount(records.length);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const quickActions = [
    { icon: Activity, label: 'Check Symptoms', path: '/symptoms', color: '#0D9488', desc: 'AI-powered analysis' },
    { icon: Calendar, label: 'Book Appointment', path: '/appointments', color: '#0D9488', desc: 'Find a doctor' },
    { icon: FileText, label: 'Medical History', path: '/medical-history', color: '#0D9488', desc: 'View records' },
    { icon: Ambulance, label: 'Emergency', path: '/emergency', color: '#DC2626', desc: 'Call ambulance' }
  ];

  return (
    <>
      <section style={{ marginBottom: 32 }} className="animate-fade-in-up">
        <h2 style={{ marginBottom: 20 }}>Quick Actions</h2>
        <div className="grid grid-4 stagger">
          {quickActions.map((action, index) => (
            <div key={index} onClick={() => navigate(action.path)} style={{ cursor: 'pointer' }}>
              <div className="card card-interactive" style={{ textAlign: 'center', padding: 24, height: '100%' }}>
                <action.icon size={40} color={action.color} style={{ marginBottom: 12 }} />
                <h3>{action.label}</h3>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{action.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 20 }}>Your Medical Summary</h2>
        <div className="grid grid-4 stagger">
          <div className="card">
            <h4 style={{ marginBottom: 12, color: '#64748B' }}>Blood Type</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#DC2626' }}>{user?.blood_type || 'Not set'}</p>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12, color: '#64748B' }}>Allergies</h4>
            <p style={{ fontSize: '1rem' }}>{user?.allergies || 'None reported'}</p>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12, color: '#64748B' }}>Emergency Contact</h4>
            <p style={{ fontSize: '0.875rem' }}>{user?.emergency_contact_name || 'Not set'}</p>
            <p style={{ color: '#64748B', fontSize: '0.75rem' }}>{user?.emergency_contact_phone || ''}</p>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12, color: '#64748B' }}>Medical Records</h4>
            {loading ? (
              <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
            ) : (
              <>
                <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{recordsCount}</p>
                <p style={{ color: '#64748B', fontSize: '0.75rem' }}>Total records</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Upcoming Appointments</h2>
          <button className="btn btn-primary" onClick={() => navigate('/appointments')} style={{ padding: '8px 16px' }}>
            Book New
          </button>
        </div>
        {loading ? (
          <div className="grid">
            {[1, 2].map(i => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="grid stagger">
            {appointments.map(apt => (
              <div key={apt.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div className="avatar" style={{ background: '#0D9488' }}>
                    {apt.doctor_name?.charAt(0)}
                  </div>
                  <div>
                    <h4>{apt.doctor_name}</h4>
                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{apt.doctor_specialization} • {apt.hospital}</p>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      background: apt.consultation_type === 'online' ? '#EFF6FF' : '#F0FDF4',
                      color: apt.consultation_type === 'online' ? '#2563EB' : '#16A34A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4
                    }}>
                      {apt.consultation_type === 'online' ? <><Video size={12} /> Online</> : <><MapPin size={12} /> In-Clinic</>}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 500 }}>{apt.appointment_date}</p>
                  <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{apt.appointment_time} • ₹{apt.fee}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <Calendar size={48} color="#64748B" style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ color: '#64748B' }}>No upcoming appointments</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/appointments')}>
              Book an Appointment
            </button>
          </div>
        )}
      </section>
    </>
  );
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState([]);
  const [emergenciesLoading, setEmergenciesLoading] = useState(true);
  const pollingRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appts = await appointmentsAPI.getAll();
        setAppointments(appts);
      } catch (error) {
        console.error('Failed to load appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    loadEmergencies();
    pollingRef.current = setInterval(loadEmergencies, 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const loadEmergencies = async () => {
    try {
      const data = await emergencyAPI.getAll();
      setEmergencies(data.filter(e => e.status === 'pending' || e.status === 'dispatched'));
    } catch (error) {
      console.error('Failed to load emergencies:', error);
    } finally {
      setEmergenciesLoading(false);
    }
  };

  const calculateDist = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1) return '—';
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);

  const quickActions = [
    { icon: User, label: 'My Patients', path: '/patients', desc: 'View patient list' },
    { icon: FileText, label: 'Patient Records', path: '/patients', desc: 'View history' }
  ];

  return (
    <>
      <section style={{ marginBottom: 32 }} className="animate-fade-in-up">
        <h2 style={{ marginBottom: 20 }}>Today's Overview</h2>
        <div className="grid grid-4 stagger">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={24} color="#0D9488" />
              <div>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Today's Appointments</p>
                <h3 style={{ fontSize: '1.5rem' }}>
                  {loading ? <span className="skeleton skeleton-text" style={{ width: 40, display: 'inline-block' }}></span> : todayAppointments.length}
                </h3>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <User size={24} color="#0D9488" />
              <div>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Total Appointments</p>
                <h3 style={{ fontSize: '1.5rem' }}>
                  {loading ? <span className="skeleton skeleton-text" style={{ width: 40, display: 'inline-block' }}></span> : appointments.length}
                </h3>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Clock size={24} color="#0D9488" />
              <div>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Experience</p>
                <h3 style={{ fontSize: '1.5rem' }}>{user?.years_of_experience || '0'} yrs</h3>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Activity size={24} color="#0D9488" />
              <div>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Specialization</p>
                <h3 style={{ fontSize: '1rem' }}>{user?.specialization || 'General'}</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 20 }}>Quick Actions</h2>
        <div className="grid grid-2 stagger">
          {quickActions.map((action, index) => (
            <div key={index} className="card card-interactive" style={{ textAlign: 'center' }} onClick={() => action.path && navigate(action.path)}>
              <action.icon size={32} color="#0D9488" style={{ margin: '0 auto 12px' }} />
              <h4>{action.label}</h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{action.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {emergencies.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626' }}>
              <AlertTriangle size={22} /> Active Emergency Alerts
            </h2>
            <Link to="/emergency" className="btn btn-emergency" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              <Ambulance size={14} /> View All
            </Link>
          </div>
          <div className="grid stagger">
            {emergencies.slice(0, 4).map(emergency => {
              let nearest = null;
              if (emergency.location_lat) {
                nearest = hospitals.filter(h => h.emergency).map(h => ({
                  ...h,
                  dist: parseFloat(calculateDist(emergency.location_lat, emergency.location_lng, h.latitude, h.longitude))
                })).sort((a, b) => a.dist - b.dist)[0];
              }
              return <DoctorEmergencyCard key={emergency.id} emergency={emergency} nearest={nearest} navigate={navigate} />;
            })}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Today's Patient Queue</h2>
          <button className="btn btn-outline" onClick={() => navigate('/patients')}>View All Patients</button>
        </div>
        {loading ? (
          <div className="card">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton skeleton-text" style={{ height: 48, marginBottom: 12 }}></div>
            ))}
          </div>
        ) : todayAppointments.length > 0 ? (
          <div className="card">
            {todayAppointments.map((apt, index) => (
              <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < todayAppointments.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar">
                    {apt.patient_name?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500 }}>{apt.patient_name}</p>
                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{apt.appointment_time} - {apt.symptoms || 'Consultation'}</p>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      background: apt.consultation_type === 'online' ? '#EFF6FF' : '#F0FDF4',
                      color: apt.consultation_type === 'online' ? '#2563EB' : '#16A34A',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4
                    }}>
                      {apt.consultation_type === 'online' ? <><Video size={12} /> Online</> : <><MapPin size={12} /> In-Clinic</>}
                    </span>
                  </div>
                </div>
                <span className="badge badge-normal">{apt.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <Calendar size={48} color="#64748B" style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ color: '#64748B' }}>No appointments scheduled for today</p>
          </div>
        )}
      </section>


    </>
  );
};

const DoctorEmergencyCard = ({ emergency, nearest, navigate }) => {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  const allHospitals = hospitals.filter(h => h.emergency);
  const sortedHospitals = emergency.location_lat
    ? allHospitals.map(h => ({
        ...h,
        dist: parseFloat(
          !emergency.location_lat
            ? 0
            : (6371 * Math.acos(
                Math.cos(emergency.location_lat * Math.PI / 180) *
                Math.cos(h.latitude * Math.PI / 180) *
                Math.cos((h.longitude - emergency.location_lng) * Math.PI / 180) +
                Math.sin(emergency.location_lat * Math.PI / 180) *
                Math.sin(h.latitude * Math.PI / 180)
              )).toFixed(1)
        )
      })).sort((a, b) => a.dist - b.dist)
    : [];

  return (
    <div className="card" style={{ borderLeft: '4px solid #DC2626', background: expanded ? 'white' : '#FEF2F2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ambulance size={20} color="#DC2626" />
          <h4>{emergency.patient_name}</h4>
        </div>
        <span className="badge" style={{ background: '#DC2626', color: 'white' }}>{emergency.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: '0.875rem', color: '#64748B' }}>
        {emergency.patient_phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={14} /> {emergency.patient_phone}
          </div>
        )}
        {emergency.patient_blood_type && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Droplet size={14} color="#DC2626" /> {emergency.patient_blood_type}
          </div>
        )}
        {emergency.patient_allergies && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} color="#DC2626" /> Allergies: {emergency.patient_allergies}
          </div>
        )}
        {emergency.location_address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} /> {emergency.location_address}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} /> {formatTime(emergency.created_at)}
        </div>
      </div>

      {emergency.description && (
        <p style={{ fontSize: '0.875rem', marginBottom: 8, color: '#374151' }}>{emergency.description}</p>
      )}

      {nearest && (
        <p style={{ fontSize: '0.75rem', color: '#0D9488' }}>
          <Navigation size={12} style={{ display: 'inline' }} /> Nearest hospital: {nearest.name} — {nearest.dist} km
        </p>
      )}

      {expanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <h4 style={{ marginBottom: 12, color: '#1E293B' }}>Emergency Timeline</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#DC2626', marginTop: 4, flexShrink: 0 }}></div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Emergency Reported</p>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{formatTime(emergency.created_at)}</p>
                {emergency.location_address && (
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>📍 {emergency.location_address}</p>
                )}
                {emergency.location_lat && (
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Coordinates: {emergency.location_lat.toFixed(6)}, {emergency.location_lng.toFixed(6)}</p>
                )}
              </div>
            </div>

            {emergency.driver_id && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B', marginTop: 4, flexShrink: 0 }}></div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Driver Assigned</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Driver ID: {emergency.driver_id}</p>
                </div>
              </div>
            )}

            {emergency.status === 'dispatched' && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3B82F6', marginTop: 4, flexShrink: 0 }}></div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Driver Dispatched to Patient</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Driver is en route to pickup location</p>
                </div>
              </div>
            )}

            {emergency.status === 'in_progress' && (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3B82F6', marginTop: 4, flexShrink: 0 }}></div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Driver Dispatched to Patient</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Driver is en route to pickup location</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981', marginTop: 4, flexShrink: 0 }}></div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Patient Picked Up</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Patient en route to {nearest?.name || 'hospital'}</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>📍 Pickup: {emergency.location_address || `${emergency.location_lat?.toFixed(6)}, ${emergency.location_lng?.toFixed(6)}`}</p>
                    {nearest && (
                      <p style={{ fontSize: '0.8rem', color: '#64748B' }}>🏥 Destination: {nearest.name} — {nearest.dist} km from pickup</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {emergency.status === 'resolved' && (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3B82F6', marginTop: 4, flexShrink: 0 }}></div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Driver Dispatched</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981', marginTop: 4, flexShrink: 0 }}></div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Patient Delivered to Hospital</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{formatTime(emergency.updated_at)}</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>📍 Drop-off: {nearest?.name || 'Hospital'}</p>
                  </div>
                </div>
              </>
            )}

            {emergency.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#9CA3AF', marginTop: 4, flexShrink: 0 }}></div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', color: '#9CA3AF' }}>Awaiting Driver Assignment</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>No driver has been assigned yet</p>
                </div>
              </div>
            )}
          </div>

          {sortedHospitals.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 8, color: '#1E293B', fontSize: '0.875rem' }}>Nearby Emergency Hospitals</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sortedHospitals.slice(0, 3).map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 8px', background: '#F8FAFC', borderRadius: 6 }}>
                    <span style={{ fontWeight: 500 }}>{h.name}</span>
                    <span style={{ color: '#0D9488' }}>{h.dist} km • {h.beds.available} beds</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setExpanded(!expanded)}>
          <Clock size={12} /> {expanded ? 'Hide Details' : 'View Details'}
        </button>
        {emergency.patient_phone && (
          <a href={`tel:${emergency.patient_phone}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Phone size={12} /> Contact
          </a>
        )}
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await appointmentsAPI.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrips = appointments.filter(a => a.appointment_date === todayStr);
  const completedToday = todayTrips.filter(a => a.status === 'completed').length;

  const quickActions = [
    { icon: Ambulance, label: 'Emergency Requests', path: '/emergency', desc: 'View new calls', color: '#DC2626' },
    { icon: Phone, label: 'Hospital Contacts', path: '/emergency', desc: 'Quick dial', color: '#0D9488' },
    { icon: MapPin, label: 'Navigation', path: '/emergency', desc: 'GPS tracking', color: '#0D9488' },
    { icon: Clock, label: 'My Schedule', path: '/emergency', desc: 'View shifts', color: '#0D9488' }
  ];

  const recentAssignments = appointments.slice(0, 5).map(apt => ({
    id: apt.id,
    type: apt.emergency ? 'Emergency Transport' : 'Patient Transfer',
    location: `${apt.patient_name || 'Patient'} → ${apt.hospital || 'Hospital'}`,
    status: apt.status || 'completed',
    time: apt.appointment_date || apt.date
  }));

  return (
    <>
      <section style={{ marginBottom: 32 }} className="animate-fade-in-up">
        <h2 style={{ marginBottom: 20 }}>Current Status</h2>
        <div className="grid grid-3 stagger">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 80, height: 80, borderRadius: '50%', 
              background: '#D1FAE5', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle size={40} color="#10B981" />
            </div>
            <h3>Available</h3>
            <p style={{ color: '#64748B' }}>Ready for assignments</p>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Today's Stats</h4>
            {loading ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748B' }}>Total Trips</span>
                  <span className="skeleton skeleton-text" style={{ width: 30 }}></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748B' }}>Completed</span>
                  <span className="skeleton skeleton-text" style={{ width: 30 }}></span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748B' }}>Total Trips</span>
                  <span style={{ fontWeight: 600 }}>{todayTrips.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748B' }}>Completed</span>
                  <span style={{ fontWeight: 600 }}>{completedToday}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Total Appointments</span>
                  <span style={{ fontWeight: 600 }}>{appointments.length}</span>
                </div>
              </>
            )}
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Vehicle Status</h4>
            <p style={{ fontWeight: 500 }}>{user?.vehicle_type || 'Ambulance'} {user?.vehicle_number || 'DL-01-AB-1234'}</p>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{user?.vehicle_model || 'Standard'}</p>
            <p style={{ color: '#10B981', fontSize: '0.875rem', marginTop: 8 }}>All systems operational</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 20 }}>Quick Actions</h2>
        <div className="grid grid-4 stagger">
          {quickActions.map((action, index) => (
            <div key={index} className="card card-interactive" style={{ textAlign: 'center' }} onClick={() => action.path && navigate(action.path)}>
              <action.icon size={32} color={action.color} style={{ margin: '0 auto 12px' }} />
              <h4>{action.label}</h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{action.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 20 }}>Recent Assignments</h2>
        <div className="card">
          {recentAssignments.map((assignment, index) => (
            <div key={assignment.id} style={{ padding: '16px 0', borderBottom: index < recentAssignments.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{assignment.type}</span>
                <span className="badge badge-normal">{assignment.status}</span>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{assignment.location}</p>
              <p style={{ color: '#64748B', fontSize: '0.75rem' }}>{assignment.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 20 }}>Active Emergency Calls</h2>
        <div className="card" style={{ borderColor: '#DC2626', background: '#FEF2F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Ambulance size={24} color="#DC2626" />
            <div>
              <p style={{ fontWeight: 500 }}>No active emergency calls</p>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>You will be notified when there's an emergency</p>
            </div>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => navigate('/emergency')}>
              Check Requests
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    switch(user?.role) {
      case 'patient': return 'health';
      case 'doctor': return 'practice';
      case 'driver': return 'work';
      case 'admin': return 'hospital';
      default: return 'overview';
    }
  };

  return (
    <div style={{ padding: '40px 16px' }}>
      <div className="container">
        <div className="page-header">
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's your {getWelcomeMessage()} overview</p>
        </div>

        {user?.role === 'patient' && <PatientDashboard />}
        {user?.role === 'doctor' && <DoctorDashboard />}
        {user?.role === 'driver' && <DriverDashboard />}
        {user?.role === 'admin' && <HospitalDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
