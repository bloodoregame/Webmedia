import { 
  tracks, type Track, type InsertTrack,
  playlists, type Playlist, type InsertPlaylist,
  playlistTracks, type PlaylistTrack, type InsertPlaylistTrack
} from "@shared/schema";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";

// Ensure uploads directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Storage interface
export interface IStorage {
  // Track operations
  getTracks(): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  getTrackByFilename(filename: string): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  deleteTrack(id: number): Promise<boolean>;
  searchTracks(query: string): Promise<Track[]>;
  
  // Playlist operations
  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  deletePlaylist(id: number): Promise<boolean>;
  
  // Playlist track operations
  getPlaylistTracks(playlistId: number): Promise<Track[]>;
  addTrackToPlaylist(playlistTrack: InsertPlaylistTrack): Promise<PlaylistTrack>;
  removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<boolean>;
  
  // File operations
  saveFile(buffer: Buffer, filename: string): Promise<string>;
  getFilePath(filename: string): string;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private tracks: Map<number, Track>;
  private playlists: Map<number, Playlist>;
  private playlistTracks: Map<number, PlaylistTrack>;
  private trackIdCounter: number;
  private playlistIdCounter: number;
  private playlistTrackIdCounter: number;

  constructor() {
    this.tracks = new Map();
    this.playlists = new Map();
    this.playlistTracks = new Map();
    this.trackIdCounter = 1;
    this.playlistIdCounter = 1;
    this.playlistTrackIdCounter = 1;
    
    // Create default playlists
    this.createPlaylist({ name: "Favoris" });
    this.createPlaylist({ name: "Musiques téléchargées" });
  }

  // Track operations
  async getTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values()).sort((a, b) => {
      // Sort by most recently uploaded
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }

  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async getTrackByFilename(filename: string): Promise<Track | undefined> {
    return Array.from(this.tracks.values()).find(track => track.filename === filename);
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.trackIdCounter++;
    const track: Track = {
      ...insertTrack,
      id,
      uploadedAt: new Date()
    };
    this.tracks.set(id, track);
    
    // Also add to "Musiques téléchargées" playlist
    const downloadPlaylist = Array.from(this.playlists.values()).find(p => p.name === "Musiques téléchargées");
    if (downloadPlaylist) {
      this.addTrackToPlaylist({
        playlistId: downloadPlaylist.id,
        trackId: id
      });
    }
    
    return track;
  }

  async deleteTrack(id: number): Promise<boolean> {
    // Remove from playlists first
    const playlistTracksToRemove = Array.from(this.playlistTracks.values())
      .filter(pt => pt.trackId === id);
    
    for (const pt of playlistTracksToRemove) {
      this.playlistTracks.delete(pt.id);
    }
    
    // Then remove the track
    return this.tracks.delete(id);
  }

  async searchTracks(query: string): Promise<Track[]> {
    if (!query) return this.getTracks();
    
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tracks.values()).filter(track => {
      return track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery) ||
        (track.album && track.album.toLowerCase().includes(lowercaseQuery));
    });
  }

  // Playlist operations
  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistIdCounter++;
    const playlist: Playlist = {
      ...insertPlaylist,
      id,
      createdAt: new Date()
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async deletePlaylist(id: number): Promise<boolean> {
    // Remove all tracks from playlist first
    const playlistTracksToRemove = Array.from(this.playlistTracks.values())
      .filter(pt => pt.playlistId === id);
    
    for (const pt of playlistTracksToRemove) {
      this.playlistTracks.delete(pt.id);
    }
    
    // Then remove the playlist
    return this.playlists.delete(id);
  }

  // Playlist track operations
  async getPlaylistTracks(playlistId: number): Promise<Track[]> {
    const playlistTrackIds = Array.from(this.playlistTracks.values())
      .filter(pt => pt.playlistId === playlistId)
      .map(pt => pt.trackId);
    
    return Array.from(this.tracks.values())
      .filter(track => playlistTrackIds.includes(track.id));
  }

  async addTrackToPlaylist(insertPlaylistTrack: InsertPlaylistTrack): Promise<PlaylistTrack> {
    const id = this.playlistTrackIdCounter++;
    const playlistTrack: PlaylistTrack = {
      ...insertPlaylistTrack,
      id,
      addedAt: new Date()
    };
    this.playlistTracks.set(id, playlistTrack);
    return playlistTrack;
  }

  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<boolean> {
    const playlistTrack = Array.from(this.playlistTracks.values())
      .find(pt => pt.playlistId === playlistId && pt.trackId === trackId);
    
    if (playlistTrack) {
      return this.playlistTracks.delete(playlistTrack.id);
    }
    
    return false;
  }

  // File operations
  async saveFile(buffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, buffer);
    return filename;
  }

  getFilePath(filename: string): string {
    return path.join(UPLOADS_DIR, filename);
  }
}

export const storage = new MemStorage();
