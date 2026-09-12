import React, { useState } from 'react';
import {
  Utensils,
  Sun,
  Moon,
  ShieldCheck,
  Server,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  MapPin,
  Truck,
  Building,
  Heart,
  Smile,
  Menu,
  X,
  Volume2,
  VolumeX,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sounds } from '../services/soundService';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { currentUser, currentRole, switchRole, logout, theme, toggleTheme, isBackendOnline, verifyBackendHealth } = useAuth();
  const { addToast } = useToast();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      sounds.playSuccessChime();
      addToast('🔊 Sound chimes enabled', 'info');
    } else {
      addToast('🔇 Sound chimes muted', 'info');
    }
  };

  const roles = [
    { key: 'DONOR', label: 'Food Donor', icon: Utensils, color: 'var(--role-donor)', bg: 'var(--role-donor-bg)' },
    { key: 'NGO', label: 'Shelter / NGO', icon: Building, color: 'var(--role-ngo)', bg: 'var(--role-ngo-bg)' },
    { key: 'VOLUNTEER', label: 'Delivery Hero', icon: Truck, color: 'var(--role-volunteer)', bg: 'var(--role-volunteer-bg)' },
    { key: 'ADMIN', label: 'Community Lead', icon: ShieldCheck, color: 'var(--role-admin)', bg: 'var(--role-admin-bg)' }
  ];

  const handleRoleChange = (roleKey) => {
    switchRole(roleKey);
    setShowRoleMenu(false);
    setIsMobileMenuOpen(false);
    sounds.playPop();
    addToast(`Switched view to ${roleKey} portal`, 'info');
  };

  const navLinks = [
    { id: 'home', label: 'Overview', icon: Heart },
    { id: 'donor', label: 'Share Food', icon: Utensils },
    { id: 'ngo', label: 'Find Meals', icon: Building },
    { id: 'volunteer', label: 'Food Heroes', icon: Truck },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'admin', label: 'Community Impact', icon: ShieldCheck }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    sounds.playPop();
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.85rem 0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #22c55e 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
            flexShrink: 0
          }}>
            🍲
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                SHERO<span style={{ color: '#16a34a' }}>-NourishNet</span>
              </span>
              <span className="badge badge-available desktop-only" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                <Heart size={11} fill="#15803d" /> Sharing Joy
              </span>
            </div>
            <p className="desktop-only" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Sharing Extra Food • Feeding Communities
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--primary-500)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 600,
                  padding: '0.45rem 0.9rem',
                  boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                  border: 'none',
                  fontSize: '0.85rem'
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          {/* Audio Chime Mute/Unmute Toggle */}
          <button
            onClick={toggleSound}
            className="btn btn-sm btn-ghost"
            style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }}
            title={soundEnabled ? 'Mute Sound Chimes' : 'Enable Sound Chimes'}
          >
            {soundEnabled ? <Volume2 size={16} color="var(--primary-600)" /> : <VolumeX size={16} color="var(--text-muted)" />}
          </button>

          {/* Backend Status Indicator */}
          <button
            onClick={() => {
              verifyBackendHealth();
              sounds.playPop();
              addToast(isBackendOnline ? 'Connected to live database' : 'Running smoothly in community demo mode', isBackendOnline ? 'success' : 'info');
            }}
            title={isBackendOnline ? 'Live Backend Connected' : 'Demo & Local Storage Sync'}
            className="btn btn-sm desktop-only"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: isBackendOnline ? '#dcfce7' : '#fffbeb',
              border: `1px solid ${isBackendOnline ? '#86efac' : '#fde68a'}`,
              color: isBackendOnline ? '#15803d' : '#b45309',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isBackendOnline ? '#16a34a' : '#f59e0b'
            }} />
            {isBackendOnline ? 'Live Sync' : 'Demo Mode'}
          </button>

          {/* Quick Role Switcher */}
          <div style={{ position: 'relative' }} className="desktop-only">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`role-badge ${currentRole}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                padding: '0.45rem 0.85rem'
              }}
            >
              <span>View: <strong>{currentRole}</strong></span>
              <ChevronDown size={14} />
            </button>

            {showRoleMenu && (
              <div
                className="glass-panel animate-fade-in"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '220px',
                  padding: '0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  zIndex: 200,
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ padding: '0.3rem 0.6rem', fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                  Switch Community View
                </div>
                {roles.map(r => {
                  const Icon = r.icon;
                  const isSelected = currentRole === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => handleRoleChange(r.key)}
                      className="btn btn-sm btn-ghost"
                      style={{
                        justifyContent: 'flex-start',
                        background: isSelected ? r.bg : 'transparent',
                        color: isSelected ? r.color : 'var(--text-primary)',
                        fontWeight: isSelected ? 800 : 600,
                        padding: '0.55rem 0.8rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Icon size={16} color={r.color} />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              sounds.playPop();
            }}
            className="btn btn-sm btn-ghost"
            style={{ padding: '0.55rem', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }}
            title={theme === 'dark' ? 'Switch to Warm Sunshine Mode' : 'Switch to Cozy Evening Mode'}
          >
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#475569" />}
          </button>

          {/* User Profile / Auth */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{currentUser.avatar || '👤'}</span>
                <span className="desktop-only" style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {showUserMenu && (
                <div
                  className="glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '240px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 200,
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800 }}>{currentUser.name}</p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{currentUser.email}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary-600)', marginTop: '2px', fontWeight: 700 }}>
                      Role: {currentUser.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      sounds.playPop();
                      addToast('Signed out', 'info');
                    }}
                    className="btn btn-sm btn-danger"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
              <User size={15} />
              <span className="desktop-only">Join / Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn btn-sm btn-ghost mobile-only"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)' }}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer animate-fade-in"
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-page)',
            zIndex: 9999,
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto'
          }}
        >
          {/* Quick Role Selector for Mobile */}
          <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Switch Community Role:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = currentRole === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => handleRoleChange(r.key)}
                    className="btn btn-sm"
                    style={{
                      background: isSelected ? r.bg : 'var(--bg-surface-elevated)',
                      color: isSelected ? r.color : 'var(--text-secondary)',
                      borderColor: isSelected ? r.color : 'var(--border-subtle)',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <Icon size={14} color={r.color} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', paddingLeft: '4px' }}>
              Navigation:
            </span>
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="btn"
                  style={{
                    justifyContent: 'flex-start',
                    background: isActive ? 'var(--primary-500)' : 'var(--bg-surface)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 700,
                    padding: '0.85rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
                  }}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Sync Status for Mobile */}
          <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isBackendOnline ? '#16a34a' : '#f59e0b' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {isBackendOnline ? 'Backend Online (:5000)' : 'Local Storage Sync Active'}
              </span>
            </div>
            <button
              onClick={() => {
                verifyBackendHealth();
                sounds.playPop();
              }}
              className="btn btn-sm btn-ghost"
            >
              Verify
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

