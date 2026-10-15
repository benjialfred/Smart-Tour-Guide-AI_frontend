import React from 'react';
import { X, Bookmark, MapPin } from 'lucide-react';
import type { SavedPlace } from '../../types';

interface SavedPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: SavedPlace[];
  onFocusPlace: (place: SavedPlace) => void;
}

export const SavedPlacesModal: React.FC<SavedPlacesModalProps> = ({
  isOpen,
  onClose,
  places,
  onFocusPlace,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark size={20} color="#F59E0B" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Lieux Enregistrés
              </h3>
              <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0 }}>
                {places.length} favoris sauvegardés
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Places List */}
        <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {places.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8' }}>
              <Bookmark size={36} color="#64748B" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                Aucun lieu enregistré pour le moment.
              </p>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Cliquez sur « Favori » sur la popup d’un lieu sur la carte pour l’enregistrer.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {places.map((place) => (
                <div
                  key={place.id}
                  className="glass-card"
                  onClick={() => {
                    onFocusPlace(place);
                    onClose();
                  }}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MapPin size={16} color="#F59E0B" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 2px 0' }}>
                        {place.name}
                      </h4>
                      <p style={{ fontSize: '0.74rem', color: '#94A3B8', margin: 0 }}>
                        {place.address || 'Voir coordonnées'}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#06B6D4',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Voir sur la carte &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
