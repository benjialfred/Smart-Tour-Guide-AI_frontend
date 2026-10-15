import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Locate,
} from 'lucide-react';
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../../types';

interface InteractiveMapProps {
  geojson: GeoJSONFeatureCollection | null;
  center?: [number, number];
  zoom?: number;
  onSelectPOI: (feature: GeoJSONFeature) => void;
  onSavePlace: (feature: GeoJSONFeature) => void;
  onAskGuideAboutPOI: (feature: GeoJSONFeature) => void;
  onPlaySpeech: (text: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const TILE_LAYERS = {
  dark: {
    name: 'Sombre Élite',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
  },
  voyager: {
    name: 'Voyageur Détaillé',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
  },
  osm: {
    name: 'Standard OSM',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  geojson,
  center = [48.8566, 2.3522],
  zoom = 13,
  onSelectPOI,
  onSavePlace,
  onAskGuideAboutPOI,
  onPlaySpeech,
  selectedCategory,
  onSelectCategory,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeTileKey, setActiveTileKey] = useState<keyof typeof TILE_LAYERS>('dark');
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    const tile = L.tileLayer(TILE_LAYERS[activeTileKey].url, {
      attribution: TILE_LAYERS[activeTileKey].attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tile;
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Layer Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_LAYERS[activeTileKey].url);
  }, [activeTileKey]);

  // Handle Center Update
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom]);

  // Render Features & Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const routeGroup = routeLayerGroupRef.current;

    if (!map || !markersGroup || !routeGroup) return;

    markersGroup.clearLayers();
    routeGroup.clearLayers();

    if (!geojson || !geojson.features || geojson.features.length === 0) return;

    const bounds = L.latLngBounds([]);

    geojson.features.forEach((feature, index) => {
      const geomType = feature.geometry?.type;
      const props = feature.properties || {};

      // ROUTE LINESTRING
      if (geomType === 'LineString' || props.is_route) {
        const coords = feature.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);

        const glowLine = L.polyline(coords, {
          color: '#06B6D4',
          weight: 8,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        });

        const routeLine = L.polyline(coords, {
          color: '#06B6D4',
          weight: 4,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round',
        });

        const routePopup = document.createElement('div');
        routePopup.className = 'glass-card';
        routePopup.style.padding = '12px';
        routePopup.innerHTML = `
          <div style="font-weight: 700; color: #06B6D4; font-size: 0.9rem; margin-bottom: 4px;">
            🚶 Itinéraire Recommandé
          </div>
          <div style="font-size: 0.8rem; color: #E2E8F0;">
            Distance: <strong>${props.distance_km || '?'} km</strong> &bull; Durée: <strong>${props.time_minutes || '?'} min</strong>
          </div>
        `;

        routeLine.bindPopup(routePopup);
        glowLine.addTo(routeGroup);
        routeLine.addTo(routeGroup);

        coords.forEach((c: [number, number]) => bounds.extend(c));
        return;
      }

      // POINT MARKER
      if (geomType === 'Point') {
        const coords = feature.geometry.coordinates;
        const lat = coords[1];
        const lon = coords[0];
        const category = props.category || 'poi';

        if (selectedCategory !== 'all' && category !== selectedCategory) {
          return;
        }

        const iconConfig = getMarkerVisuals(category);

        const customIcon = L.divIcon({
          className: 'custom-leaflet-poi',
          html: `
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: ${iconConfig.gradient};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 16px ${iconConfig.glow};
              border: 2px solid #FFFFFF;
              cursor: pointer;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
              <span style="font-size: 16px;">${iconConfig.emoji}</span>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([lat, lon], { icon: customIcon });

        const popupContainer = document.createElement('div');
        popupContainer.style.padding = '14px';
        popupContainer.style.minWidth = '240px';

        popupContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="
              background: ${iconConfig.badgeBg};
              color: ${iconConfig.badgeColor};
              font-size: 0.68rem;
              font-weight: 700;
              text-transform: uppercase;
              padding: 2px 8px;
              border-radius: 12px;
            ">
              ${iconConfig.label}
            </span>
            ${props.distance ? `<span style="font-size: 0.72rem; color: #94A3B8;">${Math.round(props.distance)}m</span>` : ''}
          </div>

          <h4 style="font-size: 1rem; font-weight: 700; color: #F8FAFC; margin-bottom: 4px; line-height: 1.2;">
            ${props.name}
          </h4>

          <p style="font-size: 0.76rem; color: #94A3B8; margin-bottom: 12px; line-height: 1.3;">
            ${props.formatted || 'Adresse disponible'}
          </p>

          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button id="btn-save-${index}" style="
              background: rgba(245, 158, 11, 0.15);
              border: 1px solid rgba(245, 158, 11, 0.4);
              color: #F59E0B;
              border-radius: 8px;
              padding: 5px 9px;
              font-size: 0.74rem;
              cursor: pointer;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              ⭐ Favori
            </button>
            <button id="btn-ask-${index}" style="
              background: rgba(6, 182, 212, 0.15);
              border: 1px solid rgba(6, 182, 212, 0.4);
              color: #06B6D4;
              border-radius: 8px;
              padding: 5px 9px;
              font-size: 0.74rem;
              cursor: pointer;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              💬 Guider
            </button>
            <button id="btn-audio-${index}" style="
              background: rgba(139, 92, 246, 0.15);
              border: 1px solid rgba(139, 92, 246, 0.4);
              color: #A78BFA;
              border-radius: 8px;
              padding: 5px 9px;
              font-size: 0.74rem;
              cursor: pointer;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              🔊 Audio
            </button>
          </div>
        `;

        marker.bindPopup(popupContainer);

        marker.on('popupopen', () => {
          onSelectPOI(feature);
          const saveBtn = document.getElementById(`btn-save-${index}`);
          const askBtn = document.getElementById(`btn-ask-${index}`);
          const audioBtn = document.getElementById(`btn-audio-${index}`);

          if (saveBtn) saveBtn.onclick = () => onSavePlace(feature);
          if (askBtn) askBtn.onclick = () => onAskGuideAboutPOI(feature);
          if (audioBtn)
            audioBtn.onclick = () =>
              onPlaySpeech(`Voici ${props.name}. ${props.formatted || ''}. Situé à ${props.city || 'proximité'}.`);
        });

        marker.addTo(markersGroup);
        bounds.extend([lat, lon]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [geojson, selectedCategory]);

  // Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 15, { duration: 1.5 });

          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div style="position: relative; width: 24px; height: 24px;">
                <div class="pulsing-marker-halo" style="
                  position: absolute;
                  inset: -6px;
                  border-radius: 50%;
                  background: rgba(6, 182, 212, 0.4);
                "></div>
                <div style="
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: #06B6D4;
                  border: 3px solid #FFFFFF;
                  box-shadow: 0 0 14px rgba(6, 182, 212, 0.9);
                "></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker(coords, { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup("<div style='padding: 8px; font-weight: 700; color: #06B6D4;'>📍 Votre position actuelle</div>")
            .openPopup();
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Floating Category Filter Pills */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 500,
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          flexWrap: 'wrap',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
        }}
      >
        <button
          onClick={() => onSelectCategory('all')}
          className={`pill-filter ${selectedCategory === 'all' ? 'active' : ''}`}
        >
          🌟 Tous
        </button>
        <button
          onClick={() => onSelectCategory('monument')}
          className={`pill-filter ${selectedCategory === 'monument' ? 'active' : ''}`}
        >
          🏛️ Monuments
        </button>
        <button
          onClick={() => onSelectCategory('food')}
          className={`pill-filter ${selectedCategory === 'food' ? 'active' : ''}`}
        >
          ☕ Restaurants & Cafés
        </button>
        <button
          onClick={() => onSelectCategory('nature')}
          className={`pill-filter ${selectedCategory === 'nature' ? 'active' : ''}`}
        >
          🌿 Parcs & Nature
        </button>
        <button
          onClick={() => onSelectCategory('entertainment')}
          className={`pill-filter ${selectedCategory === 'entertainment' ? 'active' : ''}`}
        >
          🎭 Culture
        </button>
      </div>

      {/* Map Control Buttons (Layers, Locate) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Layer Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className="btn-secondary"
            style={{
              width: '42px',
              height: '42px',
              padding: 0,
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'rgba(14, 21, 36, 0.9)',
            }}
            title="Changer le style de carte"
          >
            <Layers size={18} color="#06B6D4" />
          </button>

          {showLayersMenu && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                left: '52px',
                bottom: 0,
                width: '180px',
                padding: '8px',
                zIndex: 600,
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', padding: '4px 6px', fontWeight: 600 }}>
                Styles de Carte
              </div>
              {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((key) => (
                <div
                  key={key}
                  onClick={() => {
                    setActiveTileKey(key);
                    setShowLayersMenu(false);
                  }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: activeTileKey === key ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                    color: activeTileKey === key ? '#06B6D4' : '#E2E8F0',
                    fontSize: '0.8rem',
                    fontWeight: activeTileKey === key ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {TILE_LAYERS[key].name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locate Me */}
        <button
          onClick={handleLocateMe}
          className="btn-secondary"
          style={{
            width: '42px',
            height: '42px',
            padding: 0,
            justifyContent: 'center',
            borderRadius: '12px',
            background: 'rgba(14, 21, 36, 0.9)',
          }}
          title="Me localiser sur la carte"
        >
          <Locate size={18} color="#10B981" />
        </button>
      </div>
    </div>
  );
};

