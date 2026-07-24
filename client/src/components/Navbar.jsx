import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Heart, LogOut, User, LayoutDashboard, Activity, Calendar, Ambulance, FileText, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/signin';
    setMobileOpen(false);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const renderNavLinks = () => {
    switch(user?.role) {
      case 'patient':
        return (
          <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={handleNavClick}>
              <LayoutDashboard size={18} style={{ marginRight: 6 }} />
              Dashboard
            </Link>
            <Link to="/symptoms" className={isActive('/symptoms') ? 'active' : ''} onClick={handleNavClick}>
              <Activity size={18} style={{ marginRight: 6 }} />
              Symptoms
            </Link>
            <Link to="/appointments" className={isActive('/appointments') ? 'active' : ''} onClick={handleNavClick}>
              <Calendar size={18} style={{ marginRight: 6 }} />
              Appointments
            </Link>
            <Link to="/medical-history" className={isActive('/medical-history') ? 'active' : ''} onClick={handleNavClick}>
              <FileText size={18} style={{ marginRight: 6 }} />
              History
            </Link>
            <Link to="/emergency" className={isActive('/emergency') ? 'active' : ''} style={{ color: '#DC2626' }} onClick={handleNavClick}>
              <Ambulance size={18} style={{ marginRight: 6 }} />
              Emergency
            </Link>
          </>
        );
      case 'doctor':
        return (
          <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={handleNavClick}>
              <LayoutDashboard size={18} style={{ marginRight: 6 }} />
              Dashboard
            </Link>
            <Link to="/patients" className={isActive('/patients') ? 'active' : ''} onClick={handleNavClick}>
              <User size={18} style={{ marginRight: 6 }} />
              Patients
            </Link>
          </>
        );
      case 'driver':
        return (
          <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={handleNavClick}>
              <LayoutDashboard size={18} style={{ marginRight: 6 }} />
              Dashboard
            </Link>
            <Link to="/emergency" className={isActive('/emergency') ? 'active' : ''} style={{ color: '#DC2626' }} onClick={handleNavClick}>
              <Ambulance size={18} style={{ marginRight: 6 }} />
              Emergency Requests
            </Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={handleNavClick}>
              <LayoutDashboard size={18} style={{ marginRight: 6 }} />
              Dashboard
            </Link>
            <Link to="/hospital-dashboard" className={isActive('/hospital-dashboard') ? 'active' : ''} onClick={handleNavClick}>
              <Building2 size={18} style={{ marginRight: 6 }} />
              Hospitals
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = () => {
    switch(user?.role) {
      case 'patient':
        return <span style={{ fontSize: '0.7rem', background: 'linear-gradient(135deg, #0D9488, #0F766E)', color: 'white', padding: '2px 8px', borderRadius: 6 }}>Patient</span>;
      case 'doctor':
        return <span style={{ fontSize: '0.7rem', background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white', padding: '2px 8px', borderRadius: 6 }}>Doctor</span>;
      case 'driver':
        return <span style={{ fontSize: '0.7rem', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: 'white', padding: '2px 8px', borderRadius: 6 }}>Driver</span>;
      case 'admin':
        return <span style={{ fontSize: '0.7rem', background: 'linear-gradient(135deg, #0D9488, #0F766E)', color: 'white', padding: '2px 8px', borderRadius: 6 }}>Admin</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
          <Heart size={28} />
          MediTriage
        </Link>

        {user && (
          <button
            className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <div className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        )}
        
        {user && (
          <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
            {renderNavLinks()}
          </div>
        )}

        <div className="navbar-user">
          <Link to="/emergency" className="btn" style={{ background: '#DC2626', color: 'white', padding: '8px 16px', marginRight: 12, fontWeight: 600, animation: 'pulse 2s infinite' }}>
            <Ambulance size={16} style={{ marginRight: 6 }} />
            SOS Emergency
          </Link>
          {user ? (
            <>
              <NotificationBell />
              <div className="avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user.name}</span>
                {getRoleBadge()}
              </div>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px 16px', marginLeft: 8 }}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/signin?role=patient" className="btn btn-primary">
              <User size={16} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
