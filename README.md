# Smart Tour Guide AI — Frontend React, TypeScript, Vite & Leaflet

Application frontend ultra-moderne pour **Smart Tour Guide AI**, conçue avec React 19, TypeScript, Vite et Leaflet pour une expérience de guide touristique interactive, fluide et esthétique.

---

## 🌟 Fonctionnalités Principales

- **Cartographie Interactive Leaflet** :
  - Fond de carte moderne (CartoDB Dark Matter, Voyager, OpenStreetMap).
  - Marqueurs SVG personnalisés par catégorie (🏛️ Monuments en Violet, 🍷 Restaurants en Ambre, 🌿 Parcs en Émeraude, 🎭 Culture en Rose).
  - Tracé d'itinéraires piétons fluides avec distance et temps de marche estimés.
  - Bouton de géolocalisation « Me localiser » avec marqueur à halo pulsant.
- **Interface Conversationnelle Tour Guide IA** :
  - Dialogue interactif avec le guide culturel propulsé par Grok et Geoapify MCP.
  - Puces de questions rapides pour inspiration immédiate.
  - Interaction bidirectionnelle carte/chat : cliquer sur un nom de lieu dans le chat centre la carte et ouvre le marqueur correspondant.
- **Guide Audio Intégré (Web Speech API)** :
  - Synthèse vocale naturelle en français avec animation d'ondes sonores et contrôles (Play / Stop).
- **Gestionnaire d'Itinéraire** :
  - Timeline ordonnée des étapes, calcul d'itinéraire à pied optimisé et export en JSON / GeoJSON.
- **Carnet de Favoris** :
  - Sauvegarde en un clic des lieux coup de cœur.
- **Design & Ergonomie** :
  - Thème sombre haut de gamme, effet de verre dépoli (*glassmorphism*), polices soignées (*Outfit* et *Plus Jakarta Sans*).

---

## 📁 Structure du Projet

```
Smart-Tour-Guide-AI_frontend/
├── index.html               # Point d'entrée HTML, Leaflet CSS & polices Google
├── package.json             # Dépendances & scripts Vite
├── tsconfig.json            # Configuration TypeScript stricte
├── vite.config.ts           # Configuration du serveur de développement
└── src/
    ├── main.tsx
    ├── App.tsx              # Orchestration principale de l'état
    ├── index.css            # Système de design sombre, glassmorphism & animations
    ├── types/               # Typages stricts (GeoJSON, Sessions, Chat, POI)
    ├── services/
    │   └── api.ts           # Client API vers le backend Django
    └── components/
        ├── Header.tsx       # Barre de navigation, recherche de ville & gestion des sessions
        ├── Map/
        │   └── InteractiveMap.tsx # Carte Leaflet avec marqueurs dynamiques & couches
        ├── Chat/
        │   └── ChatGuidePanel.tsx # Panneau de conversation avec le guide & lecteur audio
        ├── Itinerary/
        │   └── ItineraryModal.tsx # Fenêtre de gestion et tracé de l'itinéraire
        └── Places/
            └── SavedPlacesModal.tsx # Fenêtre des favoris enregistrés
```

---

## 🛠️ Démarrage Rapide

### 1. Installer les dépendances (si nécessaire)

```bash
cd Smart-Tour-Guide-AI_frontend
npm install
```

### 2. Démarrer le serveur de développement

```bash
npm run dev
```

L'application s'ouvrira sur `http://localhost:5173`.

### 3. Compiler pour la production

```bash
npm run build
```

Le build optimisé est généré dans le dossier `dist/`.
