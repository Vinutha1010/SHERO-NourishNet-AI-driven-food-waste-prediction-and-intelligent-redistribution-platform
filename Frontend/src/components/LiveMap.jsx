import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Navigation, Compass, Layers, ShieldCheck } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';

export const LiveMap = ({
  foodItems = [],
  deliveries = [],
  ngos = [],
  activeDeliveryId = null,
  center = [12.9716, 77.5946],
  zoom = 13,
  height = '420px',
  showUserLocation = true,
  onSelectDelivery = null
}) => {
  const { userLocation, detectLiveLocation, isDetecting } = useLocation();
  const { addToast } = useToast();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = userLocation?.latitude && userLocation?.longitude
        ? [userLocation.latitude, userLocation.longitude]
        : center;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | SHERO-NourishNet Logistics'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers & polylines
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    polylinesRef.current.forEach(p => map.removeLayer(p));
    polylinesRef.current = [];

    // Helper to create custom div icon
    const createCustomIcon = (emoji, color, isPulse = false) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            background: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            transform: translate(-50%, -50%);
          ">
            ${emoji}
            ${isPulse ? `
              <div style="
                position: absolute;
                inset: -7px;
                border-radius: 50%;
                border: 2.5px solid ${color};
                animation: pulseGlow 1.6s infinite ease-out;
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });
    };

    // Plot Live User Location Marker
    if (showUserLocation && userLocation?.latitude && userLocation?.longitude) {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      if (accuracyCircleRef.current) map.removeLayer(accuracyCircleRef.current);

      const userIcon = L.divIcon({
        className: 'user-live-marker',
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 3px solid #ffffff;
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.4), 0 6px 16px rgba(0,0,0,0.4);
            transform: translate(-50%, -50%);
          ">
            📍
            <div style="
              position: absolute;
              inset: -10px;
              border-radius: 50%;
              border: 2px solid #38bdf8;
              animation: pulseGlow 1.8s infinite ease-out;
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      userMarker.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif; min-width: 170px;">
          <strong style="color: #0284c7; font-size: 13px; display: flex; alignItems: center; gap: 4px;">
            <span>📍 Your Live Location</span>
          </strong>
          <p style="margin: 4px 0 2px; font-size: 12px; color: #334155;">${userLocation.address || 'Detected Live GPS'}</p>
          <span style="font-size: 11px; color: #64748b;">Accuracy: ±${userLocation.accuracy || 15}m</span>
        </div>
      `);
      userMarkerRef.current = userMarker;

      if (userLocation.accuracy && userLocation.accuracy < 500) {
        const circle = L.circle([userLocation.latitude, userLocation.longitude], {
          radius: userLocation.accuracy,
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.12,
          weight: 1.5
        }).addTo(map);
        accuracyCircleRef.current = circle;
      }
    }

    // Plot Donors / Food Locations
    foodItems.forEach(item => {
      if (item.latitude && item.longitude) {
        const marker = L.marker([item.latitude, item.longitude], {
          icon: createCustomIcon('🍲', '#10b981')
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <strong style="color: #10b981; font-size: 14px;">${item.food_name}</strong>
            <p style="margin: 4px 0 2px; font-size: 12px; color: #475569;">Donor: <b>${item.donor_name || 'Restaurant'}</b></p>
            <p style="margin: 2px 0; font-size: 12px;">Quantity: <b>${item.quantity} kg</b></p>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 99px; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: bold;">
              ${item.status}
            </span>
          </div>
        `);
        markersRef.current.push(marker);
      }
    });

    // Plot NGO Centers
    ngos.forEach(ngo => {
      if (ngo.latitude && ngo.longitude) {
        const marker = L.marker([ngo.latitude, ngo.longitude], {
          icon: createCustomIcon('🏢', '#8b5cf6')
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <strong style="color: #8b5cf6; font-size: 14px;">${ngo.name}</strong>
            <p style="margin: 4px 0 2px; font-size: 12px; color: #475569;">NGO / Shelter Center</p>
            <p style="margin: 2px 0; font-size: 12px;">${ngo.address || 'Bengaluru'}</p>
          </div>
        `);
        markersRef.current.push(marker);
      }
    });

    // Plot Deliveries & Volunteer Live Pins
    deliveries.forEach(del => {
      const lat = del.current_lat || (del.latitude || 12.9609);
      const lng = del.current_lng || (del.longitude || 77.6387);

      const isLive = del.status === 'IN_TRANSIT' || del.status === 'ASSIGNED';
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon('🛵', '#3b82f6', isLive)
      }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <strong style="color: #3b82f6; font-size: 14px;">Delivery #${del.delivery_id} (${del.status})</strong>
          <p style="margin: 4px 0 2px; font-size: 12px; color: #475569;">Rider: <b>${del.volunteer_name || 'Assigned Driver'}</b></p>
          <p style="margin: 2px 0; font-size: 12px;">Carrying: <b>${del.food_name || 'Food Parcel'} (${del.quantity || 25} kg)</b></p>
          <p style="margin: 2px 0; font-size: 11px; color: #64748b;">To: ${del.ngo_name}</p>
        </div>
      `);

      if (onSelectDelivery) {
        marker.on('click', () => onSelectDelivery(del));
      }

      markersRef.current.push(marker);

      // Draw route trajectory
      if (del.donor_lat && del.donor_lng && del.ngo_lat && del.ngo_lng) {
        const polyline = L.polyline(
          [[del.donor_lat, del.donor_lng], [lat, lng], [del.ngo_lat, del.ngo_lng]],
          { color: '#38bdf8', weight: 4, dashArray: '6, 8', opacity: 0.85 }
        ).addTo(map);
        polylinesRef.current.push(polyline);
      }
    });

    // Auto-fit if markers exist and no custom center
    if (markersRef.current.length > 0 && !userLocation?.isLive) {
      const allPoints = [...markersRef.current];
      if (userMarkerRef.current) allPoints.push(userMarkerRef.current);
      const group = new L.featureGroup(allPoints);
      map.fitBounds(group.getBounds().pad(0.2));
    }

  }, [foodItems, deliveries, ngos, activeDeliveryId, userLocation]);

  const handleLocateMe = async () => {
    try {
      addToast('Detecting your live GPS location...', 'info');
      const pos = await detectLiveLocation();
      if (mapInstanceRef.current && pos) {
        mapInstanceRef.current.flyTo([pos.latitude, pos.longitude], 15, {
          animate: true,
          duration: 1.2
        });
        addToast(`📍 Location updated: ${pos.address}`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Could not fetch live location', 'error');
    }
  };

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface-elevated)' }}
      />

      {/* Floating GPS Action Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isDetecting}
          className="btn btn-sm"
          title="Center on My Live Location"
          style={{
            background: userLocation?.isLive ? '#0284c7' : 'var(--bg-card)',
            color: userLocation?.isLive ? '#ffffff' : 'var(--text-primary)',
            border: '1.5px solid var(--border-strong)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            padding: '0.55rem 0.95rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-full)'
          }}
        >
          <Crosshair size={16} className={isDetecting ? 'animate-spin' : ''} />
          <span>{isDetecting ? 'Detecting GPS...' : userLocation?.isLive ? 'Live GPS Active' : 'Locate Me'}</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 400,
          fontSize: '0.775rem',
          fontWeight: 600,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }} />
          <span>You (Live GPS)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          <span>Donor Food Point</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} />
          <span>NGO Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
          <span>Volunteer Transit</span>
        </div>
      </div>
    </div>
  );
};
