import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Clock, Thermometer } from 'lucide-react';

export const SafetyBadge = ({ expiryTime, storageCondition, showDetails = false }) => {
  if (!expiryTime) return null;

  const now = new Date();
  const expiry = new Date(expiryTime);
  const diffHours = (expiry - now) / (1000 * 60 * 60);

  let status = 'safe';
  let label = 'Safe & Fresh';
  let badgeClass = 'badge-available';
  let icon = <ShieldCheck size={13} />;

  if (diffHours <= 0) {
    status = 'expired';
    label = 'Expired';
    badgeClass = 'badge-expired';
    icon = <XCircle size={13} />;
  } else if (diffHours <= 2.5) {
    status = 'urgent';
    label = `Urgent (${Math.round(diffHours * 60)}m left)`;
    badgeClass = 'badge-reserved';
    icon = <AlertTriangle size={13} />;
  } else {
    label = `Fresh (~${Math.round(diffHours)}h left)`;
  }

  const getStorageBadge = () => {
    switch (storageCondition) {
      case 'HOT_INSULATED':
        return { label: '>65°C Insulated', color: '#f97316' };
      case 'REFRIGERATED':
        return { label: '<4°C Chilled', color: '#38bdf8' };
      case 'FROZEN':
        return { label: '<-18°C Frozen', color: '#818cf8' };
      default:
        return { label: 'Room Temp', color: '#94a3b8' };
    }
  };

  const storage = getStorageBadge();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <span className={`badge ${badgeClass}`}>
        {icon}
        <span>{label}</span>
      </span>

      {showDetails && (
        <span
          className="badge"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderColor: 'var(--border-subtle)',
            color: storage.color,
            fontSize: '0.7rem'
          }}
        >
          <Thermometer size={11} />
          <span>{storage.label}</span>
        </span>
      )}
    </div>
  );
};
