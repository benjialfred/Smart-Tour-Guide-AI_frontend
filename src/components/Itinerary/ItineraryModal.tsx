import React from 'react';
import {
  X,
  Route,
  Clock,
  Download,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import type { ItineraryStop } from '../../types';

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stops: ItineraryStop[];
  onFocusStop: (stop: ItineraryStop) => void;
  onCalculateRoute: () => void;
  onSaveItinerary: () => void;
  isRoutingLoading: boolean;
}

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  stops,
  onFocusStop,
  onCalculateRoute,
  onSaveItinerary,
  isRoutingLoading,
}) => {
  if (!isOpen) return null;

  const handleExportGeoJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stops, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'smart_tour_itinerary.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Route size={20} color="#06B6D4" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Programme & Circuit de Visite
              </h3>
              <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0 }}>
                {stops.length} étapes planifiées par le guide
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

        {/* Content Body */}
        <div style={{ padding: '20px 24px' }}>
          {stops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8' }}>
              <Navigation size={36} color="#64748B" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                Aucune étape d’itinéraire active.
              </p>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Demandez à l'assistant dans le chat : « <em>Organise-moi un parcours de 4 heures à pied</em> ».
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stops.map((stop, index) => (
                <div
                  key={index}
                  className="glass-card"
                  onClick={() => {
                    onFocusStop(stop);
                    onClose();
                  }}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#06B6D4',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {stop.step || index + 1}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: 700, margin: '0 0 3px 0', color: '#F8FAFC' }}>
                        {stop.name}
                      </h4>
                      <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0 }}>
                        {stop.formatted || 'Adresse sur la carte'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {stop.suggested_duration && (
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#CBD5E1',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={11} /> {stop.suggested_duration}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {stops.length > 0 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <button onClick={handleExportGeoJSON} className="btn-secondary">
              <Download size={15} />
              <span>Exporter JSON</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onSaveItinerary} className="btn-secondary">
                <CheckCircle size={15} color="#10B981" />
                <span>Enregistrer</span>
              </button>

              <button
                onClick={onCalculateRoute}
                disabled={isRoutingLoading || stops.length < 2}
                className="btn-primary"
              >
                <Navigation size={15} />
                <span>{isRoutingLoading ? 'Calcul...' : 'Tracer le trajet sur la carte'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
