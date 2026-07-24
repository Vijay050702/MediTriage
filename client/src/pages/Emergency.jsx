import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Navigation, Heart, AlertTriangle, Clock, Hospital, Car, Send, Check, FileText, Navigation2, Route, ArrowRight, Droplet, Activity, Ambulance, AlertCircle } from 'lucide-react';
import { hospitals, bloodBanks } from '../data/mockData';
import { emergencyAPI, medicalRecordsAPI } from '../api';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const PatientEmergencyView = ({ user, patientLocation, setPatientLocation, locationStatus, getLocation, patientCondition, setPatientCondition, emergencyStatus, setEmergencyStatus, loading, handleDispatchAmbulance, assignedDriver, calculateDistance, getETAMinutes, selectedHospital, setSelectedHospital, handleCallHospital }) => {
  return (
    <>
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', 
        color: 'white',
        textAlign: 'center',
        padding: 40,
        marginBottom: 24
      }}>
        <AlertTriangle size={48} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Life-Threatening Emergency?</h2>
        <p style={{ opacity: 0.9, marginBottom: 24 }}>Call 102 (Ambulance) or 108 (Emergency)</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="tel:102" className="btn" style={{ background: 'white', color: '#DC2626', fontSize: '1.25rem', padding: '16px 32px' }}>
            <Phone size={24} />102
          </a>
          <a href="tel:108" className="btn" style={{ background: 'white', color: '#DC2626', fontSize: '1.25rem', padding: '16px 32px' }}>
            <Phone size={24} />108
          </a>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Your Location</h3>
        {patientLocation ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#F8FAFC', borderRadius: 8, marginBottom: 16 }}>
              <MapPin size={24} color="#0D9488" />
              <div>
                <p style={{ fontWeight: 500 }}>{patientLocation.address}</p>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{patientLocation.lat.toFixed(4)}, {patientLocation.lng.toFixed(4)}</p>
              </div>
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={getLocation}>
              <Navigation size={16} />
              {locationStatus === 'loading' ? 'Getting location...' : 'Refresh Location'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            {locationStatus === 'loading' ? (
              <><div className="spinner" style={{ margin: '0 auto 16px' }}></div><p>Getting your location...</p></>
            ) : (
              <button className="btn btn-primary" onClick={getLocation}><MapPin size={16} />Get My Location</button>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Patient Condition</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={patientCondition.conscious} onChange={(e) => setPatientCondition({...patientCondition, conscious: e.target.checked})} />
            Patient is conscious
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={patientCondition.breathing} onChange={(e) => setPatientCondition({...patientCondition, breathing: e.target.checked})} />
            Patient is breathing normally
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={patientCondition.bleeding} onChange={(e) => setPatientCondition({...patientCondition, bleeding: e.target.checked})} />
            Active bleeding
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={patientCondition.chestPain} onChange={(e) => setPatientCondition({...patientCondition, chestPain: e.target.checked})} />
            Chest pain
          </label>
        </div>
        <div className="input-group" style={{ marginTop: 16 }}>
          <label>Additional Details</label>
          <textarea value={patientCondition.description} onChange={(e) => setPatientCondition({...patientCondition, description: e.target.value})} placeholder="Describe the emergency situation..." rows={3} />
        </div>
      </div>
    </>
  );
};

const DriverEmergencyView = ({ user }) => {
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadEmergencies();
    getDriverLocation();
    pollingRef.current = setInterval(loadEmergencies, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const getDriverLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setDriverLocation({ lat: 28.5692, lng: 77.2588 });
        }
      );
    }
  };

  const loadEmergencies = async () => {
    try {
      const data = await emergencyAPI.getAll();
      const pendingEmergencies = data.filter(e => e.status === 'pending' || e.status === 'dispatched');
      setEmergencies(pendingEmergencies);
    } catch (error) {
      console.error('Failed to load emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptEmergency = async (emergency) => {
    try {
      await emergencyAPI.updateStatus(emergency.id, 'in_progress', user.id);
      setSelectedEmergency(emergency);
      showToast('Emergency accepted! Navigate to patient location.', 'success');
      loadEmergencies();
    } catch (error) {
      showToast('Failed to accept emergency', 'error');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getETAMinutes = (distance) => Math.round((distance / 60) * 60);

  const openGoogleMaps = (destLat, destLng, destName) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const openGoogleMapsWithWaypoint = (originLat, originLng, waypointLat, waypointLng, destLat, destLng, destName) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&waypoints=${waypointLat},${waypointLng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getRecommendedHospital = (patientLat, patientLng) => {
    const emergencyHospitals = hospitals.filter(h => h.emergency);
    let closest = null;
    let minDist = Infinity;
    
    emergencyHospitals.forEach(h => {
      const dist = calculateDistance(patientLat, patientLng, h.latitude, h.longitude);
      if (dist < minDist) {
        minDist = dist;
        closest = h;
      }
    });
    
    return { hospital: closest, distance: minDist };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 16 }}>Loading emergency requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 24, borderColor: '#DC2626', borderLeftWidth: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={24} color="#DC2626" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 4 }}>Ambulance Driver Mode</h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Accept emergency requests and navigate to patients</p>
          </div>
          <div style={{ padding: '8px 16px', background: driverLocation ? '#D1FAE5' : '#FEF3C7', borderRadius: 8 }}>
            <p style={{ fontSize: '0.75rem', color: driverLocation ? '#065F46' : '#92400E' }}>
              {driverLocation ? 'Location Active' : 'Getting Location...'}
            </p>
          </div>
        </div>
      </div>

      {selectedEmergency && (
        <div className="card" style={{ marginBottom: 24, borderColor: '#0D9488', borderLeftWidth: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <span className="badge badge-emergency" style={{ marginBottom: 8 }}>ACCEPTED</span>
              <h3>{selectedEmergency.patient_name || 'Patient'}</h3>
            </div>
            <button className="btn btn-outline" onClick={() => setSelectedEmergency(null)} style={{ padding: '8px 12px' }}>Close</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 8 }}>
              <p style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: 4 }}>PATIENT LOCATION</p>
              <p style={{ fontWeight: 500 }}>{selectedEmergency.location_address || 'Unknown Address'}</p>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                {selectedEmergency.location_lat?.toFixed(4)}, {selectedEmergency.location_lng?.toFixed(4)}
              </p>
            </div>
            <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 8 }}>
              <p style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: 4 }}>PATIENT INFO</p>
              <p style={{ fontWeight: 500 }}>Phone: {selectedEmergency.patient_phone || 'N/A'}</p>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Blood: {selectedEmergency.patient_blood_type || 'N/A'} | Allergies: {selectedEmergency.patient_allergies || 'None'}
              </p>
            </div>
          </div>

          {selectedEmergency.description && (
            <div style={{ padding: 12, background: '#FEF3C7', borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Emergency Details:</p>
              <p style={{ fontSize: '0.875rem' }}>{selectedEmergency.description}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button className="btn btn-emergency" style={{ flex: 1 }} onClick={() => openGoogleMaps(selectedEmergency.location_lat, selectedEmergency.location_lng, 'Patient Location')}>
              <Navigation2 size={18} /> Navigate to Patient
            </button>
            <a href={`tel:${selectedEmergency.patient_phone}`} className="btn btn-primary" style={{ padding: '12px 20px' }}>
              <Phone size={18} />
            </a>
          </div>

          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Route size={18} color="#0D9488" /> Recommended Route
            </h4>
            <div style={{ background: '#F0FDFA', padding: 16, borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0D9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>1</div>
                <div>
                  <p style={{ fontWeight: 500 }}>Pick up Patient</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedEmergency.location_address}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
                <ArrowRight size={20} color="#0D9488" style={{ transform: 'rotate(90deg)' }} />
              </div>
              {(() => {
                const { hospital, distance } = getRecommendedHospital(selectedEmergency.location_lat, selectedEmergency.location_lng);
                if (!hospital) return null;
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DC2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>2</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500 }}>{hospital.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{hospital.address}</p>
                      </div>
                      <span className="badge badge-urgent">{distance} km</span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                      if (driverLocation) {
                        openGoogleMapsWithWaypoint(driverLocation.lat, driverLocation.lng, selectedEmergency.location_lat, selectedEmergency.location_lng, hospital.latitude, hospital.longitude, hospital.name);
                      } else {
                        openGoogleMaps(hospital.latitude, hospital.longitude, hospital.name);
                      }
                    }}>
                      <Navigation2 size={16} /> Start Navigation: Patient → {hospital.name}
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hospital size={18} color="#0D9488" /> Nearby Hospitals
            </h4>
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
              {hospitals.filter(h => h.emergency).map(hospital => {
                const dist = calculateDistance(selectedEmergency.location_lat, selectedEmergency.location_lng, hospital.latitude, hospital.longitude);
                const eta = getETAMinutes(dist);
                return (
                  <div key={hospital.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{hospital.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{hospital.beds.available} beds available</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{dist} km • {eta} min</span>
                      <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => openGoogleMaps(hospital.latitude, hospital.longitude, hospital.name)}>
                        <Navigation2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 16 }}>Pending Emergency Requests ({emergencies.length})</h3>
      {emergencies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <Check size={48} color="#10B981" style={{ marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>No Pending Emergencies</h3>
          <p style={{ color: '#64748B' }}>You're all caught up! New requests will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {emergencies.map(emergency => {
            const dist = driverLocation ? calculateDistance(driverLocation.lat, driverLocation.lng, emergency.location_lat, emergency.location_lng) : 0;
            const eta = getETAMinutes(dist);
            return (
              <div key={emergency.id} className="card" style={{ borderColor: '#DC2626', borderLeftWidth: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{emergency.patient_name || 'Unknown Patient'}</h4>
                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{emergency.location_address || 'Location unknown'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-emergency">{dist} km away</span>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>ETA: ~{eta} min</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {emergency.patient_blood_type && (
                    <span style={{ padding: '4px 8px', background: '#FEE2E2', color: '#DC2626', borderRadius: 4, fontSize: '0.75rem' }}>
                      Blood: {emergency.patient_blood_type}
                    </span>
                  )}
                  {emergency.patient_allergies && emergency.patient_allergies !== 'None' && (
                    <span style={{ padding: '4px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: 4, fontSize: '0.75rem' }}>
                      Allergy: {emergency.patient_allergies}
                    </span>
                  )}
                  {emergency.condition_level && (
                    <span style={{ padding: '4px 8px', background: '#FEE2E2', color: '#DC2626', borderRadius: 4, fontSize: '0.75rem' }}>
                      {emergency.condition_level}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-emergency" style={{ flex: 1 }} onClick={() => acceptEmergency(emergency)}>
                    <Check size={16} /> Accept & Navigate
                  </button>
                  <button className="btn btn-outline" onClick={() => openGoogleMaps(emergency.location_lat, emergency.location_lng, 'Patient Location')}>
                    <Navigation2 size={16} />
                  </button>
                  {emergency.patient_phone && (
                    <a href={`tel:${emergency.patient_phone}`} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PublicEmergencyView = () => {
  const [emergencyState, setEmergencyState] = useState('idle');
  const [publicLocation, setPublicLocation] = useState(null);

  const getPublicLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPublicLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          });
        },
        () => {
          setPublicLocation({ lat: 28.6314, lng: 77.2197, address: 'New Delhi - Default' });
        }
      );
    } else {
      setPublicLocation({ lat: 28.6314, lng: 77.2197, address: 'New Delhi - Default' });
    }
  };

  useEffect(() => {
    getPublicLocation();
  }, []);

  const sendEmergency = async () => {
    setEmergencyState('sending');
    try {
      await emergencyAPI.requestPublic({
        patientName: 'Guest',
        patientPhone: null,
        location: publicLocation,
        description: 'Emergency - No additional details'
      });
      setEmergencyState('sent');
      showToast('Emergency alert sent to hospitals and ambulance drivers!', 'success');
    } catch (error) {
      showToast('Failed to send emergency alert', 'error');
      setEmergencyState('idle');
    }
  };

  const calculateDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  if (emergencyState === 'sent') {
    return (
      <div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', textAlign: 'center', padding: 40, marginBottom: 24 }}>
          <Check size={48} style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Emergency Alert Sent!</h2>
          <p style={{ opacity: 0.9, marginBottom: 24 }}>
            Your location has been shared with nearby hospitals and ambulance drivers. Help is on the way.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:102" className="btn" style={{ background: 'white', color: '#059669', fontSize: '1.25rem', padding: '16px 32px' }}>
              <Phone size={24} /> Call 102
            </a>
            <a href="tel:108" className="btn" style={{ background: 'white', color: '#059669', fontSize: '1.25rem', padding: '16px 32px' }}>
              <Phone size={24} /> Call 108
            </a>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hospital size={20} color="#DC2626" /> Emergency-Ready Hospitals Near You
          </h3>
          {publicLocation ? (
            hospitals.filter(h => h.emergency).map(hospital => {
              const dist = calculateDist(publicLocation.lat, publicLocation.lng, hospital.latitude, hospital.longitude);
              return (
                <div key={hospital.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{hospital.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{hospital.address} • {dist} km</p>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => window.location.href = `tel:${hospital.phone}`}>
                    <Phone size={14} /> Call
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#64748B' }}>Location not available</p>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
          Both the hospital and ambulance drivers have been notified of your emergency.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', color: 'white', textAlign: 'center', padding: 40, marginBottom: 24 }}>
        <AlertTriangle size={48} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Medical Emergency?</h2>
        <p style={{ opacity: 0.9, marginBottom: 24 }}>Press the button below to immediately alert nearby hospitals and ambulance drivers with your location.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <a href="tel:102" className="btn" style={{ background: 'white', color: '#DC2626', fontSize: '1.25rem', padding: '16px 32px' }}>
            <Phone size={24} /> Call 102
          </a>
          <a href="tel:108" className="btn" style={{ background: 'white', color: '#DC2626', fontSize: '1.25rem', padding: '16px 32px' }}>
            <Phone size={24} /> Call 108
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        {publicLocation ? (
          <div style={{ marginBottom: 24 }}>
            <div className="card" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: '#F0FDFA', borderColor: '#0D9488' }}>
              <MapPin size={20} color="#0D9488" />
              <span>Location detected: {publicLocation.address}</span>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Detecting your location...</p>
          </div>
        )}

        {emergencyState === 'idle' && (
          <button
            className="btn btn-emergency"
            style={{ width: '100%', maxWidth: 500, padding: '20px', fontSize: '1.2rem' }}
            onClick={sendEmergency}
            disabled={!publicLocation}
          >
            <AlertTriangle size={24} /> Send Emergency Alert — Notify Hospital & Ambulance
          </button>
        )}

        {emergencyState === 'sending' && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Sending emergency alert to hospitals and ambulance drivers...</p>
          </div>
        )}
      </div>

      {publicLocation && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hospital size={20} color="#0D9488" /> Emergency-Ready Hospitals Near You
          </h3>
          {hospitals.filter(h => h.emergency).map(hospital => {
            const dist = calculateDist(publicLocation.lat, publicLocation.lng, hospital.latitude, hospital.longitude);
            return (
              <div key={hospital.id} style={{ padding: 12, border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{hospital.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{hospital.address}</p>
                  </div>
                  <span className="badge badge-normal">{hospital.beds.available} beds</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{dist} km away</span>
                  <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => window.location.href = `tel:${hospital.phone}`}>
                    <Phone size={14} /> Call
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{ marginTop: 24, borderLeft: '4px solid #DC2626', background: '#FEF2F2' }}>
        <h4 style={{ color: '#DC2626', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} /> What Happens Next?
        </h4>
        <ol style={{ color: '#64748B', fontSize: '0.875rem', paddingLeft: 20, lineHeight: 2 }}>
          <li>Your emergency is sent to <strong>all nearby hospitals</strong></li>
          <li>Available <strong>ambulance drivers</strong> are alerted immediately</li>
          <li>The nearest available driver will be dispatched to your location</li>
          <li>Hospital prepares emergency room for your arrival</li>
          <li>Stay calm — help is on the way</li>
        </ol>
      </div>
    </div>
  );
};

const Emergency = () => {
  const { user } = useAuth();
  const [patientLocation, setPatientLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [emergencyStatus, setEmergencyStatus] = useState('idle');
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [patientCondition, setPatientCondition] = useState({
    conscious: true,
    breathing: true,
    bleeding: false,
    chestPain: false,
    description: ''
  });

  useEffect(() => {
    if (user?.role === 'patient') {
      getLocation();
      loadMedicalHistory();
    }
  }, [user]);

  const loadMedicalHistory = async () => {
    try {
      const records = await medicalRecordsAPI.getAll();
      setMedicalHistory(records);
    } catch (error) {
      console.log('No medical records found');
    }
  };

  const getLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPatientLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          });
          setLocationStatus('success');
          showToast('Location detected!', 'success');
        },
        () => {
          setLocationStatus('error');
          showToast('Using default location', 'info');
          setPatientLocation({ lat: 28.6314, lng: 77.2197, address: 'New Delhi - Default' });
        }
      );
    } else {
      setLocationStatus('error');
      showToast('Geolocation not supported', 'error');
    }
  };

  const handleCallHospital = (hospital) => {
    window.location.href = `tel:${hospital.phone}`;
  };

  const handleDispatchAmbulance = async () => {
    if (!patientLocation) {
      showToast('Please enable location first', 'error');
      return;
    }

    setEmergencyStatus('dispatching');
    setLoading(true);

    try {
      const response = await emergencyAPI.request({
        location: patientLocation,
        condition: {
          title: patientCondition.description || 'Emergency',
          level: (patientCondition.bleeding || patientCondition.chestPain) ? 'Critical' : 'Urgent'
        },
        description: patientCondition.description
      });

      setEmergencyStatus('dispatched');
      showToast('Emergency request submitted! Ambulance will be dispatched.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to submit emergency request', 'error');
      setEmergencyStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getETAMinutes = (distance) => {
    const speedKmH = 60;
    return Math.round((distance / speedKmH) * 60);
  };

  return (
    <div style={{ padding: '40px 16px' }}>
      <div className="container">
        <div className="page-header">
          <h1 style={{ color: '#DC2626' }}>Emergency Services</h1>
          <p>
            {!user ? 'Emergency help — no sign-in required' : user?.role === 'patient' ? 'Quick access to emergency medical help in India' : 'Ambulance Driver Emergency Dashboard'}
          </p>
        </div>

        {!user ? (
          <PublicEmergencyView />
        ) : user?.role === 'patient' ? (
          <div className="grid grid-2" style={{ gap: 32 }}>
            <div>
              <PatientEmergencyView 
                user={user}
                patientLocation={patientLocation}
                setPatientLocation={setPatientLocation}
                locationStatus={locationStatus}
                getLocation={getLocation}
                patientCondition={patientCondition}
                setPatientCondition={setPatientCondition}
                emergencyStatus={emergencyStatus}
                setEmergencyStatus={setEmergencyStatus}
                loading={loading}
                handleDispatchAmbulance={handleDispatchAmbulance}
                assignedDriver={assignedDriver}
                calculateDistance={calculateDistance}
                getETAMinutes={getETAMinutes}
                selectedHospital={selectedHospital}
                setSelectedHospital={setSelectedHospital}
                handleCallHospital={handleCallHospital}
              />
            </div>

            <div>
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Nearby Hospitals</h3>
                {hospitals.filter(h => h.emergency).map(hospital => {
                  const distance = patientLocation ? calculateDistance(patientLocation.lat, patientLocation.lng, hospital.latitude, hospital.longitude) : 0;
                  const eta = getETAMinutes(distance);
                  return (
                    <div key={hospital.id} style={{ padding: 16, border: selectedHospital?.id === hospital.id ? '2px solid #0D9488' : '1px solid #E2E8F0', borderRadius: 8, marginBottom: 12, cursor: 'pointer' }} onClick={() => setSelectedHospital(hospital)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <h4 style={{ marginBottom: 4 }}>{hospital.name}</h4>
                          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{hospital.address}</p>
                        </div>
                        <span className="badge badge-normal">{hospital.beds.available} beds</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748B', fontSize: '0.875rem' }}>{distance} km away • ~{eta} min</span>
                        <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={(e) => { e.stopPropagation(); handleCallHospital(hospital); }}>
                          <Phone size={14} />Call
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {user && (user.medical_history || medicalHistory?.length > 0) && (
                <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #0D9488' }}>
                  <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={20} color="#0D9488" /> Medical History Summary
                  </h3>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8 }}>
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 4 }}>BLOOD TYPE</p>
                      <p style={{ fontWeight: 600, fontSize: '1.25rem' }}>{user.blood_type || user.bloodType || 'Not Set'}</p>
                    </div>
                    {user.allergies && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: '0.75rem', color: '#DC2626', marginBottom: 4 }}>ALLERGIES</p>
                        <p style={{ fontWeight: 500, color: '#DC2626' }}>{user.allergies}</p>
                      </div>
                    )}
                    {user.medical_history && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 4 }}>MEDICAL CONDITIONS</p>
                        <p style={{ fontSize: '0.875rem' }}>{user.medical_history}</p>
                      </div>
                    )}
                    {medicalHistory && medicalHistory.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 8 }}>RECENT RECORDS</p>
                        {medicalHistory.slice(0, 3).map((record, idx) => (
                          <div key={idx} style={{ padding: '8px 0', borderBottom: idx < 2 ? '1px solid #E2E8F0' : 'none' }}>
                            <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{record.title}</p>
                            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{record.record_date} • {record.doctor_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 12 }}>
                    <strong>This information will be automatically sent to the hospital and ambulance team.</strong>
                  </p>
                </div>
              )}

              <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #DC2626' }}>
                <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Droplet size={20} color="#DC2626" /> Blood Availability (Nearby)
                </h3>
                {patientLocation ? (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: 12 }}>
                        Looking for blood type: <strong style={{ color: '#DC2626', fontSize: '1.25rem' }}>{user?.blood_type || user?.bloodType || 'Any'}</strong>
                      </p>
                      {hospitals.filter(h => h.emergency && h.bloodBank).map(hospital => {
                        const distance = calculateDistance(patientLocation.lat, patientLocation.lng, hospital.latitude, hospital.longitude);
                        const bloodType = user?.blood_type || user?.bloodType;
                        const bloodAvailable = bloodType ? (hospital.bloodBank[bloodType] || 0) : null;
                        return (
                          <div key={hospital.id} style={{ padding: 12, background: '#FEF2F2', borderRadius: 8, marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{hospital.name}</p>
                                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{distance} km away</p>
                              </div>
                              {bloodAvailable !== null && (
                                <span style={{ 
                                  background: bloodAvailable > 0 ? '#DC2626' : '#9CA3AF', 
                                  color: 'white', 
                                  padding: '4px 12px', 
                                  borderRadius: 4,
                                  fontWeight: 600 
                                }}>
                                  {bloodAvailable} units
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                              {Object.entries(hospital.bloodBank).map(([type, units]) => (
                                <div key={type} style={{ 
                                  textAlign: 'center', 
                                  padding: '4px 8px', 
                                  background: type === bloodType && units > 0 ? '#DC2626' : units > 5 ? '#D1FAE5' : '#FEF3C7',
                                  color: type === bloodType ? 'white' : '#374151',
                                  borderRadius: 4,
                                  fontSize: '0.7rem'
                                }}>
                                  {type}: {units}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 12 }}>Blood Banks Nearby:</p>
                      {bloodBanks.map(bank => {
                        const distance = calculateDistance(patientLocation.lat, patientLocation.lng, bank.latitude, bank.longitude);
                        const bloodType = user?.blood_type || user?.bloodType;
                        const bloodAvailable = bloodType ? (bank.bloodStock[bloodType] || 0) : null;
                        return (
                          <div key={bank.id} style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{bank.name}</p>
                                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{distance} km away • {bank.phone}</p>
                              </div>
                              {bloodAvailable !== null && (
                                <span style={{ 
                                  background: bloodAvailable > 0 ? '#10B981' : '#9CA3AF', 
                                  color: 'white', 
                                  padding: '4px 12px', 
                                  borderRadius: 4,
                                  fontSize: '0.75rem',
                                  fontWeight: 600 
                                }}>
                                  {bloodAvailable} units
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#64748B', textAlign: 'center', padding: 24 }}>
                    Enable location to see blood availability nearby
                  </p>
                )}
              </div>

              <div className="card" style={{ borderColor: '#DC2626', marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Request Ambulance</h3>
                {user && (
                  <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FileText size={16} color="#0D9488" />
                      <span style={{ fontWeight: 500 }}>Medical History will be sent to hospital</span>
                    </div>
                    <p style={{ color: '#64748B' }}>
                      Blood: <strong>{user.blood_type || user.bloodType || 'Not set'}</strong> • Allergies: <strong>{user.allergies || 'None'}</strong>
                    </p>
                  </div>
                )}

                {emergencyStatus === 'idle' && (
                  <button className="btn btn-emergency" style={{ width: '100%', padding: '16px' }} onClick={handleDispatchAmbulance} disabled={!patientLocation}>
                    <Car size={20} />Request Ambulance (102/108)
                  </button>
                )}

                {emergencyStatus === 'dispatching' && (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                    <p>Finding nearest available ambulance...</p>
                  </div>
                )}

                {emergencyStatus === 'dispatched' && (
                  <div style={{ background: '#D1FAE5', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <Check size={32} color="#10B981" style={{ marginBottom: 8 }} />
                    <h4 style={{ color: '#065F46', marginBottom: 8 }}>Ambulance Dispatched!</h4>
                    <p style={{ color: '#065F46', fontSize: '0.875rem' }}>Driver has been notified with your location. Stay calm and wait.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <DriverEmergencyView user={user} />
        )}

        <HospitalEmergencyBroadcast />

      </div>
    </div>
  );
};

const HospitalEmergencyBroadcast = () => {
  const { user } = useAuth();
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchEmergencies();
    pollingRef.current = setInterval(fetchEmergencies, 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const fetchEmergencies = async () => {
    try {
      const data = await emergencyAPI.getAll();
      setActiveEmergencies(data.filter(e => e.status === 'pending' || e.status === 'dispatched'));
    } catch (error) {
      console.error('Failed to fetch emergencies');
    } finally {
      setLoading(false);
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

  if (activeEmergencies.length === 0 && !loading) return null;

  return (
    <section style={{ marginTop: 48 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={24} /> Hospital Emergency Broadcast
        </h2>
        <p>Live active emergencies — visible to all hospitals, doctors, and emergency services</p>
      </div>
      <div className="grid stagger">
        {activeEmergencies.map(emergency => {
          const nearbyHospitals = hospitals.filter(h => h.emergency);
          const sorted = emergency.location_lat ? nearbyHospitals.map(h => ({
            ...h,
            dist: parseFloat(calculateDist(emergency.location_lat, emergency.location_lng, h.latitude, h.longitude))
          })).sort((a, b) => a.dist - b.dist) : [];
          return (
            <div key={emergency.id} className="card" style={{ borderLeft: '6px solid #DC2626', animation: 'pulse 2s infinite' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Ambulance size={20} color="#DC2626" />
                    <h3 style={{ fontSize: '1.1rem' }}>{emergency.patient_name}</h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 500 }}>
                    {new Date(emergency.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="badge" style={{ background: '#DC2626', color: 'white' }}>{emergency.status.toUpperCase()}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: '0.875rem', color: '#64748B' }}>
                {emergency.patient_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} /> {emergency.patient_phone}
                  </div>
                )}
                {emergency.patient_blood_type && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Droplet size={14} color="#DC2626" /> Blood: {emergency.patient_blood_type}
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
                {emergency.location_lat && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Navigation size={14} /> {emergency.location_lat.toFixed(4)}, {emergency.location_lng.toFixed(4)}
                  </div>
                )}
              </div>

              {emergency.description && (
                <p style={{ fontSize: '0.875rem', marginBottom: 12, padding: 8, background: '#FEF2F2', borderRadius: 6 }}>{emergency.description}</p>
              )}

              {sorted.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: 8 }}>NEARBY HOSPITALS:</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {sorted.slice(0, 3).map(h => (
                      <span key={h.id} style={{ fontSize: '0.75rem', background: '#F0FDFA', color: '#0D9488', padding: '4px 8px', borderRadius: 4, fontWeight: 500 }}>
                        {h.name} ({h.dist} km)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href="tel:102" className="btn btn-emergency" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Phone size={14} /> Call 102
                </a>
                <a href="tel:108" className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#DC2626', color: 'white' }}>
                  <Phone size={14} /> Call 108
                </a>
                {emergency.patient_phone && (
                  <a href={`tel:${emergency.patient_phone}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Phone size={14} /> Contact Patient
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Emergency;
