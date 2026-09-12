import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Play,
  Check,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Heart,
  Smile,
  Activity,
  Radio,
  Crosshair,
  Gauge,
  Award,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import { sounds } from '../services/soundService';
import { api } from '../services/api';
import { LiveMap } from '../components/LiveMap';
import { ImpactCertificate } from '../components/ImpactCertificate';
import confetti from 'canvas-confetti';

export const VolunteerDashboard = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { userLocation, isWatchingLive, startLiveTracking, stopLiveTracking, detectLiveLocation } = useLocation();

  const [deliveries, setDeliveries] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);

  // Live GPS Tracking & Simulation state
  const [gpsMode, setGpsMode] = useState('DEVICE'); // 'DEVICE' | 'SIMULATION' | 'OFF'
  const [simulatedCoord, setSimulatedCoord] = useState({ lat: 12.9609, lng: 77.6387 });
  const [telemetry, setTelemetry] = useState({ speed: 0, accuracy: 12, heading: 0, lastPing: 'Just now' });

  const volunteerId = currentUser?.user_id || 5;

  const loadData = async () => {
    setLoading(true);
    try {
      const myDels = await api.getDeliveries({ volunteer_id: volunteerId });
      const acceptedReqs = await api.getRequests({ status: 'ACCEPTED' });
      
      setDeliveries(myDels);
      setAvailableRequests(acceptedReqs);

      const active = myDels.find(d => d.status !== 'DELIVERED') || myDels[0];
      setActiveDelivery(active || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [volunteerId]);

  // Real Device GPS Tracking Listener
  useEffect(() => {
    if (gpsMode === 'DEVICE' && activeDelivery && activeDelivery.status !== 'DELIVERED') {
      startLiveTracking((pos) => {
        setTelemetry({
          speed: pos.speed || 0,
          accuracy: pos.accuracy || 10,
          heading: pos.heading || 0,
          lastPing: new Date().toLocaleTimeString()
        });
        if (activeDelivery) {
          api.recordLocation(activeDelivery.delivery_id, pos.latitude, pos.longitude);
        }
      });
    } else if (gpsMode !== 'DEVICE') {
      stopLiveTracking();
    }
    return () => stopLiveTracking();
  }, [gpsMode, activeDelivery]);

  // GPS Simulation Interval (for demo / desktop testing)
  useEffect(() => {
    let timer;
    if (gpsMode === 'SIMULATION' && activeDelivery && activeDelivery.status !== 'DELIVERED') {
      timer = setInterval(() => {
        setSimulatedCoord(prev => {
          const nextLat = prev.lat - 0.0015;
          const nextLng = prev.lng - 0.0008;
          api.recordLocation(activeDelivery.delivery_id, nextLat, nextLng);
          setTelemetry({
            speed: Math.round(22 + Math.random() * 8),
            accuracy: 8,
            heading: 195,
            lastPing: new Date().toLocaleTimeString()
          });
          return { lat: nextLat, lng: nextLng };
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [gpsMode, activeDelivery]);

  const handleClaimRequest = async (requestId) => {
    try {
      await api.assignDelivery(requestId, volunteerId);
      sounds.playSuccessChime();
      addToast('Route claimed! You are the designated Food Hero for this run.', 'success');
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to claim delivery', 'error');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeDelivery) return;
    try {
      await api.updateDeliveryStatus(activeDelivery.delivery_id, newStatus);
      sounds.playPop();
      addToast(`Delivery progress updated!`, 'success');

      if (newStatus === 'DELIVERED') {
        setGpsMode('OFF');
        stopLiveTracking();
        sounds.playSuccessChime();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        addToast('🎉 Awesome job! Warm meals safely delivered to the shelter.', 'success');
      }

      loadData();
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  const stages = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
  const stageLabels = {
    ASSIGNED: '1. Route Assigned',
    PICKED_UP: '2. Food Collected',
    IN_TRANSIT: '3. On The Way',
    DELIVERED: '4. Delivered with Love'
  };
  const currentStageIndex = activeDelivery ? stages.indexOf(activeDelivery.status) : 0;

  // Compute active position for map
  const activePosition = gpsMode === 'DEVICE' && userLocation?.latitude
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : simulatedCoord;

  const totalKgDelivered = deliveries
    .filter(d => d.status === 'DELIVERED')
    .reduce((sum, d) => sum + (parseFloat(d.quantity) || 25), 0) || 75;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="role-badge VOLUNTEER">DELIVERY HERO</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Live Dispatch & Neighborhood Courier</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
            {currentUser?.name || "Priya Sharma (Green Rider)"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            <Phone size={15} style={{ display: 'inline', marginRight: '4px', color: 'var(--role-volunteer)' }} />
            {currentUser?.phone || "+91 99000 88776"} • 🛵 Live Eco-Rider GPS Dispatch Active
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCert(true)}
            className="btn btn-outline btn-sm"
            style={{ borderColor: 'var(--role-volunteer)', color: 'var(--role-volunteer)' }}
          >
            <Award size={15} />
            <span>Food Hero Certificate</span>
          </button>
          
          <button onClick={loadData} className="btn btn-outline btn-sm">
            <RefreshCw size={15} />
            <span>Refresh Runs</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Trip & Available Runs */}
      <div className="grid-3" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* Left 2 Columns: Active Delivery Cockpit & Map */}
        <div style={{ gridColumn: 'span 2' }}>
          
          {activeDelivery ? (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1.5px solid var(--role-volunteer-border)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <span className="badge badge-in_transit" style={{ marginBottom: '6px' }}>
                    Active Delivery Run #{activeDelivery.delivery_id}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activeDelivery.food_name}
                  </h2>
                </div>

                {/* GPS Mode Selector */}
                <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setGpsMode('DEVICE');
                      sounds.playPop();
                      addToast('🛰️ Live Device GPS Tracking enabled', 'success');
                    }}
                    className="btn btn-sm"
                    style={{
                      background: gpsMode === 'DEVICE' ? '#0284c7' : 'transparent',
                      color: gpsMode === 'DEVICE' ? '#ffffff' : 'var(--text-secondary)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.775rem',
                      fontWeight: 700
                    }}
                  >
                    <Radio size={13} />
                    <span>Live Device GPS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGpsMode('SIMULATION');
                      sounds.playPop();
                      addToast('🛵 Route Movement Simulator started', 'info');
                    }}
                    className="btn btn-sm"
                    style={{
                      background: gpsMode === 'SIMULATION' ? '#f59e0b' : 'transparent',
                      color: gpsMode === 'SIMULATION' ? '#ffffff' : 'var(--text-secondary)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.775rem',
                      fontWeight: 700
                    }}
                  >
                    <Navigation size={13} />
                    <span>Demo Simulator</span>
                  </button>
                </div>
              </div>

              {/* Live Telemetry Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.25rem',
                background: 'var(--role-volunteer-bg)',
                border: '1px solid var(--role-volunteer-border)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', animation: 'pulseGlow 1.5s infinite' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--role-volunteer)' }}>
                    {gpsMode === 'DEVICE' ? 'Live GPS Stream Active' : gpsMode === 'SIMULATION' ? 'Simulation Active' : 'GPS Standby'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Speed: </span>
                    <strong>{telemetry.speed} km/h</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Precision: </span>
                    <strong>±{telemetry.accuracy}m</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Ping: </span>
                    <strong>{telemetry.lastPing}</strong>
                  </div>
                </div>
              </div>

              {/* Progress Step Tracker */}
              <div className="step-tracker">
                {stages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isActive = idx === currentStageIndex;

                  return (
                    <div
                      key={stage}
                      className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    >
                      <div className="step-circle">
                        {isCompleted ? <Check size={18} /> : idx + 1}
                      </div>
                      <span className="step-label">{stageLabels[stage]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons to Advance Stage */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.75rem 0' }}>
                {activeDelivery.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleUpdateStatus('PICKED_UP')}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, background: 'var(--role-volunteer)', borderColor: 'var(--role-volunteer)' }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Confirm Food Collection from Donor</span>
                  </button>
                )}

                {activeDelivery.status === 'PICKED_UP' && (
                  <button
                    onClick={() => handleUpdateStatus('IN_TRANSIT')}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, background: 'var(--role-volunteer)', borderColor: 'var(--role-volunteer)' }}
                  >
                    <Navigation size={18} />
                    <span>Start Riding to Shelter</span>
                  </button>
                )}

                {activeDelivery.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1, background: '#16a34a', borderColor: '#16a34a' }}
                  >
                    <Heart size={18} fill="#ffffff" />
                    <span>Confirm Safe Delivery to Shelter</span>
                  </button>
                )}

                {activeDelivery.status === 'DELIVERED' && (
                  <div style={{ padding: '1rem', background: 'var(--badge-avail-bg)', border: '1.5px solid var(--badge-avail-border)', borderRadius: 'var(--radius-md)', width: '100%', textAlign: 'center', color: 'var(--badge-avail-text)', fontWeight: 800, fontSize: '1rem' }}>
                    🎉 Delivery Complete! Thank you for being a Food Hero today.
                  </div>
                )}
              </div>

              {/* Pickup & Dropoff Routing Details with 1-Click Navigation */}
              <div className="grid-2" style={{ gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ padding: '1.25rem', background: 'var(--role-donor-bg)', border: '1px solid var(--role-donor-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--role-donor)', fontWeight: 800, textTransform: 'uppercase' }}>
                      1. Pickup (Donor Kitchen)
                    </span>
                    <p style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-primary)' }}>{activeDelivery.donor_name}</p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{activeDelivery.donor_address}</p>
                  </div>
                  
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.donor_address || 'MG Road Bengaluru')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--role-donor-border)',
                      color: 'var(--role-donor)',
                      fontWeight: 700,
                      width: 'fit-content'
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Navigate to Pickup</span>
                  </a>
                </div>

                <div style={{ padding: '1.25rem', background: 'var(--role-ngo-bg)', border: '1px solid var(--role-ngo-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--role-ngo)', fontWeight: 800, textTransform: 'uppercase' }}>
                      2. Drop-off (Recipient Shelter)
                    </span>
                    <p style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '4px', color: 'var(--text-primary)' }}>{activeDelivery.ngo_name}</p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{activeDelivery.ngo_address}</p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.ngo_address || 'Koramangala Bengaluru')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--role-ngo-border)',
                      color: 'var(--role-ngo)',
                      fontWeight: 700,
                      width: 'fit-content'
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Navigate to Shelter</span>
                  </a>
                </div>
              </div>

              {/* Integrated Live Route Map */}
              <div style={{ marginTop: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <Navigation size={18} color="var(--role-volunteer)" />
                  <span>Live Journey Map</span>
                </h4>

                <LiveMap
                  deliveries={[{
                    ...activeDelivery,
                    current_lat: activePosition.lat,
                    current_lng: activePosition.lng
                  }]}
                  activeDeliveryId={activeDelivery.delivery_id}
                  height="340px"
                />
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', marginBottom: '2rem' }}>
              <Truck size={44} color="var(--role-volunteer)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Active Run Selected</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: '0.5rem auto' }}>
                Claim an open food route from the available jobs on the right to start making deliveries.
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Available Runs & History */}
        <div style={{ gridColumn: 'span 1' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Available Runs</h3>
              <span className="badge badge-available">{availableRequests.length} Ready</span>
            </div>

            {availableRequests.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No unassigned routes right now.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                {availableRequests.map(req => (
                  <div
                    key={req.request_id}
                    style={{
                      padding: '1.1rem',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                      {req.food_name}
                    </strong>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                      <p>From: <strong>{req.donor_name}</strong></p>
                      <p>To: <strong>{req.ngo_name}</strong></p>
                      <p style={{ color: 'var(--role-donor)', fontWeight: 800, marginTop: '2px' }}>
                        Load: {req.requested_quantity} kg
                      </p>
                    </div>

                    <button
                      onClick={() => handleClaimRequest(req.request_id)}
                      className="btn btn-sm"
                      style={{
                        width: '100%',
                        marginTop: '0.85rem',
                        background: 'var(--role-volunteer)',
                        color: '#ffffff',
                        fontWeight: 800
                      }}
                    >
                      <Truck size={14} />
                      <span>Accept Route & Deliver</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Log */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>My Delivery History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {deliveries.map(del => {
                const isActive = activeDelivery?.delivery_id === del.delivery_id;
                return (
                  <div
                    key={del.delivery_id}
                    onClick={() => {
                      setActiveDelivery(del);
                      sounds.playPop();
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      background: isActive ? 'var(--role-volunteer-bg)' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${isActive ? 'var(--role-volunteer)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Run #{del.delivery_id}</strong>
                      <span className={`badge badge-${del.status.toLowerCase()}`}>
                        {del.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {del.food_name} ({del.quantity || 25} kg)
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Volunteer Food Hero Certificate Modal */}
      <ImpactCertificate
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        userName={currentUser?.name || "Priya Sharma"}
        role="COMMUNITY DELIVERY HERO"
        totalKg={totalKgDelivered}
        meals={Math.round(totalKgDelivered * 2.5)}
        co2={Math.round(totalKgDelivered * 2.5)}
      />

    </div>
  );
};

