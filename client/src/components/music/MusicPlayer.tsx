import { useState, useEffect } from "react";
import { useMusic } from "@/context/MusicContext";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { getArtworkPlaceholder } from "@/lib/types";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  Heart,
  List,
  Laptop
} from "lucide-react";
import MobileNavigation from "../layout/MobileNavigation";

export default function MusicPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack, 
    resumeTrack,
    nextTrack,
    previousTrack,
    volume,
    setVolume
  } = useMusic();
  
  const { 
    formattedProgress, 
    formattedDuration, 
    progressPercentage, 
    handleProgressChange 
  } = useMusicPlayer();
  
  const [isLiked, setIsLiked] = useState(false);
  
  const togglePlayPause = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
  };
  
  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-dark-surface-3 border-t border-dark-surface z-10 h-16">
        <MobileNavigation />
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-surface-3 border-t border-dark-surface z-10">
      <div className="md:px-4 py-3 flex items-center justify-between">
        {/* Now Playing Info */}
        <div className="flex items-center min-w-0 px-2 md:px-0 w-1/4">
          <img 
            src={currentTrack.coverImage || getArtworkPlaceholder(currentTrack)} 
            alt={`${currentTrack.title} by ${currentTrack.artist}`}
            className="w-14 h-14 rounded mr-3 hidden md:block" 
          />
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
            <p className="text-text-secondary text-xs truncate">{currentTrack.artist}</p>
          </div>
          <button 
            className={`ml-4 ${isLiked ? 'text-spotify-green' : 'text-text-secondary hover:text-white'} hidden md:block`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-1">
            <button className="text-text-secondary hover:text-white hidden md:block">
              <Shuffle className="h-5 w-5" />
            </button>
            <button 
              className="text-text-secondary hover:text-white"
              onClick={previousTrack}
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button 
              className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>
            <button 
              className="text-text-secondary hover:text-white"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button className="text-text-secondary hover:text-white hidden md:block">
              <Repeat className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center w-full px-4 md:px-8">
            <span className="text-text-secondary text-xs mr-2 hidden md:block">{formattedProgress}</span>
            <div className="relative flex-1">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progressPercentage}
                onChange={handleProgressChange}
                className="audio-progress w-full appearance-none h-1 bg-dark-surface-2 rounded-full outline-none cursor-pointer"
              />
              <div 
                className="absolute top-0 left-0 h-1 bg-white rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-text-secondary text-xs ml-2 hidden md:block">{formattedDuration}</span>
          </div>
        </div>
        
        {/* Additional Controls */}
        <div className="flex items-center justify-end w-1/4 space-x-3 px-2 md:px-0">
          <button className="text-text-secondary hover:text-white hidden md:block">
            <List className="h-5 w-5" />
          </button>
          <button className="text-text-secondary hover:text-white hidden md:block">
            <Laptop className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center">
            <button className="text-text-secondary hover:text-white mr-1">
              <Volume2 className="h-5 w-5" />
            </button>
            <div className="relative w-20">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume * 100}
                onChange={handleVolumeChange}
                className="volume-slider w-full appearance-none h-1 bg-dark-surface-2 rounded-full outline-none cursor-pointer"
              />
              <div 
                className="absolute top-0 left-0 h-1 bg-text-secondary rounded-full" 
                style={{ width: `${volume * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
