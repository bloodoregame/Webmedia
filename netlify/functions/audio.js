const express = require('express');
const serverless = require('serverless-http');
const app = express();
const cors = require('cors');

// Simuler le stockage de fichiers audio pour Netlify
// En production, utilisez un service de stockage comme S3, Cloudinary, etc.
const mockAudioFiles = {
  'track1.mp3': {
    title: 'Été Ensoleillé',
    artist: 'DJ Soleil'
  },
  'track2.mp3': {
    title: 'Nuit Parisienne',
    artist: 'Mélodie Nocturne'
  }
};

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Route principale pour l'audio
app.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const trackInfo = mockAudioFiles[filename];
    
    if (!trackInfo) {
      return res.status(404).json({ message: "Audio file not found" });
    }
    
    // Pour un déploiement Netlify simple, nous retournons une réponse factice
    // En production, vous récupéreriez le fichier audio depuis un service de stockage
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': 1024, // Taille factice
      'Accept-Ranges': 'bytes'
    });
    
    // Génère des données audio aléatoires (ceci est juste pour la démo)
    // Cela ne produira pas de son réel
    const mockAudioData = Buffer.alloc(1024);
    for (let i = 0; i < mockAudioData.length; i++) {
      mockAudioData[i] = Math.floor(Math.random() * 256);
    }
    
    res.send(mockAudioData);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Support de la lecture en streaming avec les requêtes Range
app.get('/:filename/stream', async (req, res) => {
  try {
    const filename = req.params.filename;
    const trackInfo = mockAudioFiles[filename];
    
    if (!trackInfo) {
      return res.status(404).json({ message: "Audio file not found" });
    }
    
    // Taille simulée pour le streaming (5MB)
    const mockFileSize = 5 * 1024 * 1024;
    
    // Traitement des requêtes de plage
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : mockFileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${mockFileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });
      
      // Générer des données aléatoires pour la plage demandée
      const mockChunkData = Buffer.alloc(chunksize);
      for (let i = 0; i < mockChunkData.length; i++) {
        mockChunkData[i] = Math.floor(Math.random() * 256);
      }
      
      res.end(mockChunkData);
    } else {
      // Réponse pour l'ensemble du fichier
      res.writeHead(200, {
        'Content-Length': mockFileSize,
        'Content-Type': 'audio/mpeg',
      });
      
      // Générer des données aléatoires pour tout le fichier
      // Note: Cela ne générera généralement pas de réponse valide en raison de la taille
      const mockFullData = Buffer.alloc(mockFileSize);
      for (let i = 0; i < Math.min(mockFullData.length, 1024); i++) {
        mockFullData[i] = Math.floor(Math.random() * 256);
      }
      
      res.end(mockFullData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Exportation pour Netlify Functions
module.exports.handler = serverless(app);