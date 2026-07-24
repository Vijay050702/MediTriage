import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { emergencyAPI } from '../api';
import { hospitals, doctors, ambulanceDrivers } from '../data/mockData';
import { Building2, Phone, MapPin, Bed, Droplet, Stethoscope, Ambulance, AlertTriangle, Clock, User, CheckCircle, XCircle, Activity, ChevronDown, ChevronUp, Navigation } from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedHospitals, setExpandedHospitals] = useState(new Set());
  const [emergencies, setEmergencies] = useState([]);
  const pollingRef = useRef(null);

  useEffect(() => {
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
    }
  };

  const toggleHospital = (id) => {
    setExpandedHospitals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDoctorsByHospital = (hospitalName) => {
    return doctors.filter(d => d.hospital === hospitalName);
  };

  const calculateOccupancy = (available, total) => {
    if (total === 0) return 0;
    return ((total - available) / total) * 100;
  };

  const getBedColor = (available, total) => {
    const pct = (available / total) * 100;
    if (pct >= 30) return '#10B981';
    if (pct >= 10) return '#F59E0B';
    return '#DC2626';
  };

  const getBloodColor = (units) => {
    if (units > 5) return '#10B981';
    if (units > 0) return '#F59E0B';
    return '#DC2626';
  };

  const totalDoctors = hospitals.map(h => getDoctorsByHospital(h.name).length).reduce((a, b) => a + b, 0);
  const totalBeds = hospitals.reduce((s, h) => s + h.beds.total, 0);
  const totalAvailableBeds = hospitals.reduce((s, h) => s + h.beds.available, 0);

  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  const calculateDist = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <>
      <section className="animate-fade-in-up" style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 20 }}>System Overview</h2>
        <div className="grid grid-4 stagger">
          <div className="card" style={{ textAlign: 'center' }}>
            <Building2 size={28} color="#0D9488" style={{ marginBottom: 8 }} />
            <h3 style={{ fontSize: '1.5rem' }}>{hospitals.length}</h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Total Hospitals</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Stethoscope size={28} color="#0D9488" style={{ marginBottom: 8 }} />
            <h3 style={{ fontSize: '1.5rem' }}>{totalDoctors}</h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Total Doctors</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Bed size={28} color="#0D9488" style={{ marginBottom: 8 }} />
            <h3 style={{ fontSize: '1.5rem' }}>{totalBeds}</h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Total Beds</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Bed size={28} color="#10B981" style={{ marginBottom: 8 }} />
            <h3 style={{ fontSize: '1.5rem' }}>{totalAvailableBeds}</h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Available Beds</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
          <div className="card" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={24} color="#DC2626" />
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Active Emergencies</p>
              <h3 style={{ fontSize: '1.25rem', color: emergencies.length > 0 ? '#DC2626' : '#10B981' }}>
                {emergencies.length}
              </h3>
            </div>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12 }}>
            <User size={24} color="#0D9488" />
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Ambulance Drivers</p>
              <h3 style={{ fontSize: '1.25rem' }}>{ambulanceDrivers.length}</h3>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 20 }}>All Hospitals</h2>
        <div className="grid stagger">
          {hospitals.map(hospital => {
            const hospitalDoctors = getDoctorsByHospital(hospital.name);
            const isExpanded = expandedHospitals.has(hospital.id);
            const occupancy = calculateOccupancy(hospital.beds.available, hospital.beds.total);
            const bedColor = getBedColor(hospital.beds.available, hospital.beds.total);

            return (
              <div key={hospital.id} className="card" style={{ borderLeft: hospital.emergency ? '4px solid #DC2626' : '4px solid #0D9488' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                  onClick={() => toggleHospital(hospital.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Building2 size={24} color={hospital.emergency ? '#DC2626' : '#0D9488'} />
                    <div>
                      <h3 style={{ marginBottom: 4 }}>{hospital.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: '#64748B' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={14} /> {hospital.address}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={14} /> {hospital.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {hospital.emergency && (
                      <span className="badge" style={{ background: '#DC2626', color: 'white' }}>Emergency</span>
                    )}
                    {isExpanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bed size={18} color="#64748B" />
                    <span style={{ fontSize: '0.875rem' }}>
                      <strong>{hospital.beds.available}</strong> / {hospital.beds.total} beds available
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Stethoscope size={18} color="#64748B" />
                    <span style={{ fontSize: '0.875rem' }}>
                      <strong>{hospitalDoctors.length}</strong> doctors
                    </span>
                  </div>
                  {hospital.bloodBank && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Droplet size={18} color="#DC2626" />
                      <span style={{ fontSize: '0.875rem' }}>
                        <strong>{Object.values(hospital.bloodBank).reduce((a, b) => a + b, 0)}</strong> blood units
                      </span>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 20, borderTop: '1px solid #E2E8F0', paddingTop: 20 }}>
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bed size={18} /> Bed Occupancy
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 24, background: '#E2E8F0', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                            <div style={{
                              height: '100%', borderRadius: 12,
                              background: `linear-gradient(90deg, ${bedColor}, ${bedColor}dd)`,
                              width: `${100 - occupancy}%`,
                              transition: 'width 0.5s ease'
                            }}></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.8rem', color: '#64748B' }}>
                            <span>{hospital.beds.available} available</span>
                            <span>{hospital.beds.total - hospital.beds.available} occupied</span>
                            <span>{hospital.beds.total} total</span>
                          </div>
                        </div>
                        <div style={{
                          minWidth: 80, textAlign: 'center', padding: '8px 16px',
                          borderRadius: 8, background: bedColor + '15',
                          color: bedColor, fontWeight: 600, fontSize: '1.25rem'
                        }}>
                          {occupancy.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {hospitalDoctors.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Stethoscope size={18} /> Doctors ({hospitalDoctors.length})
                        </h4>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', fontWeight: 500 }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', fontWeight: 500 }}>Specialization</th>
                                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#64748B', fontWeight: 500 }}>Experience</th>
                                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#64748B', fontWeight: 500 }}>Fee</th>
                                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#64748B', fontWeight: 500 }}>Rating</th>
                                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#64748B', fontWeight: 500 }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {hospitalDoctors.map(doc => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.name}</td>
                                  <td style={{ padding: '10px 12px', color: '#64748B' }}>{doc.specialization}</td>
                                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748B' }}>{doc.experience} yrs</td>
                                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748B' }}>₹{doc.fee}</td>
                                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                    <span style={{ color: '#F59E0B' }}>★</span> {doc.rating}
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                    {doc.available ? (
                                      <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <CheckCircle size={14} /> Available
                                      </span>
                                    ) : (
                                      <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <XCircle size={14} /> Unavailable
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {hospital.bloodBank && (
                      <div>
                        <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Droplet size={18} color="#DC2626" /> Blood Bank Inventory
                        </h4>
                        <div className="grid grid-4" style={{ gap: 8 }}>
                          {Object.entries(hospital.bloodBank).map(([type, units]) => (
                            <div key={type} style={{
                              padding: '12px', borderRadius: 8, textAlign: 'center',
                              background: getBloodColor(units) + '12',
                              border: `1px solid ${getBloodColor(units)}30`
                            }}>
                              <p style={{ fontWeight: 600, fontSize: '1.1rem', color: getBloodColor(units) }}>{type}</p>
                              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{units} units</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!hospital.bloodBank && (
                      <p style={{ fontSize: '0.875rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        No blood bank maintained at this facility.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {emergencies.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626' }}>
              <AlertTriangle size={22} /> Active Emergency Alerts
            </h2>
            <button className="btn btn-emergency" style={{ padding: '8px 16px', fontSize: '0.875rem' }} onClick={() => navigate('/emergency')}>
              <Ambulance size={14} /> View All
            </button>
          </div>
          <div className="grid stagger">
            {emergencies.map(emergency => {
              const nearestHospitals = hospitals.filter(h => h.emergency).map(h => ({
                ...h,
                dist: parseFloat(calculateDist(emergency.location_lat, emergency.location_lng, h.latitude, h.longitude) || 999)
              })).sort((a, b) => a.dist - b.dist).slice(0, 3);

              return (
                <div key={emergency.id} className="card" style={{ borderLeft: '4px solid #DC2626', background: '#FEF2F2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Ambulance size={20} color="#DC2626" />
                      <h4>{emergency.patient_name || 'Unknown Patient'}</h4>
                    </div>
                    <span className="badge" style={{ background: '#DC2626', color: 'white' }}>{emergency.status}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.85rem', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {formatTime(emergency.created_at)}</span>
                    {emergency.patient_phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {emergency.patient_phone}</span>}
                    {emergency.location_address && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {emergency.location_address}</span>}
                  </div>
                  {emergency.description && (
                    <p style={{ fontSize: '0.875rem', marginTop: 8, color: '#374151' }}>{emergency.description}</p>
                  )}
                  {nearestHospitals.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>Nearest Hospitals</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {nearestHospitals.map((h, i) => (
                          <div key={h.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: '0.8rem', padding: '8px 10px',
                            background: i === 0 ? '#F0FDFA' : '#F8FAFC',
                            borderRadius: 6,
                            border: i === 0 ? '1px solid #0D948830' : '1px solid #E2E8F0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Navigation size={12} color="#0D9488" />
                              <span style={{ fontWeight: i === 0 ? 600 : 400 }}>{h.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748B' }}>
                              <span>{h.dist} km</span>
                              <Bed size={12} /> {h.beds.available}/{h.beds.total}
                            </div>
                            <a href={`tel:${h.phone}`} style={{ color: '#0D9488', textDecoration: 'none', fontWeight: 500 }}>
                              <Phone size={12} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ marginBottom: 20 }}>
          <Ambulance size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Ambulance Drivers
        </h2>
        <div className="grid stagger">
          {ambulanceDrivers.map(driver => (
            <div key={driver.id} className="card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderLeft: `4px solid ${driver.status === 'available' ? '#10B981' : '#F59E0B'}`
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="avatar" style={{
                  background: driver.status === 'available' ? '#10B981' : '#F59E0B',
                  width: 48, height: 48, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 600, fontSize: '1.2rem'
                }}>
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ marginBottom: 4 }}>{driver.name}</h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ambulance size={14} /> {driver.vehicle}
                  </p>
                  <span style={{
                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4,
                    background: driver.status === 'available' ? '#D1FAE5' : '#FEF3C7',
                    color: driver.status === 'available' ? '#10B981' : '#F59E0B',
                    display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4
                  }}>
                    <Activity size={12} /> {driver.status === 'available' ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#F59E0B', fontSize: '0.875rem' }}>★ {driver.rating}</span>
                <a href={`tel:${driver.phone}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Phone size={14} /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HospitalDashboard;
