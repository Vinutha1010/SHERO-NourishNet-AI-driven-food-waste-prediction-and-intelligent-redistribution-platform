import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Sparkles,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Building,
  Heart,
  Camera,
  Trash2,
  RefreshCw,
  Gift,
  Crosshair,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import { sounds } from '../services/soundService';
import { api } from '../services/api';
import { SafetyBadge } from '../components/SafetyBadge';
import { Modal } from '../components/Modal';
import { ImpactCertificate } from '../components/ImpactCertificate';

const SAMPLE_PHOTOS = [
  { label: 'Curry & Rice 🍛', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Biryani Feast 🥘', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bakery Breads 🥐', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Produce 🥦', url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80' }
];

export const DonorDashboard = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { userLocation, detectLiveLocation, isDetecting: isDetectingGps } = useLocation();

  const [foodList, setFoodList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);

  // Friendly Estimator State
  const [predictParams, setPredictParams] = useState({
    event_type: 'Buffet',
    estimated_guests: 150,
    day_of_week: 'Saturday'
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Listing Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    food_name: 'Freshly Prepared Dal Makhani, Paneer Butter Masala & Roti',
    food_type: 'Cooked Meals',
    quantity: 35,
    prepared_time: new Date().toISOString().slice(0, 16),
    expiry_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16),
    storage_condition: 'HOT_INSULATED',
    image_path: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    latitude: userLocation?.latitude || 12.9784,
    longitude: userLocation?.longitude || 77.6408,
    pickup_address: userLocation?.address || 'MG Road, Indiranagar, Bengaluru'
  });

  // Image Recognition State
  const [aiInspection, setAiInspection] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // Matches Modal State
  const [selectedFoodForMatch, setSelectedFoodForMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const donorId = currentUser?.user_id || 1;

  const loadData = async () => {
    setLoading(true);
    try {
      const foods = await api.getFood({ donor_id: donorId });
      const reqs = await api.getRequests({ donor_id: donorId });
      setFoodList(foods);
      setRequests(reqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    runPrediction();
  }, [donorId]);

  const runPrediction = async () => {
    setIsPredicting(true);
    try {
      const res = await api.predictSurplus(predictParams);
      setPredictionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  const inspectFoodPhoto = async (url) => {
    setIsInspecting(true);
    try {
      const res = await api.classifyFoodImage(url);
      setAiInspection(res);
      addToast('Food photo verified!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleApplyPrediction = () => {
    if (!predictionResult) return;
    setFormData(prev => ({
      ...prev,
      quantity: predictionResult.predicted_surplus_kg,
      food_name: `${predictParams.event_type} Extra Catering (~${predictParams.estimated_guests} Guests)`
    }));
    setShowAddForm(true);
    addToast('Applied estimate to donation form!', 'info');
  };

  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        donor_id: donorId,
        prepared_time: formData.prepared_time.replace('T', ' ') + ':00',
        expiry_time: formData.expiry_time.replace('T', ' ') + ':00',
        quantity: parseFloat(formData.quantity)
      };
      await api.addFood(payload);
      sounds.playSuccessChime();
      addToast('Extra food listed successfully! Nearby shelters are being notified.', 'success');
      setShowAddForm(false);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to list food', 'error');
    }
  };

  const handleViewMatches = async (food) => {
    setSelectedFoodForMatch(food);
    setLoadingMatches(true);
    try {
      const matchData = await api.getSmartMatches(food.food_id);
      setMatches(matchData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.acceptRequest(requestId);
      sounds.playSuccessChime();
      addToast(`Request #${requestId} accepted! Food is now safely reserved for pickup.`, 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.rejectRequest(requestId);
      sounds.playPop();
      addToast(`Request #${requestId} declined`, 'info');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const totalKgDonated = foodList.reduce((sum, f) => sum + (parseFloat(f.quantity) || 0), 0);
  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="role-badge DONOR">DONOR HUB</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kitchen & Meal Sharing Center</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
            {currentUser?.name || "Green Leaf Bistro"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            <MapPin size={15} style={{ display: 'inline', marginRight: '4px', color: 'var(--role-donor)' }} />
            {currentUser?.address || "MG Road, Indiranagar, Bengaluru"}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowCert(true)}
            className="btn btn-outline btn-sm"
            style={{ borderColor: 'var(--accent-500)', color: 'var(--accent-warm)' }}
          >
            <Award size={15} />
            <span>Impact Certificate</span>
          </button>
          <button onClick={loadData} className="btn btn-outline btn-sm">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Share Extra Food</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-green-bg)', color: 'var(--icon-box-green-text)' }}>
            <Utensils size={26} />
          </div>
          <div>
            <div className="stat-number">{foodList.length}</div>
            <div className="stat-label">Active Food Batches</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-amber-bg)', color: 'var(--icon-box-amber-text)' }}>
            <Heart size={26} fill="currentColor" />
          </div>
          <div>
            <div className="stat-number">{totalKgDonated} <span style={{ fontSize: '1rem' }}>kg</span></div>
            <div className="stat-label">Shared With Shelters</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--badge-pending-bg)', color: 'var(--badge-pending-text)' }}>
            <Building size={26} />
          </div>
          <div>
            <div className="stat-number">{pendingRequests.length}</div>
            <div className="stat-label">Shelters Waiting</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-blue-bg)', color: 'var(--icon-box-blue-text)' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="stat-number">100%</div>
            <div className="stat-label">Safe & Fresh Quality</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Food Estimator & Listings */}
      <div className="grid-3" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* Left Column: Smart Food Estimator */}
        <div style={{ gridColumn: 'span 1' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', border: '1.5px solid var(--role-donor-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--role-donor-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--role-donor)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Extra Food Estimator</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Helpful portion forecasting</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gathering or Event Type</label>
                <select
                  value={predictParams.event_type}
                  onChange={(e) => {
                    const next = { ...predictParams, event_type: e.target.value };
                    setPredictParams(next);
                  }}
                  className="form-select"
                >
                  <option value="Buffet">Restaurant Buffet / Lunch</option>
                  <option value="Wedding">Wedding Celebration</option>
                  <option value="Banquet">Community Banquet</option>
                  <option value="Corporate">Office / Conference Catering</option>
                  <option value="Festival">Festival & Holy Feast</option>
                  <option value="Party">Birthday / Family Party</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Total Guests Attending</label>
                  <span style={{ fontWeight: 800, color: 'var(--role-donor)', fontSize: '1rem' }}>
                    {predictParams.estimated_guests} Guests
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={predictParams.estimated_guests}
                  onChange={(e) => {
                    const next = { ...predictParams, estimated_guests: parseInt(e.target.value) };
                    setPredictParams(next);
                  }}
                  style={{ width: '100%', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Day of Gathering</label>
                <select
                  value={predictParams.day_of_week}
                  onChange={(e) => {
                    const next = { ...predictParams, day_of_week: e.target.value };
                    setPredictParams(next);
                  }}
                  className="form-select"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={runPrediction}
                disabled={isPredicting}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', borderColor: 'var(--primary-500)', color: 'var(--role-donor)', fontWeight: 700 }}
              >
                <Sparkles size={14} />
                <span>{isPredicting ? 'Calculating...' : 'Estimate Extra Meals'}</span>
              </button>

              {/* Prediction Result Display */}
              {predictionResult && (
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--role-donor-bg)',
                  border: '1.5px solid var(--role-donor-border)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--role-donor)', textTransform: 'uppercase' }}>
                      Estimated Surplus
                    </span>
                    <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                      ~{Math.round(predictionResult.predicted_surplus_kg * 2.5)} Meals
                    </span>
                  </div>

                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--role-donor)', fontFamily: 'var(--font-heading)' }}>
                    {predictionResult.predicted_surplus_kg} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                    {predictionResult.recommendation}
                  </p>

                  <button
                    onClick={handleApplyPrediction}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    <span>Use In Donation Form</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Incoming Shelter Requests */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Shelter Requests</h3>
              <span className="badge badge-pending">{pendingRequests.length} Waiting</span>
            </div>

            {requests.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No shelter requests yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {requests.map(req => (
                  <div
                    key={req.request_id}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{req.ngo_name}</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Item: {req.food_name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--role-donor)', fontWeight: 700, marginTop: '2px' }}>
                          Need: {req.requested_quantity} kg
                        </p>
                      </div>
                      <span className={`badge badge-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </div>

                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                        <button
                          onClick={() => handleAcceptRequest(req.request_id)}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Accept & Reserve</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.request_id)}
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1 }}
                        >
                          <XCircle size={14} />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Columns: Active Food Listings */}
        <div style={{ gridColumn: 'span 2' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Your Shared Food Items ({foodList.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading food items...
            </div>
          ) : foodList.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Utensils size={44} color="var(--role-donor)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Food Items Listed Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '420px', margin: '0.5rem auto 1.75rem', lineHeight: 1.6 }}>
                Got extra portions from lunch or an event? Share them now to bring warm smiles to local shelters.
              </p>
              <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                <PlusCircle size={17} />
                <span>Share Extra Food Now</span>
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {foodList.map(food => (
                <div key={food.food_id} className="food-card">
                  <div style={{ position: 'relative' }}>
                    <img
                      src={food.image_path || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                      alt={food.food_name}
                      className="food-card-img"
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span className={`badge badge-${food.status.toLowerCase()}`}>
                        {food.status}
                      </span>
                    </div>
                  </div>

                  <div className="food-card-body">
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.35, marginBottom: '4px', color: 'var(--text-primary)' }}>
                        {food.food_name}
                      </h4>
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Category: <strong>{food.food_type}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quantity Available</span>
                        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--role-donor)' }}>
                          {food.quantity} <span style={{ fontSize: '0.9rem' }}>kg</span>
                        </div>
                      </div>

                      <SafetyBadge
                        expiryTime={food.expiry_time}
                        storageCondition={food.storage_condition}
                        showDetails={true}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>Cooked / Prepped: {food.prepared_time?.slice(0, 16)}</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => handleViewMatches(food)}
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', borderColor: 'var(--role-ngo-border)', color: 'var(--role-ngo)', background: 'var(--role-ngo-bg)', fontWeight: 700 }}
                      >
                        <Building size={15} />
                        <span>Find Nearby Shelters</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Modal: Share Extra Food */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Share Extra Food"
        subtitle="Give a few details about the meal so local shelters can safely enjoy it."
        maxWidth="680px"
      >
        <form onSubmit={handleAddFoodSubmit}>
          <div className="form-group">
            <label className="form-label">Dish Title or Meal Description *</label>
            <input
              type="text"
              required
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              className="form-input"
              placeholder="e.g. Steamed Rice, Vegetable Curry & Chapatis"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Food Category *</label>
              <select
                value={formData.food_type}
                onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                className="form-select"
              >
                <option value="Cooked Meals">Hot Cooked Meals 🍛</option>
                <option value="Bakery">Bakery & Breads 🥐</option>
                <option value="Dairy">Dairy & Milk Products 🥛</option>
                <option value="Raw Produce">Raw Farm Produce & Salads 🥦</option>
                <option value="Packaged">Packaged & Canned Goods 🥫</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity in kg *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">When was it prepared? *</label>
              <input
                type="datetime-local"
                required
                value={formData.prepared_time}
                onChange={(e) => setFormData({ ...formData, prepared_time: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Best consumed before *</label>
              <input
                type="datetime-local"
                required
                value={formData.expiry_time}
                onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Storage / Packing Condition *</label>
            <select
              value={formData.storage_condition}
              onChange={(e) => setFormData({ ...formData, storage_condition: e.target.value })}
              className="form-select"
            >
              <option value="HOT_INSULATED">Hot Insulated Casseroles (&gt;65°C)</option>
              <option value="REFRIGERATED">Chilled / Refrigerator (&lt;4°C)</option>
              <option value="ROOM_TEMP">Room Temperature (Covered & Clean)</option>
              <option value="FROZEN">Deep Frozen (&lt;-18°C)</option>
            </select>
          </div>

          {/* Pickup Live Location */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Pickup Location & GPS Coordinates *</label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    addToast('Fetching your live device GPS location...', 'info');
                    const pos = await detectLiveLocation();
                    setFormData(prev => ({
                      ...prev,
                      latitude: pos.latitude,
                      longitude: pos.longitude,
                      pickup_address: pos.address
                    }));
                    addToast(`📍 Location updated to: ${pos.address}`, 'success');
                  } catch (err) {
                    addToast(err.message, 'error');
                  }
                }}
                disabled={isDetectingGps}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.775rem', padding: '0.25rem 0.65rem', borderColor: 'var(--role-donor)', color: 'var(--role-donor)' }}
              >
                <Crosshair size={13} className={isDetectingGps ? 'animate-spin' : ''} />
                <span>{isDetectingGps ? 'Detecting GPS...' : '📍 Use My Live Location'}</span>
              </button>
            </div>
            
            <input
              type="text"
              required
              value={formData.pickup_address}
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              className="form-input"
              placeholder="e.g. Indiranagar 100ft Road, Bengaluru"
            />
            
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px', alignItems: 'center' }}>
              <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                GPS: {Number(formData.latitude).toFixed(4)}° N, {Number(formData.longitude).toFixed(4)}° E
              </span>
              <span>(Accurate matching with nearby shelters)</span>
            </div>
          </div>

          {/* Photo URL & Quick Presets */}
          <div className="form-group">
            <label className="form-label">Food Photo (Choose Quick Preset or Paste Link)</label>
            
            {/* Quick Photo Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {SAMPLE_PHOTOS.map(sample => (
                <button
                  type="button"
                  key={sample.label}
                  onClick={() => setFormData({ ...formData, image_path: sample.url })}
                  className="btn btn-sm btn-ghost"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.6rem',
                    background: formData.image_path === sample.url ? 'var(--role-donor-bg)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${formData.image_path === sample.url ? 'var(--role-donor)' : 'var(--border-subtle)'}`,
                    color: formData.image_path === sample.url ? 'var(--role-donor)' : 'var(--text-secondary)'
                  }}
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {formData.image_path && (
                <img
                  src={formData.image_path}
                  alt="Preview"
                  style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-strong)' }}
                />
              )}
              <input
                type="url"
                value={formData.image_path}
                onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                className="form-input"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => inspectFoodPhoto(formData.image_path)}
                disabled={isInspecting}
                className="btn btn-outline btn-sm"
              >
                <Camera size={16} />
                <span>Verify</span>
              </button>
            </div>
          </div>

          {/* Safety Banner */}
          <div style={{ padding: '1rem', background: 'var(--role-donor-bg)', border: '1px solid var(--role-donor-border)', borderRadius: 'var(--radius-md)', margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--role-donor)', fontWeight: 800, fontSize: '0.9rem' }}>
              <ShieldCheck size={18} />
              <span>Food Safety & Freshness First</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              By sharing, you confirm this food was hygienically prepared and stored safely for consumption.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={17} />
              <span>Share Food Now</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Impact Certificate Modal */}
      <ImpactCertificate
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        userName={currentUser?.name || "Green Leaf Bistro"}
        role="FOOD DONOR"
        totalKg={totalKgDonated || 153}
        meals={Math.round((totalKgDonated || 153) * 2.5)}
        co2={Math.round((totalKgDonated || 153) * 2.5)}
      />

      {/* Modal: Nearby Shelter Matches */}
      <Modal
        isOpen={!!selectedFoodForMatch}
        onClose={() => setSelectedFoodForMatch(null)}
        title="Nearby Community Shelters"
        subtitle={`Best matching shelters for "${selectedFoodForMatch?.food_name}"`}
        maxWidth="640px"
      >
        {loadingMatches ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Finding closest shelters and community kitchens...
          </div>
        ) : matches.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No nearby shelters registered yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.map((match, idx) => (
              <div
                key={match.ngo_id}
                className="glass-card"
                style={{
                  padding: '1.35rem',
                  border: idx === 0 ? '2px solid var(--role-donor)' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{match.ngo_name}</strong>
                      {idx === 0 && (
                        <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                          Closest Match
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{match.ngo_address}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--role-donor)', fontFamily: 'var(--font-heading)' }}>
                      {match.match_score_percentage}%
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Compatibility</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', padding: '0.65rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Distance: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{match.distance_km} km away</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{match.ngo_phone}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

    </div>
  );
};
