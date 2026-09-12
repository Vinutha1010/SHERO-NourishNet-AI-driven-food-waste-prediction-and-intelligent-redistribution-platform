import React, { useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, Sparkles, Check, ArrowRight, Heart, Crosshair } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import { Modal } from '../components/Modal';
import { INITIAL_USERS } from '../services/mockData';

export const AuthModal = ({ isOpen, onClose, defaultRole = 'DONOR' }) => {
  const { login, register, setCurrentUser } = useAuth();
  const { addToast } = useToast();
  const { detectLiveLocation, isDetecting } = useLocation();

  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '+91 98765 43210',
    role: defaultRole,
    address: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        addToast('Welcome back! Ready to share goodness.', 'success');
      } else {
        await register(formData);
        addToast('Welcome to SHERO-NourishNet! Account created.', 'success');
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUser = (user) => {
    setCurrentUser(user);
    addToast(`Signed in as ${user.name} (${user.role})`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Welcome Back!' : 'Join Our Food Sharing Family'}
      subtitle={mode === 'login' ? 'Pick a 1-click test persona or sign in below' : 'Connect with donors, shelters, and riders in your city'}
      maxWidth="560px"
    >
      {/* 1-Click Demo Profiles */}
      <div style={{ marginBottom: '1.5rem', padding: '1.1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem', fontSize: '0.825rem', fontWeight: 800, color: 'var(--accent-warm)', textTransform: 'uppercase' }}>
          <Sparkles size={15} />
          <span>Instant 1-Click Demo Personas</span>
        </div>

        <div className="grid-2" style={{ gap: '0.6rem' }}>
          {INITIAL_USERS.slice(0, 4).map(u => (
            <button
              key={u.user_id}
              type="button"
              onClick={() => handleQuickDemoUser(u)}
              className="btn btn-sm btn-ghost"
              style={{
                justifyContent: 'flex-start',
                padding: '0.6rem 0.75rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{u.avatar}</span>
              <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                <strong style={{ display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', color: 'var(--text-primary)' }}>{u.name}</strong>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role: {u.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setMode('login')}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: 'transparent',
            border: 'none',
            borderBottom: `2.5px solid ${mode === 'login' ? '#16a34a' : 'transparent'}`,
            color: mode === 'login' ? '#16a34a' : 'var(--text-secondary)',
            fontWeight: mode === 'login' ? 800 : 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          style={{
            flex: 1,
            padding: '0.65rem',
            background: 'transparent',
            border: 'none',
            borderBottom: `2.5px solid ${mode === 'register' ? '#16a34a' : 'transparent'}`,
            color: mode === 'register' ? '#16a34a' : 'var(--text-secondary)',
            fontWeight: mode === 'register' ? 800 : 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Join as New Member
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name / Organization Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="e.g. Grandma's Bakery or Sunshine Shelter"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
            placeholder="e.g. contact@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-input"
          />
        </div>

        {mode === 'register' && (
          <>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Community Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="form-select"
                >
                  <option value="DONOR">Food Donor (Restaurant / Hotel / Family)</option>
                  <option value="NGO">NGO / Food Bank / Shelter</option>
                  <option value="VOLUNTEER">Delivery Hero (Volunteer Courier)</option>
                  <option value="ADMIN">Community Coordinator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Neighborhood / Address *</label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      addToast('Detecting your live device GPS location...', 'info');
                      const pos = await detectLiveLocation();
                      setFormData(prev => ({
                        ...prev,
                        address: pos.address,
                        latitude: pos.latitude,
                        longitude: pos.longitude
                      }));
                      addToast(`📍 Location detected: ${pos.address}`, 'success');
                    } catch (err) {
                      addToast(err.message, 'error');
                    }
                  }}
                  disabled={isDetecting}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                >
                  <Crosshair size={12} className={isDetecting ? 'animate-spin' : ''} />
                  <span>{isDetecting ? 'Detecting...' : '📍 Auto-detect GPS'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input"
                placeholder="e.g. HSR Layout, Sector 2, Bengaluru"
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            <span>{loading ? 'Opening...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </Modal>
  );
};