function getMarkerVisuals(category: string) {
  switch (category) {
    case 'monument':
      return {
        emoji: '🏛️',
        label: 'Monument',
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
        glow: 'rgba(139, 92, 246, 0.5)',
        badgeBg: 'rgba(139, 92, 246, 0.2)',
        badgeColor: '#C4B5FD',
      };
    case 'food':
      return {
        emoji: '🍷',
        label: 'Gastronomie',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        glow: 'rgba(245, 158, 11, 0.5)',
        badgeBg: 'rgba(245, 158, 11, 0.2)',
        badgeColor: '#FDE68A',
      };
    case 'nature':
      return {
        emoji: '🌿',
        label: 'Nature & Parc',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        glow: 'rgba(16, 185, 129, 0.5)',
        badgeBg: 'rgba(16, 185, 129, 0.2)',
        badgeColor: '#A7F3D0',
      };
    case 'entertainment':
      return {
        emoji: '🎭',
        label: 'Culture & Art',
        gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
        glow: 'rgba(236, 72, 153, 0.5)',
        badgeBg: 'rgba(236, 72, 153, 0.2)',
        badgeColor: '#FBCFE8',
      };
    case 'shopping':
      return {
        emoji: '🛍️',
        label: 'Boutique & Marché',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        glow: 'rgba(59, 130, 246, 0.5)',
        badgeBg: 'rgba(59, 130, 246, 0.2)',
        badgeColor: '#BFDBFE',
      };
    default:
      return {
        emoji: '📍',
        label: 'Lieu d’intérêt',
        gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
        glow: 'rgba(6, 182, 212, 0.5)',
        badgeBg: 'rgba(6, 182, 212, 0.2)',
        badgeColor: '#A5F3FC',
      };
  }
}
