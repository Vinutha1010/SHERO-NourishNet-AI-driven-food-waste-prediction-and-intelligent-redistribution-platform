import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  Filter,
  Utensils,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Star,
  Sparkles,
  Send,
  RefreshCw,
  ShoppingBag,
  Heart,
  Smile,
  Crosshair,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import { calculateDistanceKm } from '../services/locationService';
import { sounds } from '../services/soundService';
import { api } from '../services/api';
import { SafetyBadge } from '../components/SafetyBadge';
import { Modal } from '../components/Modal';

export const NgoDashboard = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { userLocation, detectLiveLocation, isDetecting: isDetectingGps } = useLocation();

  const [availableFood, setAvailableFood] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [radiusFilter, setRadiusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DISTANCE');

  // Request Modal State
  const [selectedFood, setSelectedFood] = useState(null);
  const [requestedQty, setRequestedQty] = useState(10);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Feedback Modal State
  const [feedbackDelivery, setFeedbackDelivery] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Food arrived hot, hygienic, and in great condition. Fed 60 individuals in our shelter tonight! Thank you so much.');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const ngoId = currentUser?.user_id || 3;

  const loadData = async () => {
    setLoading(true);
    try {
      const foods = await api.getFood({ status: 'AVAILABLE' });
      const reqs = await api.getRequests({ ngo_id: ngoId });
      setAvailableFood(foods);
      setMyRequests(reqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ngoId]);

  const handleOpenRequestModal = (food) => {
    sounds.playPop();
    setSelectedFood(food);
    setRequestedQty(food.quantity);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;

    setIsSubmittingReq(true);
    try {
      await api.createRequest({
        food_id: selectedFood.food_id,
        ngo_id: ngoId,
        requested_quantity: parseFloat(requestedQty)
      });
      sounds.playSuccessChime();
      addToast(`Request for ${requestedQty} kg submitted! Waiting for kitchen confirmation.`, 'success');
      setSelectedFood(null);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleOpenFeedback = (req) => {
    sounds.playPop();
    setFeedbackDelivery(req);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackDelivery) return;

    setIsSubmittingFeedback(true);
    try {
      await api.submitFeedback({
        delivery_id: feedbackDelivery.request_id || 1,
        from_user_id: ngoId,
        rating: rating,
        comment: comment
      });
      sounds.playSuccessChime();
      addToast('Thank you! Gratitude rating submitted successfully.', 'success');
      setFeedbackDelivery(null);
    } catch (err) {
      addToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const filteredFood = availableFood
    .map(food => {
      const dist = userLocation?.latitude && food.latitude
        ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, food.latitude, food.longitude)
        : 5.0;
      return { ...food, calculatedDistance: dist };
    })
    .filter(food => {
      const matchesSearch = food.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (food.donor_name && food.donor_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = categoryFilter === 'ALL' || food.food_type === categoryFilter;
      const matchesRadius = radiusFilter === 'ALL' || (food.calculatedDistance != null && food.calculatedDistance <= parseFloat(radiusFilter));
      return matchesSearch && matchesCat && matchesRadius;
    })
    .sort((a, b) => {
      if (sortBy === 'DISTANCE') return (a.calculatedDistance || 0) - (b.calculatedDistance || 0);
      if (sortBy === 'QUANTITY') return (b.quantity || 0) - (a.quantity || 0);
      return b.food_id - a.food_id;
    });

  const categories = [
    { key: 'ALL', label: 'All Goodies 🍲' },
    { key: 'Cooked Meals', label: 'Cooked Meals 🍛' },
    { key: 'Bakery', label: 'Bakery 🥐' },
    { key: 'Raw Produce', label: 'Fresh Veggies 🥦' },
    { key: 'Dairy', label: 'Dairy 🥛' },
    { key: 'Packaged', label: 'Pantry 🥫' }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="role-badge NGO">SHELTER HUB</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Community Food Pantry & Requests</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
            {currentUser?.name || "Hope Food Bank & Community Shelter"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            <MapPin size={15} style={{ display: 'inline', marginRight: '4px', color: 'var(--role-ngo)' }} />
            {userLocation?.isLive ? userLocation.address : (currentUser?.address || "Koramangala 4th Block, Bengaluru")}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={async () => {
              try {
                addToast('Detecting your live shelter location...', 'info');
                const pos = await detectLiveLocation();
                addToast(`📍 Shelter location updated: ${pos.address}`, 'success');
              } catch (err) {
                addToast(err.message, 'error');
              }
            }}
            disabled={isDetectingGps}
            className="btn btn-outline btn-sm"
            style={{ borderColor: 'var(--role-ngo)', color: 'var(--role-ngo)' }}
          >
            <Crosshair size={14} className={isDetectingGps ? 'animate-spin' : ''} />
            <span>{isDetectingGps ? 'Detecting...' : userLocation?.isLive ? 'Live GPS Active' : 'Detect My Location'}</span>
          </button>
          
          <button onClick={loadData} className="btn btn-outline btn-sm">
            <RefreshCw size={15} />
            <span>Refresh Board</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Surplus Marketplace & Request Status Tracker */}
      <div className="grid-3" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* Left 2 Columns: Available Food Marketplace */}
        <div style={{ gridColumn: 'span 2' }}>
          
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              {/* Search Bar & Sort Dropdown */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search dishes, bakery, fruits, donor kitchens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.825rem' }}
                  >
                    <option value="DISTANCE">📍 Closest to Me</option>
                    <option value="QUANTITY">📦 Largest Quantity</option>
                    <option value="NEWEST">⏱️ Recently Added</option>
                  </select>
                </div>
              </div>

              {/* Category Pills & Distance Radius */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {categories.map(cat => {
                    const isSelected = categoryFilter === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setCategoryFilter(cat.key);
                          sounds.playPop();
                        }}
                        className="btn btn-sm"
                        style={{
                          background: isSelected ? 'var(--role-ngo)' : 'var(--bg-surface-elevated)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          borderColor: isSelected ? 'var(--role-ngo)' : 'var(--border-subtle)',
                          fontWeight: 700,
                          fontSize: '0.775rem',
                          padding: '0.35rem 0.75rem'
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Radius Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Max Distance:</span>
                  {['ALL', '5', '15', '30'].map(rad => {
                    const isSelected = radiusFilter === rad;
                    return (
                      <button
                        key={rad}
                        onClick={() => {
                          setRadiusFilter(rad);
                          sounds.playPop();
                        }}
                        className="btn btn-sm"
                        style={{
                          background: isSelected ? 'var(--role-donor)' : 'var(--bg-surface-elevated)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          borderColor: isSelected ? 'var(--role-donor)' : 'var(--border-subtle)',
                          fontSize: '0.725rem',
                          padding: '0.25rem 0.55rem'
                        }}
                      >
                        {rad === 'ALL' ? 'Any' : `<${rad}km`}
                      </button>
                    );
                  })}
                </div>

              </div>

            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Fresh Food Available Today ({filteredFood.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Checking available meals in your area...
            </div>
          ) : filteredFood.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Utensils size={44} color="var(--role-ngo)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Available Food Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: '0.5rem auto' }}>
                Try changing your search filter. New food batches from restaurants are listed throughout the day!
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {filteredFood.map(food => {
                const distanceKm = userLocation?.latitude && food.latitude
                  ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, food.latitude, food.longitude)
                  : null;

                return (
                  <div key={food.food_id} className="food-card">
                    <div style={{ position: 'relative' }}>
                      <img
                        src={food.image_path || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                        alt={food.food_name}
                        className="food-card-img"
                      />
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                        {distanceKm != null && (
                          <span className="badge" style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#38bdf8', backdropFilter: 'blur(6px)', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.725rem' }}>
                            📍 {distanceKm} km away
                          </span>
                        )}
                        <span className="badge badge-available">
                          {food.status}
                        </span>
                      </div>
                    </div>

                    <div className="food-card-body">
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.35, marginBottom: '4px', color: 'var(--text-primary)' }}>
                          {food.food_name}
                        </h4>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                          From: <strong style={{ color: 'var(--text-primary)' }}>{food.donor_name || 'Verified Kitchen'}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available</span>
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

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>
                          <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          {food.donor_address || 'Bengaluru'}
                        </span>
                        {distanceKm != null && (
                          <strong style={{ color: 'var(--role-ngo)' }}>
                            ~{Math.round(distanceKm * 3.5)} min away
                          </strong>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenRequestModal(food)}
                        className="btn btn-sm"
                        style={{
                          marginTop: 'auto',
                          width: '100%',
                          background: 'var(--role-ngo)',
                          color: '#ffffff',
                          fontWeight: 800
                        }}
                      >
                        <ShoppingBag size={16} />
                        <span>Request This Food</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Shelter Orders & Progress */}
        <div style={{ gridColumn: 'span 1' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="var(--role-ngo)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Our Meal Requests ({myRequests.length})</h3>
              </div>
            </div>

            {myRequests.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>You haven't requested any food batches yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myRequests.map(req => {
                  const isDelivered = req.status === 'COMPLETED';
                  const isAccepted = req.status === 'ACCEPTED';
                  const isPending = req.status === 'PENDING';

                  return (
                    <div
                      key={req.request_id}
                      style={{
                        padding: '1.1rem',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                            {req.food_name}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Kitchen: {req.donor_name}
                          </span>
                        </div>
                        <span className={`badge badge-${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', margin: '0.5rem 0' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Requested:</span>
                        <strong style={{ color: 'var(--role-donor)' }}>{req.requested_quantity} kg</strong>
                      </div>

                      {isPending && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--accent-warm)', fontWeight: 600 }}>
                          ⏳ Waiting for donor kitchen approval...
                        </p>
                      )}

                      {isAccepted && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--role-volunteer)', fontWeight: 600 }}>
                          🛵 Approved! A volunteer rider is on the way for pickup.
                        </p>
                      )}

                      {isDelivered && (
                        <div style={{ marginTop: '0.85rem' }}>
                          <button
                            onClick={() => handleOpenFeedback(req)}
                            className="btn btn-outline btn-sm"
                            style={{ width: '100%', borderColor: 'var(--accent-500)', color: 'var(--accent-600)', background: 'var(--icon-box-amber-bg)', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            <Star size={14} fill="currentColor" />
                            <span>Leave Rating & Thank You</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Modal: Request Food */}
      <Modal
        isOpen={!!selectedFood}
        onClose={() => setSelectedFood(null)}
        title="Request Food for Shelter"
        subtitle={`Request surplus batch from ${selectedFood?.donor_name}`}
        maxWidth="540px"
      >
        {selectedFood && (
          <form onSubmit={handleSubmitRequest}>
            <div style={{ padding: '1.1rem', background: 'var(--role-ngo-bg)', border: '1px solid var(--role-ngo-border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--role-ngo)' }}>{selectedFood.food_name}</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Category: {selectedFood.food_type} • Available: <strong>{selectedFood.quantity} kg</strong>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Portion Needed (in kg) *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max={selectedFood.quantity}
                required
                value={requestedQty}
                onChange={(e) => setRequestedQty(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Drop-off / Entry Notes</label>
              <textarea
                rows="3"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="form-textarea"
                placeholder="e.g. Please ring the main shelter bell. Gate 2 entrance."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setSelectedFood(null)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={isSubmittingReq} className="btn btn-primary" style={{ background: 'var(--role-ngo)', borderColor: 'var(--role-ngo)' }}>
                <Send size={15} />
                <span>{isSubmittingReq ? 'Submitting...' : 'Confirm Request'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: 5-Star Feedback Review */}
      <Modal
        isOpen={!!feedbackDelivery}
        onClose={() => setFeedbackDelivery(null)}
        title="Food Quality & Gratitude Review"
        subtitle={`Leave feedback for ${feedbackDelivery?.food_name}`}
        maxWidth="520px"
      >
        <form onSubmit={handleSubmitFeedback}>
          <div className="form-group" style={{ textAlign: 'center', margin: '1rem 0' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
              How was the food quality and delivery?
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.3rem',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Star
                    size={34}
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    color={star <= rating ? '#f59e0b' : 'var(--text-muted)'}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-500)', marginTop: '8px', display: 'block' }}>
              {rating === 5 ? '5 Stars - Fresh, Delicious & Timely!' : `${rating} Stars`}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">A Few Words of Gratitude *</label>
            <textarea
              rows="3"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea"
              placeholder="Tell the donor and rider how much this meant to your community..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setFeedbackDelivery(null)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSubmittingFeedback} className="btn btn-accent">
              <Heart size={16} fill="#ffffff" />
              <span>{isSubmittingFeedback ? 'Submitting...' : 'Send Review & Thanks'}</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
