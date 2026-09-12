import React, { useState, useEffect } from 'react';
import { Compass, Layers, Truck, Building, Utensils, RefreshCw, MapPin, Heart, Crosshair } from 'lucide-react';
import { LiveMap } from '../components/LiveMap';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const LiveTrackingView = () => {
  const { userLocation, detectLiveLocation, isDetecting } = useLocation();
  const { addToast } = useToast();

  const [foodItems, setFoodItems] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const foods = await api.getFood();
      const dels = await api.getDeliveries();
      const allUsers = await api.getAdminUsers('NGO');
      
      setFoodItems(foods);
      setDeliveries(dels);
      setNgos(allUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeDeliveriesCount = deliveries.filter(d => d.status === 'IN_TRANSIT' || d.status === 'ASSIGNED').length;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-in_transit">LIVE COMMUNITY MAP</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {userLocation?.isLive ? `📍 Your GPS: ${userLocation.address}` : 'Bengaluru City Hub'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
            Live Food Sharing Map
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            See where good food is being prepared, which shelters need it, and our riders on the move.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={async () => {
              try {
                addToast('Detecting your live GPS location...', 'info');
                const pos = await detectLiveLocation();
                addToast(`📍 Centered on your live location: ${pos.address}`, 'success');
              } catch (err) {
                addToast(err.message, 'error');
              }
            }}
            disabled={isDetecting}
            className="btn btn-outline btn-sm"
            style={{ borderColor: '#0284c7', color: '#0284c7' }}
          >
            <Crosshair size={14} className={isDetecting ? 'animate-spin' : ''} />
            <span>{isDetecting ? 'Detecting...' : userLocation?.isLive ? 'Live GPS Active' : 'Locate Me'}</span>
          </button>

          <button onClick={loadData} className="btn btn-outline btn-sm">
            <RefreshCw size={15} />
            <span>Refresh Map</span>
          </button>
        </div>
      </div>

      {/* Map Card */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--role-donor)' }} />
              <strong style={{ color: 'var(--text-primary)' }}>{foodItems.length} Food Donations</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--role-ngo)' }} />
              <strong style={{ color: 'var(--text-primary)' }}>{ngos.length} Shelter Hubs</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--role-volunteer)' }} />
              <strong style={{ color: 'var(--text-primary)' }}>{activeDeliveriesCount} Riders on the Move</strong>
            </div>
          </div>
        </div>

        <LiveMap
          foodItems={foodItems}
          deliveries={deliveries}
          ngos={ngos}
          height="520px"
          onSelectDelivery={(del) => setSelectedDelivery(del)}
        />
      </div>

      {/* Selected Delivery Details if any */}
      {selectedDelivery && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', border: '2px solid var(--role-volunteer-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Viewing Run #{selectedDelivery.delivery_id}: {selectedDelivery.food_name}
            </h3>
            <span className={`badge badge-${selectedDelivery.status.toLowerCase()}`}>
              {selectedDelivery.status}
            </span>
          </div>

          <div className="grid-3" style={{ marginTop: '1rem', gap: '1rem' }}>
            <div style={{ padding: '0.85rem 1rem', background: 'var(--role-volunteer-bg)', border: '1px solid var(--role-volunteer-border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--role-volunteer)', fontWeight: 700 }}>Assigned Rider</span>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDelivery.volunteer_name || 'Assigned Driver'}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedDelivery.volunteer_phone}</p>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: 'var(--role-donor-bg)', border: '1px solid var(--role-donor-border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--role-donor)', fontWeight: 700 }}>From Donor</span>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDelivery.donor_name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedDelivery.donor_address}</p>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: 'var(--role-ngo-bg)', border: '1px solid var(--role-ngo-border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--role-ngo)', fontWeight: 700 }}>To Shelter</span>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDelivery.ngo_name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedDelivery.ngo_address}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
