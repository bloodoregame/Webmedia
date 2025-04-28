import { Track } from "@shared/schema";
import { useMusic } from "@/context/MusicContext";
import { formatDuration, formatRelativeTime, getArtworkPlaceholder } from "@/lib/types";
import { List, Grid } from "lucide-react";
import { useState } from "react";

interface TrackListProps {
  tracks: Track[];
  title?: string;
}

export default function TrackList({ tracks, title }: TrackListProps) {
  const { currentTrack, playTrack } = useMusic();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  if (tracks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Aucun titre trouvé</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div>
        {title && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded-full bg-dark-surface-2 hover:bg-dark-surface-3 transition-colors"
                onClick={() => setViewMode('list')}
              >
                <List className="text-text-secondary h-5 w-5" />
              </button>
              <button 
                className="p-2 rounded-full bg-dark-surface-2 hover:bg-dark-surface-3 transition-colors"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="text-white h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {tracks.map((track) => (
            <div 
              key={track.id}
              className="music-card bg-dark-surface p-4 rounded-lg hover:bg-dark-surface-2 transition-colors cursor-pointer"
              onClick={() => playTrack(track)}
            >
              <div className="relative">
                <img 
                  src={track.coverImage || getArtworkPlaceholder(track)} 
                  alt={`${track.title} by ${track.artist}`} 
                  className="w-full aspect-square object-cover rounded-md mb-3" 
                />
                <button 
                  className="play-button absolute right-2 bottom-2 w-12 h-12 rounded-full flex items-center justify-center bg-spotify-green text-black shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track);
                  }}
                >
                  <svg className="h-6 w-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <h3 className="font-medium text-sm line-clamp-1">{track.title}</h3>
              <p className="text-text-secondary text-xs mt-1">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-full bg-dark-surface-2 hover:bg-dark-surface-3 transition-colors"
              onClick={() => setViewMode('list')}
            >
              <List className="text-white h-5 w-5" />
            </button>
            <button 
              className="p-2 rounded-full bg-dark-surface-2 hover:bg-dark-surface-3 transition-colors"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="text-text-secondary h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      <div className="rounded-lg overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-dark-surface-2 text-text-secondary text-left text-xs">
              <th className="py-3 pl-4 pr-2 w-10">#</th>
              <th className="py-3 px-2">TITRE</th>
              <th className="py-3 px-2 hidden md:table-cell">ALBUM</th>
              <th className="py-3 px-2 hidden md:table-cell">DATE D'AJOUT</th>
              <th className="py-3 px-2 text-center w-20">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 inline" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr 
                key={track.id}
                className={`hover:bg-dark-surface-2 group transition-colors cursor-pointer ${
                  currentTrack?.id === track.id ? 'bg-dark-surface-2' : ''
                }`}
                onClick={() => playTrack(track)}
              >
                <td className="py-3 pl-4 pr-2 text-text-secondary">{index + 1}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    <img 
                      src={track.coverImage || getArtworkPlaceholder(track)} 
                      alt={`${track.title} by ${track.artist}`} 
                      className="w-10 h-10 mr-3 rounded" 
                    />
                    <div>
                      <div className="font-medium text-sm">{track.title}</div>
                      <div className="text-text-secondary text-xs">{track.artist}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-text-secondary text-sm hidden md:table-cell">
                  {track.album || '-'}
                </td>
                <td className="py-3 px-2 text-text-secondary text-sm hidden md:table-cell">
                  {formatRelativeTime(new Date(track.uploadedAt))}
                </td>
                <td className="py-3 px-2 text-text-secondary text-sm text-center">
                  {formatDuration(track.duration)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
