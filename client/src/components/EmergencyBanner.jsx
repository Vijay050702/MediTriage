import { Link } from 'react-router-dom';
import { AlertTriangle, Phone, ExternalLink } from 'lucide-react';

const EmergencyBanner = () => {
  return (
    <div className="emergency-banner">
      <AlertTriangle size={16} style={{ marginRight: 8, display: 'inline' }} />
      In case of life-threatening emergency, call{' '}
      <strong>102</strong> or <strong>108</strong> or{' '}
      <Link to="/emergency" style={{ color: '#FFD700', textDecoration: 'underline', fontWeight: 600 }}>
        Click here for Emergency Services <ExternalLink size={12} style={{ display: 'inline' }} />
      </Link>
      <Phone size={14} style={{ marginLeft: 8 }} />
    </div>
  );
};

export default EmergencyBanner;
