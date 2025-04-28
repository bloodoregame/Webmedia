import { Track } from '@shared/schema';

// Album artwork placeholder images for tracks without artwork
export const ARTWORK_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&q=80&w=300&h=300",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=300&h=300"
];

// Get a consistent placeholder based on track ID
export const getArtworkPlaceholder = (track: Track): string => {
  const index = track.id % ARTWORK_PLACEHOLDERS.length;
  return ARTWORK_PLACEHOLDERS[index];
};

// Format duration from seconds to mm:ss
export const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Format date to relative time (e.g., "2 days ago")
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (months > 0) {
    return months === 1 ? "Il y a 1 mois" : `Il y a ${months} mois`;
  } else if (weeks > 0) {
    return weeks === 1 ? "Il y a 1 semaine" : `Il y a ${weeks} semaines`;
  } else if (days > 0) {
    return days === 1 ? "Il y a 1 jour" : `Il y a ${days} jours`;
  } else if (hours > 0) {
    return hours === 1 ? "Il y a 1 heure" : `Il y a ${hours} heures`;
  } else if (minutes > 0) {
    return minutes === 1 ? "Il y a 1 minute" : `Il y a ${minutes} minutes`;
  } else {
    return "À l'instant";
  }
};
