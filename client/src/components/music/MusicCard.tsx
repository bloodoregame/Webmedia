import { useState } from "react";
import { Play, Pause, Plus } from "lucide-react";
import { Track } from "@shared/schema";
import { useMusic } from "@/context/MusicContext";
import { getArtworkPlaceholder } from "@/lib/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface MusicCardProps {
  track: Track;
}

export default function MusicCard({ track }: MusicCardProps) {
  const { currentTrack, playTrack, pauseTrack, isPlaying, addToQueue } = useMusic();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;
  
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(track);
      }
    } else {
      playTrack(track);
    }
  };
  
  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
  };
  
  // Get artwork image
  const artworkSrc = track.coverImage || getArtworkPlaceholder(track);
  
  return (
    <div 
      className="music-card bg-dark-surface p-4 rounded-lg hover:bg-dark-surface-2 transition-colors cursor-pointer"
      onClick={() => playTrack(track)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={artworkSrc} 
          alt={`${track.title} by ${track.artist}`} 
          className="w-full aspect-square object-cover rounded-md mb-3" 
        />
        <button 
          className={`play-button absolute right-2 bottom-2 w-12 h-12 rounded-full flex items-center justify-center text-black shadow-lg ${isCurrentlyPlaying ? 'opacity-100 bg-white' : 'bg-spotify-green'}`}
          onClick={handlePlayPause}
        >
          {isCurrentlyPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </button>
        
        {isHovered && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute right-2 top-2 p-2 bg-black/70 rounded-full text-white">
                <Plus className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={handleAddToQueue}>
                Ajouter à la file d'attente
              </DropdownMenuItem>
              {/* Add more actions here if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <h3 className="font-medium text-sm line-clamp-1">{track.title}</h3>
      <p className="text-text-secondary text-xs mt-1">{track.artist}</p>
    </div>
  );
}
