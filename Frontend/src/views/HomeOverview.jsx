import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Building,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Heart,
  Smile,
  Leaf,
  Users,
  Sun,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const HomeOverview = ({ setActiveTab, onOpenAuth }) => {
  const { switchRole } = useAuth();
  const [stats, setStats] = useState({
    total_quantity_redistributed_kg: 153.0,
    total_food_listings: 4,
    total_deliveries: 2,
    average_user_rating: 4.95
  });

  useEffect(() => {
    api.getAdminStats().then(data => {
      if (data) setStats(data);
    });
  }, []);

  const totalKg = stats.total_quantity_redistributed_kg || 153;
  const mealsServed = Math.round(totalKg * 2.5);
  const co2Averted = Math.round(totalKg * 2.5);

  const rolePortals = [
    {
      role: 'DONOR',
      title: 'Kitchens & Donors',
      subtitle: 'Restaurants, Banquets, Caterers & Families',
      description: 'Have extra food after an event or dinner? List it in 60 seconds with simple portion estimation and connect with local community homes.',
      tab: 'donor',
      icon: Utensils,
      color: 'var(--role-donor)',
      bg: 'var(--role-donor-bg)',
      border: 'var(--role-donor-border)',
      highlights: ['Smart Extra Food Estimator', 'Freshness & Safety Clearance', 'Instant Match to Nearby Shelters']
    },
    {
      role: 'NGO',
      title: 'Shelters & Food Banks',
      subtitle: 'Community Kitchens, Homes & Charities',
      description: 'Browse freshly prepared surplus batches nearby, request nutritious meals for your residents with 1 tap, and leave gratitude ratings.',
      tab: 'ngo',
      icon: Building,
      color: 'var(--role-ngo)',
      bg: 'var(--role-ngo-bg)',
      border: 'var(--role-ngo-border)',
      highlights: ['Live Community Food Board', '1-Tap Portion Requests', 'Help Feed Hundreds Daily']
    },
    {
      role: 'VOLUNTEER',
      title: 'Delivery Heroes',
      subtitle: 'Friendly Neighbors & Community Riders',
      description: 'Turn your everyday scooter or bicycle rides into acts of kindness. Pick up warm meals from donors and hand-deliver them safely.',
      tab: 'volunteer',
      icon: Truck,
      color: 'var(--role-volunteer)',
      bg: 'var(--role-volunteer-bg)',
      border: 'var(--role-volunteer-border)',
      highlights: ['Choose Convenient Routes', 'Live Route Directions', 'Deliver Warm Smiles']
    },
    {
      role: 'ADMIN',
      title: 'Community Impact',
      subtitle: 'City Happiness & Food Rescue Oversight',
      description: 'See the heartwarming collective difference: meals shared, waste avoided, and verified community partners across the neighborhood.',
      tab: 'admin',
      icon: ShieldCheck,
      color: 'var(--role-admin)',
      bg: 'var(--role-admin-bg)',
      border: 'var(--role-admin-border)',
      highlights: ['Meals Shared Counter', 'Verified Kitchen Directory', 'Community Health Overview']
    }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0 4rem' }}>
      
      {/* Hero Section */}
      <div className="container">
        <div style={{
          position: 'relative',
          padding: '4rem 3rem',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'var(--hero-bg)',
          border: '1.5px solid var(--hero-border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          
          <div style={{ maxWidth: '820px', position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--hero-pill-bg)',
              border: '1px solid var(--hero-pill-border)',
              color: 'var(--hero-pill-text)',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem'
            }}>
              <Heart size={14} fill="currentColor" /> SHARING GOOD FOOD WITH THOSE WHO NEED IT
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              lineHeight: 1.18,
              fontWeight: 800,
              marginBottom: '1.25rem',
              color: 'var(--hero-title)'
            }}>
              No Plate Empty. <br />
              <span style={{ color: '#22c55e' }}>No Food Wasted.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--hero-desc)',
              lineHeight: 1.65,
              marginBottom: '2.25rem',
              maxWidth: '700px',
              fontWeight: 500
            }}>
              Every day, delicious, fresh food goes untouched while local shelters search for wholesome meals.
              We connect warm-hearted restaurants, caring community homes, and neighborhood riders to feed thousands with love.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                onClick={() => {
                  switchRole('DONOR');
                  setActiveTab('donor');
                }}
                className="btn btn-primary btn-lg"
              >
                <span>Share Extra Meals</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => {
                  switchRole('NGO');
                  setActiveTab('ngo');
                }}
                className="btn btn-outline btn-lg"
                style={{
                  background: 'var(--hero-btn-bg)',
                  borderColor: 'var(--hero-btn-border)',
                  color: 'var(--hero-btn-text)'
                }}
              >
                <span>Find Food for Shelters</span>
                <Building size={18} color="var(--role-ngo)" />
              </button>
            </div>
          </div>
        </div>

        {/* Heartwarming Impact Counters */}
        <div style={{ marginTop: '2rem' }}>
          <div className="grid-4">
            
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-green-bg)', color: 'var(--icon-box-green-text)' }}>
                <Utensils size={28} />
              </div>
              <div>
                <div className="stat-number">{totalKg} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span></div>
                <div className="stat-label">Good Food Saved</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-amber-bg)', color: 'var(--icon-box-amber-text)' }}>
                <Heart size={28} fill="currentColor" />
              </div>
              <div>
                <div className="stat-number">{mealsServed.toLocaleString()}</div>
                <div className="stat-label">Warm Meals Shared</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-blue-bg)', color: 'var(--icon-box-blue-text)' }}>
                <Leaf size={28} />
              </div>
              <div>
                <div className="stat-number">{co2Averted} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span></div>
                <div className="stat-label">Nature Protected</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-pink-bg)', color: 'var(--icon-box-pink-text)' }}>
                <Smile size={28} />
              </div>
              <div>
                <div className="stat-number">{stats.average_user_rating || 5.0} ★</div>
                <div className="stat-label">Happy Community Trust</div>
              </div>
            </div>

          </div>
        </div>

        {/* How It Works - Friendly 3-Step Guide */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <span className="badge badge-available" style={{ marginBottom: '0.6rem' }}>Simple as 1-2-3</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>How Sharing Food Works</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0.5rem auto 2.5rem', fontSize: '1rem' }}>
            Built for everyday people, busy chefs, loving volunteers, and caring shelter managers.
          </p>

          <div className="grid-3" style={{ gap: '1.5rem', textAlign: 'left' }}>
            
            <div className="glass-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--icon-box-green-bg)', color: 'var(--icon-box-green-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Notice Extra Food</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Whether it is 10 portions from a family function or 50 kg from a restaurant buffet, list it in under a minute with safe time checks.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--role-ngo-bg)', color: 'var(--role-ngo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Match with Nearby Homes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Nearby registered food banks and orphanages get notified immediately. They review the batch and request what they need.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--icon-box-blue-bg)', color: 'var(--icon-box-blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Hero Riders Deliver</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                A volunteer rider accepts the route, picks up the warm food with thermal carriers, and delivers it safely in real-time.
              </p>
            </div>

          </div>
        </div>

        {/* Role Portals Grid */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-reserved" style={{ marginBottom: '0.5rem' }}>Explore Each View</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Choose Your Role In The Movement</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '1rem' }}>
              Click any portal below to experience customized views designed for donors, shelters, riders, and coordinators.
            </p>
          </div>

          <div className="grid-2" style={{ gap: '1.75rem' }}>
            {rolePortals.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.role}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `1.5px solid ${portal.border}`,
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '16px',
                          background: portal.bg,
                          color: portal.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={26} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{portal.title}</h3>
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>{portal.subtitle}</span>
                        </div>
                      </div>
                      <span className={`role-badge ${portal.role}`}>
                        {portal.role}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {portal.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem' }}>
                      {portal.highlights.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          <CheckCircle2 size={16} color={portal.color} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      switchRole(portal.role);
                      setActiveTab(portal.tab);
                    }}
                    className="btn"
                    style={{
                      background: portal.bg,
                      border: `1px solid ${portal.border}`,
                      color: portal.color,
                      width: '100%',
                      fontWeight: 800
                    }}
                  >
                    <span>Open {portal.title} Portal</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
