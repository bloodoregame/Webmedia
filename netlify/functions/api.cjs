const express = require('express');
const serverless = require('serverless-http');
const app = express();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Simuler le stockage mémoire pour Netlify Functions
// Note: Comme les fonctions Netlify sont sans état, ceci sera réinitialisé à chaque invocation
// Pour une solution de production, utilisez un service de base de données comme FaunaDB, Supabase, etc.
class NetlifyMemStorage {
  constructor() {
    this.tracks = [
      {
        id: 1,
        title: 'Été Ensoleillé',
        artist: 'DJ Soleil',
        album: 'Saisons Musicales',
        duration: 248,
        filename: 'track1.mp3',
        coverImage: 'https://via.placeholder.com/500?text=DJ+Soleil',
        uploadedAt: new Date('2025-04-01T10:30:00Z')
      },
      {
        id: 2,
        title: 'Nuit Parisienne',
        artist: 'Mélodie Nocturne',
        album: 'Voyages Sonores',
        duration: 186,
        filename: 'track2.mp3',
        coverImage: 'https://via.placeholder.com/500?text=Melodie+Nocturne',
        uploadedAt: new Date('2025-04-05T14:20:00Z')
      }
    ];
    
    this.playlists = [
      {
        id: 1,
        name: 'Favoris',
        createdAt: new Date('2025-04-01T09:00:00Z')
      },
      {
        id: 2,
        name: 'Musiques téléchargées',
        createdAt: new Date('2025-04-01T09:00:00Z')
      }
    ];
    
    this.playlistTracks = [
      {
        id: 1,
        playlistId: 1,
        trackId: 1,
        addedAt: new Date('2025-04-01T11:00:00Z')
      },
      {
        id: 2,
        playlistId: 2,
        trackId: 1,
        addedAt: new Date('2025-04-01T11:05:00Z')
      },
      {
        id: 3,
        playlistId: 2,
        trackId: 2,
        addedAt: new Date('2025-04-05T15:00:00Z')
      }
    ];
  }

  async getTracks() {
    return this.tracks;
  }

  async getTrack(id) {
    return this.tracks.find(track => track.id === id);
  }

  async getTrackByFilename(filename) {
    return this.tracks.find(track => track.filename === filename);
  }

  async searchTracks(query) {
    if (!query) return this.tracks;
    
    const lowercaseQuery = query.toLowerCase();
    return this.tracks.filter(track => {
      return track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery) ||
        (track.album && track.album.toLowerCase().includes(lowercaseQuery));
    });
  }

  async getPlaylists() {
    return this.playlists;
  }

  async getPlaylist(id) {
    return this.playlists.find(playlist => playlist.id === id);
  }

  async getPlaylistTracks(playlistId) {
    const playlistTrackIds = this.playlistTracks
      .filter(pt => pt.playlistId === playlistId)
      .map(pt => pt.trackId);
    
    return this.tracks.filter(track => playlistTrackIds.includes(track.id));
  }
}

// Créer une instance de stockage mémoire pour Netlify
const storage = new NetlifyMemStorage();

