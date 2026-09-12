import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentPosition, watchPosition, clearWatch, reverseGeocode } from '../services/locationService';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('nourishnet_user_location');
    return saved
      ? JSON.parse(saved)
      : {
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 15,
          address: 'Bengaluru, Karnataka',
          isLive: false,
          lastUpdated: null
        };
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isWatchingLive, setIsWatchingLive] = useState(false);
  const watchIdRef = useRef(null);

  // Save location updates
  useEffect(() => {
    if (userLocation) {
      localStorage.setItem('nourishnet_user_location', JSON.stringify(userLocation));
    }
  }, [userLocation]);

  /**
   * Request live GPS position once and reverse-geocode to address
   */
  const detectLiveLocation = useCallback(async (showPrompt = true) => {
    setIsDetecting(true);
    setLocationError(null);
    try {
      const pos = await getCurrentPosition();
      const geo = await reverseGeocode(pos.latitude, pos.longitude);

      const newLoc = {
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        speed: pos.speed,
        address: geo.formattedAddress,
        isLive: true,
        lastUpdated: new Date().toISOString()
      };

      setUserLocation(newLoc);
      return newLoc;
    } catch (err) {
      console.warn('Geolocation detection error:', err.message);
      setLocationError(err.message);
      throw err;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  /**
   * Start continuous live device GPS tracking (e.g. while riding/delivering)
   */
  const startLiveTracking = useCallback((onUpdateCallback) => {
    if (watchIdRef.current != null) {
      clearWatch(watchIdRef.current);
    }

    setIsWatchingLive(true);
    const id = watchPosition(
      async (pos) => {
        const update = {
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
          speed: pos.speed,
          heading: pos.heading,
          isLive: true,
          lastUpdated: new Date().toISOString()
        };

        setUserLocation((prev) => ({
          ...prev,
          ...update
        }));

        if (onUpdateCallback) {
          onUpdateCallback(update);
        }
      },
      (err) => {
        console.warn('Watch location error:', err.message);
        setLocationError(err.message);
      }
    );

    watchIdRef.current = id;
    return id;
  }, []);

  /**
   * Stop continuous live GPS tracking
   */
  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current != null) {
      clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatchingLive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isDetecting,
        locationError,
        isWatchingLive,
        detectLiveLocation,
        startLiveTracking,
        stopLiveTracking,
        setUserLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
