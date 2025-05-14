import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  duration: integer("duration").notNull(), // Duration in seconds
  filename: text("filename").notNull().unique(),
  coverImage: text("cover_image"), // Path to cover image
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  uploadedAt: true,
});

export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;

// For file upload validation
export const uploadFileSchema = z.object({
  file: z.object({
    type: z.string(),
    size: z.number()
  }).refine(
    (file) => {
      const validTypes = ["audio/mpeg", "audio/wav", "audio/flac"];
      return validTypes.includes(file.type);
    },
    { message: "Only MP3, WAV, and FLAC files are supported" }
  ).refine(
    (file) => file.size <= 50 * 1024 * 1024,
    { message: "File size must be less than 50MB" }
  ),
});

export type UploadFile = z.infer<typeof uploadFileSchema>;

// Schema for playlists
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;

// Schema for tracks in playlists (many-to-many)
export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  trackId: integer("track_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertPlaylistTrackSchema = createInsertSchema(playlistTracks).omit({
  id: true,
  addedAt: true,
});

export type InsertPlaylistTrack = z.infer<typeof insertPlaylistTrackSchema>;
export type PlaylistTrack = typeof playlistTracks.$inferSelect;
