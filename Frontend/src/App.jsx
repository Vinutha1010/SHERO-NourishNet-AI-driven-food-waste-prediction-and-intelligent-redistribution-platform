import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/Navbar';
import { HomeOverview } from './views/HomeOverview';
import { DonorDashboard } from './views/DonorDashboard';
import { NgoDashboard } from './views/NgoDashboard';
import { VolunteerDashboard } from './views/VolunteerDashboard';
import { LiveTrackingView } from './views/LiveTrackingView';
import { AdminDashboard } from './views/AdminDashboard';
import { AuthModal } from './views/AuthModal';
import { Heart, Sparkles, Shield, Code2, Globe } from 'lucide-react';

function MainAppContent() {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeOverview setActiveTab={setActiveTab} onOpenAuth={() => setIsAuthOpen(true)} />;
      case 'donor':
        return <DonorDashboard />;
      case 'ngo':
        return <NgoDashboard />;
      case 'volunteer':
        return <VolunteerDashboard />;
      case 'map':
        return <LiveTrackingView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomeOverview setActiveTab={setActiveTab} onOpenAuth={() => setIsAuthOpen(true)} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Viewport Content */}
      <main style={{ flex: 1 }}>
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2.5rem 0 2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🍲</span>
            <div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>SHERO-NourishNet</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                AI-Driven Surplus Food Waste Prediction & Intelligent Redistribution Platform
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('donor')}
              className="btn btn-ghost btn-sm"
            >
              Donor Portal
            </button>
            <button
              onClick={() => setActiveTab('ngo')}
              className="btn btn-ghost btn-sm"
            >
              NGO Marketplace
            </button>
            <button
              onClick={() => setActiveTab('volunteer')}
              className="btn btn-ghost btn-sm"
            >
              Logistics Dispatch
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="btn btn-ghost btn-sm"
            >
              Impact Metrics
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span>Built with care for zero hunger & food rescue</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
          </div>

        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRole={currentRole}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
