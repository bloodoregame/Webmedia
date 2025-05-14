import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertTrackSchema, uploadFileSchema, insertPlaylistSchema, insertPlaylistTrackSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max size
  },
  fileFilter: (req, file, cb) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/flac"];
    if (!validTypes.includes(file.mimetype)) {
      return cb(new Error("Only MP3, WAV, and FLAC files are allowed"));
    }
    cb(null, true);
  },
});

// Get audio file duration in seconds (placeholder, would need a proper library in production)
function getAudioDuration(): number {
  // In a real app we would use an audio processing library
  // This is just a placeholder that returns a random duration between 2-7 minutes
  return Math.floor(Math.random() * 300) + 120;
}

// Helper for error handling
const handleError = (res: Response, error: any) => {
  console.error(error);
  
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: fromZodError(error).message 
    });
  }
  
  return res.status(500).json({ 
    message: error.message || 'Internal server error' 
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API prefix and common headers
  const API_PREFIX = "/api";
  
  // Add JSON content type header to all API responses
  app.use(API_PREFIX, (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });
  
  // Serve audio files
  app.get(`${API_PREFIX}/audio/:filename`, async (req, res) => {
    try {
      const filename = req.params.filename;
      const track = await storage.getTrackByFilename(filename);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      const filePath = storage.getFilePath(filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        // Handle range requests for audio streaming
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });
        
        file.pipe(res);
      } else {
        // Send full file if no range specified
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        });
        
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get all tracks
  app.get(`${API_PREFIX}/tracks`, async (req, res) => {
    try {
      const searchQuery = req.query.search as string;
      
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
  
  // Get a single track
  app.get(`${API_PREFIX}/tracks/:id`, async (req, res) => {
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
  
  // Upload a new track
  app.post(
    `${API_PREFIX}/tracks`, 
    upload.single('file'), 
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        
        // Validate file (adaptation pour multer)
        const file = {
          type: req.file.mimetype,
          size: req.file.size
        };
        uploadFileSchema.parse({ file });
        
        // Generate unique filename
        const fileExt = path.extname(req.file.originalname);
        const uniqueFilename = `${crypto.randomUUID()}${fileExt}`;
        
        // Save the file
        await storage.saveFile(req.file.buffer, uniqueFilename);
        
        // Process track data
        const trackData = {
          title: req.body.title || 'Untitled',
          artist: req.body.artist || 'Unknown Artist',
          album: req.body.album || null,
          duration: getAudioDuration(),
          filename: uniqueFilename,
          coverImage: req.body.coverImage || null
        };
        
        // Validate track data
        const validatedData = insertTrackSchema.parse(trackData);
        
        // Create track
        const track = await storage.createTrack(validatedData);
        
        res.status(201).json(track);
      } catch (error) {
        // If error occurs after file is saved, attempt to delete it
        if (req.file && error instanceof Error) {
          try {
            const fileExt = path.extname(req.file.originalname);
            const uniqueFilename = `${crypto.randomUUID()}${fileExt}`;
            const filePath = storage.getFilePath(uniqueFilename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error("Failed to cleanup file after error:", err);
          }
        }
        
        handleError(res, error);
      }
    }
  );
  
  // Delete a track
  app.delete(`${API_PREFIX}/tracks/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const track = await storage.getTrack(id);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      // Delete file from disk
      const filePath = storage.getFilePath(track.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete track from storage
      const success = await storage.deleteTrack(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete track" });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get all playlists
  app.get(`${API_PREFIX}/playlists`, async (req, res) => {
    try {
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get a single playlist with its tracks
  app.get(`${API_PREFIX}/playlists/:id`, async (req, res) => {
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
  
  // Create a new playlist
  app.post(`${API_PREFIX}/playlists`, async (req, res) => {
    try {
      const validatedData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(validatedData);
      res.status(201).json(playlist);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Delete a playlist
  app.delete(`${API_PREFIX}/playlists/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const playlist = await storage.getPlaylist(id);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      const success = await storage.deletePlaylist(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete playlist" });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Add a track to a playlist
  app.post(`${API_PREFIX}/playlists/:id/tracks`, async (req, res) => {
    try {
      const playlistId = parseInt(req.params.id);
      const trackId = parseInt(req.body.trackId);
      
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      const track = await storage.getTrack(trackId);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      const validatedData = insertPlaylistTrackSchema.parse({
        playlistId, 
        trackId
      });
      
      const playlistTrack = await storage.addTrackToPlaylist(validatedData);
      res.status(201).json(playlistTrack);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Remove a track from a playlist
  app.delete(`${API_PREFIX}/playlists/:playlistId/tracks/:trackId`, async (req, res) => {
    try {
      const playlistId = parseInt(req.params.playlistId);
      const trackId = parseInt(req.params.trackId);
      
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      const track = await storage.getTrack(trackId);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      const success = await storage.removeTrackFromPlaylist(playlistId, trackId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to remove track from playlist" });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  return httpServer;
}