// Middleware
app.use(cors({
  origin: '*', // Attention: en production, limitez aux domaines autorisés
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour debugging des requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Helper pour la gestion des erreurs
const handleError = (res, error) => {
  console.error(error);
  return res.status(500).json({ 
    message: error.message || 'Internal server error' 
  });
};

// Routes API
// Obtenir tous les morceaux
app.get('/tracks', async (req, res) => {
  try {
    const searchQuery = req.query.search;
    
    if (searchQuery) {
      const tracks = await storage.searchTracks(searchQuery);
      return res.json(tracks);
    }
    
    const tracks = await storage.getTracks();
    res.json(tracks);
  } catch (error) {
    handleError(res, error);
  }
});

// Obtenir un morceau spécifique
app.get('/tracks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const track = await storage.getTrack(id);
    
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    
    res.json(track);
  } catch (error) {
    handleError(res, error);
  }
});

// Obtenir toutes les playlists
app.get('/playlists', async (req, res) => {
  try {
    const playlists = await storage.getPlaylists();
    res.json(playlists);
  } catch (error) {
    handleError(res, error);
  }
});

// Obtenir une playlist avec ses morceaux
app.get('/playlists/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const playlist = await storage.getPlaylist(id);
    
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    const tracks = await storage.getPlaylistTracks(id);
    
    res.json({
      ...playlist,
      tracks
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Route pour l'audio (mock pour Netlify - dans une application réelle, utilisez un service de stockage comme S3)
app.get('/audio/:filename', async (req, res) => {
  try {
    // Ici, dans une version réelle, vous récupéreriez le fichier depuis un service comme AWS S3
    const filename = req.params.filename;
    const track = await storage.getTrackByFilename(filename);
    
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    
    // Pour le déploiement Netlify, nous retournons une réponse simulée
    // En production, vous devriez utiliser un service de stockage externe pour les fichiers audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': 1024, // Factice
    });
    
    // Simulation d'un fichier audio pour Netlify
    // Note: Ceci ne fonctionnera pas pour une lecture réelle
    res.send(Buffer.from('Audio mock data for Netlify deployment'));
  } catch (error) {
    handleError(res, error);
  }
});

// Installer multer pour le traitement multipart/form-data
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  }
});

// Route pour l'upload de fichiers (mock pour Netlify Functions)
app.post('/tracks', upload.single('file'), async (req, res) => {
  try {
    console.log('POST /tracks - Début du traitement');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Dans un environnement Netlify Functions, nous simulons l'upload
    // Dans une vraie implémentation, vous utiliseriez un service comme AWS S3
    // et une base de données pour stocker les métadonnées
    
    // Vérification de la présence de données dans la requête
    if (!req.body) {
      console.log('Aucun corps de requête détecté');
      return res.status(400).json({ message: "No form data provided" });
    }
    
    // Extraction des champs du formulaire
    const title = req.body.title || 'Untitled';
    const artist = req.body.artist || 'Unknown Artist';
    const album = req.body.album || null;
    
    console.log(`Métadonnées reçues: title=${title}, artist=${artist}, album=${album}`);
    
    // Vérifier si un fichier a été reçu
    let filename = '';
    if (req.file) {
      console.log('Fichier reçu:', req.file.originalname);
      // Dans une vraie implémentation, vous sauvegarderiez le fichier ici
      filename = `track-${Date.now()}-${Math.floor(Math.random() * 1000)}.mp3`;
    } else {
      console.log('Aucun fichier reçu, utilisation d\'un nom généré');
      // Génération d'un nom de fichier unique (simulé)
      filename = `track-${Date.now()}-${Math.floor(Math.random() * 1000)}.mp3`;
    }
    
    // Création d'un nouvel ID
    const newId = Math.max(...storage.tracks.map(t => t.id), 0) + 1;
    
    // Création d'un nouveau track
    const newTrack = {
      id: newId,
      title,
      artist,
      album,
      duration: Math.floor(Math.random() * 300) + 60, // Durée aléatoire entre 1-6 minutes
      filename,
      coverImage: `https://via.placeholder.com/500?text=${encodeURIComponent(title)}`,
      uploadedAt: new Date()
    };
    
    console.log('Nouveau track créé:', newTrack);
    
    // Ajout à notre "stockage"
    storage.tracks.push(newTrack);
    
    // Ajout à la playlist "Téléchargées"
    const downloadedPlaylistId = 2; // ID de la playlist "Musiques téléchargées"
    const newPlaylistTrackId = Math.max(...storage.playlistTracks.map(pt => pt.id), 0) + 1;
    
    storage.playlistTracks.push({
      id: newPlaylistTrackId,
      playlistId: downloadedPlaylistId,
      trackId: newId,
      addedAt: new Date()
    });
    
    console.log('Track ajouté avec succès à la playlist');
    
    res.status(201).json(newTrack);
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    handleError(res, error);
  }
});

// Exportation pour Netlify Functions
module.exports.handler = serverless(app);