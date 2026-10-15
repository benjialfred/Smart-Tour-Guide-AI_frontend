import React, { useState } from 'react';
import {
  Compass,
  Search,
  Plus,
  Route,
  Bookmark,
  Sparkles,
  History,
  Trash2,
} from 'lucide-react';
import type { TourSession } from '../types';

interface HeaderProps {
  currentSession: TourSession | null;
  sessions: TourSession[];
  onSelectSession: (session: TourSession) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onSearchDestination: (query: string) => void;
  onOpenItinerary: () => void;
  onOpenSavedPlaces: () => void;
  itineraryStopsCount: number;
  savedPlacesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  sessions,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onSearchDestination,
  onOpenItinerary,
  onOpenSavedPlaces,
  itineraryStopsCount,
  savedPlacesCount,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchDestination(searchInput.trim());
    }
  };

  return (
    <header className="glass-panel" style={{ margin: '12px 16px', padding: '10px 18px', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onNewSession}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)',
          }}>
            <Compass size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
                Smart Tour Guide <span style={{ color: '#06B6D4' }}>AI</span>
              </h1>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.68rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={11} /> Grok & MCP
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94A3B8', margin: 0 }}>
              {currentSession?.destination
                ? `Destination active : ${currentSession.destination}`
                : 'Guide culturel & cartographique temps réel'}
            </p>
          </div>
        </div>

        {/* Destination Quick Search */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 280px', maxWidth: '420px', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '4px 12px',
            transition: 'border-color 0.2s',
          }}>
            <Search size={18} color="#94A3B8" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Explorer une ville (ex: Rome, Kyoto, Paris)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F8FAFC',
                fontSize: '0.88rem',
                width: '100%',
                padding: '6px 0',
              }}
            />
            {searchInput && (
              <button
                type="submit"
                style={{
                  background: '#06B6D4',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Go
              </button>
            )}
          </div>
        </form>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Itinerary Button */}
          <button
            onClick={onOpenItinerary}
            className="btn-secondary"
            title="Consulter l'itinéraire"
          >
            <Route size={16} color="#06B6D4" />
            <span>Itinéraire</span>
            {itineraryStopsCount > 0 && (
              <span style={{
                background: '#06B6D4',
                color: '#000',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.7rem'
              }}>
                {itineraryStopsCount}
              </span>
            )}
          </button>

          {/* Bookmarks Button */}
          <button
            onClick={onOpenSavedPlaces}
            className="btn-secondary"
            title="Lieux enregistrés"
          >
            <Bookmark size={16} color="#F59E0B" />
            <span>Favoris</span>
            {savedPlacesCount > 0 && (
              <span style={{
                background: '#F59E0B',
                color: '#000',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.7rem'
              }}>
                {savedPlacesCount}
              </span>
            )}
          </button>

          {/* Sessions Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSessionDropdown(!showSessionDropdown)}
              className="btn-secondary"
              title="Historique des visites"
            >
              <History size={16} />
              <span>Visites ({sessions.length})</span>
            </button>

            {showSessionDropdown && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '280px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  padding: '8px',
                  zIndex: 250,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', padding: '6px 8px', fontWeight: 600 }}>
                  Historique des sessions
                </div>
                {sessions.length === 0 ? (
                  <div style={{ padding: '12px', fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
                    Aucune visite enregistrée
                  </div>
                ) : (
                  sessions.map((sess) => (
                    <div
                      key={sess.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: currentSession?.id === sess.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                        cursor: 'pointer',
                        marginBottom: '4px',
                        fontSize: '0.82rem',
                      }}
                      onClick={() => {
                        onSelectSession(sess);
                        setShowSessionDropdown(false);
                      }}
                    >
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        <div style={{ fontWeight: currentSession?.id === sess.id ? 700 : 500, color: '#F8FAFC' }}>
                          {sess.title || sess.destination || 'Visite sans titre'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          {sess.destination || 'Sans lieu'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(sess.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Supprimer la session"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* New Tour Button */}
          <button onClick={onNewSession} className="btn-primary" title="Commencer un nouveau tour">
            <Plus size={16} />
            <span>Nouveau Tour</span>
          </button>
        </div>

      </div>
    </header>
  );
};
