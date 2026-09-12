import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Utensils,
  Truck,
  Building,
  Activity,
  Award,
  Leaf,
  Server,
  RefreshCw,
  Search,
  CheckCircle2,
  TrendingUp,
  Heart,
  Smile,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sounds } from '../services/soundService';
import { api } from '../services/api';
import { ImpactCertificate } from '../components/ImpactCertificate';

export const AdminDashboard = () => {
  const { currentUser, isBackendOnline, verifyBackendHealth, backendHealth } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const statData = await api.getAdminStats();
      const userData = await api.getAdminUsers();
      setStats(statData);
      setUsers(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const totalKg = stats?.total_quantity_redistributed_kg || 153;
  const mealsServed = Math.round(totalKg * 2.5);
  const co2Avoided = Math.round(totalKg * 2.5);

  const handleExportCSV = () => {
    sounds.playPop();
    const headers = 'User ID,Name,Role,Email,Phone,Address\n';
    const rows = filteredUsers.map(u => `"${u.user_id}","${u.name}","${u.role}","${u.email}","${u.phone}","${u.address}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shero_community_partners_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast('Community partner list exported as CSV!', 'success');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="role-badge ADMIN">COMMUNITY LEAD</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Impact & Neighborhood Heartbeat</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
            Community Impact Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Celebrating food saved, shelters supported, and everyday acts of kindness.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => {
              sounds.playSuccessChime();
              setShowCert(true);
            }}
            className="btn btn-outline btn-sm"
            style={{ borderColor: 'var(--role-admin)', color: 'var(--role-admin)' }}
          >
            <Award size={15} />
            <span>Milestone Deed</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            <Download size={15} />
            <span>Export Roster</span>
          </button>

          <button
            onClick={() => {
              loadData();
              sounds.playPop();
            }}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw size={15} />
            <span>Refresh Impact</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-green-bg)', color: 'var(--icon-box-green-text)' }}>
            <Utensils size={28} />
          </div>
          <div>
            <div className="stat-number">{totalKg} <span style={{ fontSize: '1rem' }}>kg</span></div>
            <div className="stat-label">Food Saved from Waste</div>
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
            <div className="stat-number">{co2Avoided} <span style={{ fontSize: '1rem' }}>kg</span></div>
            <div className="stat-label">CO2 Carbon Saved</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--icon-box-pink-bg)', color: 'var(--icon-box-pink-text)' }}>
            <Smile size={28} />
          </div>
          <div>
            <div className="stat-number">{stats?.average_user_rating || 5.0} ★</div>
            <div className="stat-label">Community Happiness</div>
          </div>
        </div>

      </div>

      {/* Breakdown & System Health */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        
        {/* Category Breakdown Progress Bars */}
        <div className="glass-panel" style={{ padding: '1.75rem', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Meals Shared by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { category: 'Hot Cooked Meals & Curries 🍛', percent: 62, kg: 95, color: '#16a34a' },
              { category: 'Fresh Bakery & Breads 🥐', percent: 20, kg: 28, color: '#f59e0b' },
              { category: 'Farm Produce & Salads 🥦', percent: 12, kg: 20, color: '#0284c7' },
              { category: 'Dairy & Milk Cartons 🥛', percent: 6, kg: 10, color: '#7c3aed' }
            ].map((item) => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.category}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>{item.kg} kg</strong> ({item.percent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.percent}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: '99px',
                      transition: 'width 0.6s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Status */}
        <div className="glass-panel" style={{ padding: '1.75rem', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Platform Status</h3>
            <button
              onClick={() => {
                verifyBackendHealth();
                sounds.playPop();
              }}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Backend Service</span>
              <span className={`badge ${isBackendOnline ? 'badge-available' : 'badge-reserved'}`}>
                {isBackendOnline ? 'ONLINE (:5000)' : 'STANDALONE SYNC'}
              </span>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Database Store</span>
              <span className={`badge ${backendHealth?.database?.includes('successfully') ? 'badge-available' : 'badge-pending'}`}>
                {backendHealth?.database || 'Local Store Ready'}
              </span>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Freshness Checks</span>
              <span className="badge badge-available">ACTIVE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Verified Partner Community Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Our Community Partners</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Kitchens, Shelters, and Volunteer Riders</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search community partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '34px', fontSize: '0.85rem', width: '220px' }}
              />
            </div>

            {['ALL', 'DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'].map(role => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  sounds.playPop();
                }}
                className="btn btn-sm"
                style={{
                  background: roleFilter === role ? 'var(--primary-500)' : 'var(--bg-surface-elevated)',
                  color: roleFilter === role ? '#fff' : 'var(--text-secondary)',
                  borderColor: roleFilter === role ? 'var(--primary-500)' : 'var(--border-subtle)',
                  fontSize: '0.775rem',
                  fontWeight: 700
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Partner / Member</th>
                <th style={{ padding: '0.85rem 1rem' }}>Community Role</th>
                <th style={{ padding: '0.85rem 1rem' }}>Contact</th>
                <th style={{ padding: '0.85rem 1rem' }}>Location Area</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.95rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{u.avatar || '👤'}</span>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{u.name}</strong>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.95rem 1rem' }}>
                    <span className={`role-badge ${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {u.phone}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                    {u.address}
                  </td>
                  <td style={{ padding: '0.95rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--role-donor)', fontSize: '0.825rem', fontWeight: 700 }}>
                      <CheckCircle2 size={15} /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Community Milestone Certificate Modal */}
      <ImpactCertificate
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        userName="Bengaluru Community Collective"
        role="COMMUNITY MILESTONE RECORD"
        totalKg={totalKg}
        meals={mealsServed}
        co2={co2Avoided}
      />

    </div>
  );
};

