/**
 * Location Service for SHERO-NourishNet
 * Provides live device GPS tracking, high-accuracy geolocation,
 * reverse geocoding via OpenStreetMap Nominatim, and Haversine distance calculations.
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Reverse geocodes coordinates to a human-readable address
 */
export async function reverseGeocode(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const street = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
      const city = addr.city || addr.town || addr.village || addr.county || 'Bengaluru';
      const state = addr.state || 'Karnataka';
      
      const formatted = [street, city, state].filter(Boolean).join(', ');
      return {
        formattedAddress: formatted || data.display_name?.slice(0, 50) || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
        raw: data
      };
    }
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
  }
  return {
    formattedAddress: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
    raw: null
  };
}

/**
 * Get one-shot live GPS position from browser
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 10),
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0, // km/h
          timestamp: pos.timestamp
        });
      },
      (err) => {
        let msg = 'Unable to retrieve location';
        if (err.code === 1) msg = 'Location permission was denied. Please allow location access.';
        else if (err.code === 2) msg = 'Location position unavailable.';
        else if (err.code === 3) msg = 'Location request timed out.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );
  });
}

/**
 * Continuously watch live device position (e.g. for volunteer couriers)
 */
export function watchPosition(onSuccess, onError, options = {}) {
  if (!navigator.geolocation) {
    if (onError) onError(new Error('Geolocation not supported'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (pos) => {
      onSuccess({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 10),
        speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0, // km/h
        heading: pos.coords.heading || 0,
        timestamp: pos.timestamp
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 2000,
      ...options
    }
  );
}

export function clearWatch(watchId) {
  if (watchId != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
