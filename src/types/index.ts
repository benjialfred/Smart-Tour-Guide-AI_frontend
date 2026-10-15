export type POICategory = 'monument' | 'food' | 'nature' | 'entertainment' | 'shopping' | 'poi' | 'search_result';

export interface POIProperties {
  name: string;
  category: POICategory;
  categories?: string[];
  formatted: string;
  city?: string;
  country?: string;
  lat: number;
  lon: number;
  website?: string;
  phone?: string;
  opening_hours?: string;
  wikipedia?: string;
  place_id?: string;
  distance?: number;
  is_route?: boolean;
  distance_km?: number;
  time_minutes?: number;
  steps?: { instruction: string; distance_m: number; time_s: number }[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  id?: string;
  geometry: {
    type: 'Point' | 'LineString' | 'MultiLineString' | 'Polygon';
    coordinates: any;
  };
  properties: POIProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  warning?: string;
  error?: string;
}

export interface ItineraryStop {
  step: number;
  name: string;
  category: POICategory;
  formatted: string;
  lat: number;
  lon: number;
  place_id?: string;
  suggested_duration?: string;
  notes?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  metadata?: {
    geojson?: GeoJSONFeatureCollection;
    itinerary?: ItineraryStop[];
    audio_script?: string;
    tool_calls?: { tool: string; arguments: any; result: string }[];
  };
  timestamp?: string;
}

export interface TourSession {
  id: string;
  title: string;
  destination: string;
  center_lat?: number | null;
  center_lon?: number | null;
  created_at?: string;
  updated_at?: string;
  messages_count?: number;
  last_message?: { role: string; content: string; timestamp: string } | null;
}

export interface SavedItinerary {
  id: string;
  session?: string;
  title: string;
  destination: string;
  duration_type: string;
  stops_data: ItineraryStop[];
  route_geojson?: GeoJSONFeatureCollection | any;
  total_distance_meters: number;
  total_time_seconds: number;
  created_at?: string;
}

export interface SavedPlace {
  id: string;
  session?: string;
  place_id?: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lon: number;
  details?: Record<string, any>;
  created_at?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  groq_configured: boolean;
  geoapify_configured: boolean;
  model: string;
}
