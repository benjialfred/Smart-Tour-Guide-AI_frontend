import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { ChatGuidePanel } from './components/Chat/ChatGuidePanel';
import { ItineraryModal } from './components/Itinerary/ItineraryModal';
import { SavedPlacesModal } from './components/Places/SavedPlacesModal';
import { api } from './services/api';
import type {
  ChatMessage,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  ItineraryStop,
  SavedPlace,
  TourSession,
} from './types';

export function App() {
  const [sessions, setSessions] = useState<TourSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TourSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [geojson, setGeojson] = useState<GeoJSONFeatureCollection | null>(null);
  const [itineraryStops, setItineraryStops] = useState<ItineraryStop[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default Paris
  const [mapZoom, setMapZoom] = useState(13);

  // Audio Guide Speech Synthesis
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioScript, setAudioScript] = useState<string | null>(null);

  // Modals
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isSavedPlacesOpen, setIsSavedPlacesOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadSessions();
    loadSavedPlaces();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      if (data.length > 0) {
        selectSession(data[0]);
      } else {
        startNewSession();
      }
    } catch (err) {
      console.warn('Could not load sessions:', err);
      startNewSession();
    }
  };

  const loadSavedPlaces = async () => {
    try {
      const data = await api.getSavedPlaces();
      setSavedPlaces(data);
    } catch (err) {
      console.warn('Could not load saved places:', err);
    }
  };

  const selectSession = async (session: TourSession) => {
    setCurrentSession(session);
    try {
      const details = await api.getSessionDetail(session.id);
      setMessages(details.messages || []);

      for (let i = details.messages.length - 1; i >= 0; i--) {
        const meta = details.messages[i].metadata;
        if (meta?.geojson?.features?.length) {
          setGeojson(meta.geojson);
          if (meta.itinerary?.length) {
            setItineraryStops(meta.itinerary);
          }
          if (meta.audio_script) {
            setAudioScript(meta.audio_script);
          }
          break;
        }
      }

      if (session.center_lat && session.center_lon) {
        setMapCenter([session.center_lat, session.center_lon]);
      }
    } catch (err) {
      console.error('Failed to load session details:', err);
    }
  };

  const startNewSession = async (destination?: string) => {
    stopSpeech();
    try {
      const newSession = await api.createSession({
        title: destination ? `Visite de ${destination}` : 'Nouvelle Exploration',
        destination: destination || '',
      });
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      setGeojson(null);
      setItineraryStops([]);
      setAudioScript(null);
    } catch (err) {
      const fallback: TourSession = {
        id: crypto.randomUUID(),
        title: destination ? `Visite de ${destination}` : 'Nouvelle Exploration',
        destination: destination || '',
      };
      setCurrentSession(fallback);
      setMessages([]);
      setGeojson(null);
      setItineraryStops([]);
      setAudioScript(null);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSession?.id === id) {
        startNewSession();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // Search Destination
  const handleSearchDestination = async (query: string) => {
    try {
      const res = await api.searchGeocode(query);
      if (res.features && res.features.length > 0) {
        const topResult = res.features[0];
        const coords = topResult.geometry.coordinates;
        const newCenter: [number, number] = [coords[1], coords[0]];
        setMapCenter(newCenter);
        setMapZoom(14);
        setGeojson(res);

        handleSendMessage(`Fais-moi découvrir ${topResult.properties.name || query} !`);
      }
    } catch (err) {
      console.error('Search destination failed:', err);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await api.sendChatMessage({
        session_id: currentSession?.id,
        message: text,
        destination: currentSession?.destination,
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        metadata: {
          geojson: response.geojson,
          itinerary: response.itinerary,
          audio_script: response.audio_script,
        },
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.geojson && response.geojson.features && response.geojson.features.length > 0) {
        setGeojson(response.geojson);

        const firstPoint = response.geojson.features.find((f) => f.geometry.type === 'Point');
        if (firstPoint) {
          const c = firstPoint.geometry.coordinates;
          setMapCenter([c[1], c[0]]);
        }
      }

      if (response.itinerary && response.itinerary.length > 0) {
        setItineraryStops(response.itinerary);
      }

      if (response.audio_script) {
        setAudioScript(response.audio_script);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Désolé, une erreur est survenue lors de l'échange : ${err.message || err}. Veuillez réessayer.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Calculate Walking Route for Itinerary Stops
  const handleCalculateRoute = async () => {
    if (itineraryStops.length < 2) return;
    setIsRoutingLoading(true);

    try {
      const waypoints = itineraryStops.map((s) => ({
        lat: s.lat,
        lon: s.lon,
        name: s.name,
      }));

      const routeRes = await api.calculateRoute(waypoints, 'walk');

      if (routeRes.features && routeRes.features.length > 0) {
        const routeFeature = routeRes.features[0];

        setGeojson((prev) => {
          const nonRoutes = (prev?.features || []).filter((f) => !f.properties?.is_route);
          return {
            type: 'FeatureCollection',
            features: [...nonRoutes, routeFeature],
          };
        });

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06B6D4', '#10B981', '#8B5CF6'],
        });

        setIsItineraryOpen(false);
      }
    } catch (err) {
      console.error('Route calculation failed:', err);
      alert('Impossible de calculer le tracé à pied entre ces étapes.');
    } finally {
      setIsRoutingLoading(false);
    }
  };

  // Save Place to Bookmarks
  const handleSavePlace = async (feature: GeoJSONFeature) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;

    try {
      const saved = await api.savePlace({
        session: currentSession?.id,
        name: props.name,
        category: props.category,
        address: props.formatted,
        lat: coords[1],
        lon: coords[0],
        place_id: props.place_id,
        details: props as any,
      });

      setSavedPlaces((prev) => [saved, ...prev]);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#FBBF24'],
      });
    } catch (err) {
      console.error('Failed to save place:', err);
    }
  };

  // Audio Speech Synthesis Handler
  const handlePlaySpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Votre navigateur ne supporte pas la synthèse vocale (Web Speech API).");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find((v) => v.lang.startsWith('fr'));
    if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Center on clicked POI
  const handleSelectPOIName = (poiName: string) => {
    if (!geojson?.features) return;
    const match = geojson.features.find(
      (f) => f.properties?.name?.toLowerCase().includes(poiName.toLowerCase())
    );
    if (match && match.geometry.type === 'Point') {
      const c = match.geometry.coordinates;
      setMapCenter([c[1], c[0]]);
      setMapZoom(16);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg-dark)' }}>
      {/* Top Navbar Header */}
      <Header
        currentSession={currentSession}
        sessions={sessions}
        onSelectSession={selectSession}
        onNewSession={() => startNewSession()}
        onDeleteSession={handleDeleteSession}
        onSearchDestination={handleSearchDestination}
        onOpenItinerary={() => setIsItineraryOpen(true)}
        onOpenSavedPlaces={() => setIsSavedPlacesOpen(true)}
        itineraryStopsCount={itineraryStops.length}
        savedPlacesCount={savedPlaces.length}
      />

      {/* Main Split Layout: Left Chat Guide | Right Interactive Map */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '430px 1fr',
          gap: '12px',
          padding: '0 16px 16px 16px',
          overflow: 'hidden',
        }}
      >
        {/* Left Side: AI Guide Chat Panel */}
        <section style={{ height: '100%', overflow: 'hidden' }}>
          <ChatGuidePanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onSelectPOIName={handleSelectPOIName}
            onPlaySpeech={handlePlaySpeech}
            onStopSpeech={stopSpeech}
            isSpeaking={isSpeaking}
            audioScript={audioScript}
          />
        </section>

        {/* Right Side: Leaflet Interactive Map */}
        <section className="glass-panel" style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
          <InteractiveMap
            geojson={geojson}
            center={mapCenter}
            zoom={mapZoom}
            onSelectPOI={(feat) => console.log('Selected POI:', feat.properties.name)}
            onSavePlace={handleSavePlace}
            onAskGuideAboutPOI={(feat) => handleSendMessage(`Raconte-moi l'histoire et les secrets de ${feat.properties.name}`)}
            onPlaySpeech={handlePlaySpeech}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>
      </main>

      {/* Itinerary Modal */}
      <ItineraryModal
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        stops={itineraryStops}
        onFocusStop={(stop) => {
          setMapCenter([stop.lat, stop.lon]);
          setMapZoom(16);
        }}
        onCalculateRoute={handleCalculateRoute}
        onSaveItinerary={async () => {
          try {
            await api.saveItinerary({
              session: currentSession?.id,
              title: currentSession?.title || 'Mon Itinéraire',
              destination: currentSession?.destination || 'Ville',
              stops_data: itineraryStops,
              total_distance_meters: 2500,
            });
            alert('Itinéraire enregistré avec succès !');
          } catch (e) {
            console.error('Failed to save itinerary:', e);
          }
        }}
        isRoutingLoading={isRoutingLoading}
      />

      {/* Saved Places Modal */}
      <SavedPlacesModal
        isOpen={isSavedPlacesOpen}
        onClose={() => setIsSavedPlacesOpen(false)}
        places={savedPlaces}
        onFocusPlace={(place) => {
          setMapCenter([place.lat, place.lon]);
          setMapZoom(16);
        }}
      />
    </div>
  );
}

export default App;
