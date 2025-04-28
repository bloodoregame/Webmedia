// Configuration API pour différents environnements

// Détection de l'environnement
const isNetlify = window.location.hostname.includes('netlify.app') || 
                 window.location.hostname.includes('netlify.com');

// Configuration des chemins d'API
export const API_BASE = isNetlify 
  ? '/.netlify/functions/api.cjs'  // Pour Netlify avec extension .cjs
  : '/api';                       // Pour développement local

// Autres configurations spécifiques à l'environnement
export const SITE_URL = isNetlify
  ? `https://${window.location.hostname}`
  : 'http://localhost:5000';

// Configuration pour le streaming audio
export const AUDIO_PATH = isNetlify
  ? `${SITE_URL}/.netlify/functions/audio.cjs`  // Fonction Netlify pour l'audio avec extension .cjs
  : '/api/audio';                              // Chemin en développement local

// Constantes pour l'upload et autres opérations
export const UPLOAD_ENDPOINT = `${API_BASE}/tracks`;
export const TRACKS_ENDPOINT = `${API_BASE}/tracks`;
export const PLAYLISTS_ENDPOINT = `${API_BASE}/playlists`;