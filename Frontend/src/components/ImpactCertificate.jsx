import React from 'react';
import { Award, ShieldCheck, Heart, Leaf, Utensils, Download, Printer, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Modal } from './Modal';

export const ImpactCertificate = ({ isOpen, onClose, userName, role, totalKg = 153, meals = 383, co2 = 383 }) => {
  if (!isOpen) return null;

  const certId = `SNN-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Impact Certificate" subtitle="Recognizing your contribution to zero hunger & food rescue" maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Printable Certificate Frame */}
        <div
          id="printable-certificate"
          style={{
            position: 'relative',
            background: 'linear-gradient(145deg, #ffffff 0%, #faf8f5 50%, #f0fdf4 100%)',
            border: '6px double #16a34a',
            borderRadius: '18px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            color: '#1c1917',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Watermark Logo */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '180px', opacity: 0.04, pointerEvents: 'none' }}>
            🍲
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🍲</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#16a34a' }}>
              SHERO-NourishNet
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b45309', fontWeight: 800, marginBottom: '1rem' }}>
            Certificate of Community Impact & Recognition
          </div>

          <p style={{ fontSize: '0.9rem', color: '#78716c', fontStyle: 'italic' }}>
            This certificate is proudly awarded to
          </p>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', margin: '0.4rem 0 0.75rem', fontFamily: 'var(--font-heading)' }}>
            {userName || 'Community Champion'}
          </h2>

          <p style={{ fontSize: '0.925rem', color: '#44403c', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            In heartfelt appreciation for exemplary generosity and active dedication toward eliminating food waste and providing nutritious meals for community shelters.
          </p>

          {/* Metric Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.75rem' }}>
            <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <Utensils size={20} color="#15803d" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>{totalKg} kg</div>
              <div style={{ fontSize: '0.725rem', color: '#047857', fontWeight: 700 }}>Food Rescued</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <Heart size={20} color="#d97706" fill="#d97706" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706' }}>{meals}</div>
              <div style={{ fontSize: '0.725rem', color: '#b45309', fontWeight: 700 }}>Warm Meals Fed</div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
              <Leaf size={20} color="#0284c7" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{co2} kg</div>
              <div style={{ fontSize: '0.725rem', color: '#0369a1', fontWeight: 700 }}>CO2 Averted</div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e7e5e4', paddingTop: '1rem', fontSize: '0.75rem', color: '#78716c' }}>
            <div style={{ textAlign: 'left' }}>
              <p>Issued on: <strong>{dateStr}</strong></p>
              <p>Role: <strong>{role || 'FOOD HERO'}</strong></p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '0.8rem' }}>
              <ShieldCheck size={20} />
              <span>VERIFIED COMMUNITY RECORD</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p>Certificate ID:</p>
              <code style={{ fontSize: '0.75rem', color: '#1c1917', fontWeight: 700 }}>{certId}</code>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Close
          </button>
          <button type="button" onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
