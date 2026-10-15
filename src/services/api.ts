import type {
  ChatMessage,
  GeoJSONFeatureCollection,
  HealthStatus,
  ItineraryStop,
  SavedItinerary,
  SavedPlace,
  TourSession,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : 'https://smart-tour-guide-ai-backend.onrender.com/api');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errBody = await response.text();
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errBody);
        errorMsg = parsed.error || parsed.detail || JSON.stringify(parsed);
      } catch {
        // Keep string error
      }
      throw new Error(errorMsg);
    }
    return (await response.json()) as T;
  } catch (error: any) {
    console.error(`API request error on ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Health
  checkHealth: () => request<HealthStatus>('/health/'),

  // Chat
  sendChatMessage: (params: {
    session_id?: string | null;
    message: string;
    user_location?: { lat: number; lon: number } | null;
    destination?: string | null;
  }) =>
    request<{
      reply: string;
      geojson: GeoJSONFeatureCollection;
      itinerary: ItineraryStop[];
      audio_script: string;
      session_id: string;
    }>('/chat/', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Sessions
  getSessions: () => request<TourSession[]>('/sessions/'),
  createSession: (data: { title?: string; destination?: string }) =>
    request<TourSession>('/sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSessionDetail: (id: string) =>
    request<TourSession & { messages: ChatMessage[] }>(`/sessions/${id}/`),
  deleteSession: (id: string) =>
    request<void>(`/sessions/${id}/`, {
      method: 'DELETE',
    }),

  // Geocoding & POIs
  searchGeocode: (text: string) =>
    request<GeoJSONFeatureCollection>(`/geo/geocode/?text=${encodeURIComponent(text)}`),

  searchPlaces: (params: {
    text?: string;
    categories?: string[];
    lat?: number;
    lon?: number;
    radius?: number;
  }) => {
    const q = new URLSearchParams();
    if (params.text) q.set('text', params.text);
    if (params.categories) q.set('categories', params.categories.join(','));
    if (params.lat !== undefined) q.set('lat', params.lat.toString());
    if (params.lon !== undefined) q.set('lon', params.lon.toString());
    if (params.radius) q.set('radius', params.radius.toString());
    return request<GeoJSONFeatureCollection>(`/geo/places/?${q.toString()}`);
  },

  // Routing
  calculateRoute: (waypoints: { lat: number; lon: number; name?: string }[], mode: string = 'walk') =>
    request<GeoJSONFeatureCollection>('/geo/route/', {
      method: 'POST',
      body: JSON.stringify({ waypoints, mode }),
    }),

  // Itineraries
  getItineraries: () => request<SavedItinerary[]>('/itineraries/'),
  saveItinerary: (data: Partial<SavedItinerary>) =>
    request<SavedItinerary>('/itineraries/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Places
  getSavedPlaces: () => request<SavedPlace[]>('/places/'),
  savePlace: (data: Partial<SavedPlace>) =>
    request<SavedPlace>('/places/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
