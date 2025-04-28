import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Track } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MusicContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  progress: number;
  duration: number;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const MusicContext = createContext<MusicContextProps | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create audio element when component mounts
    const audio = new Audio();
    setAudioElement(audio);

    // Set up event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('loadedmetadata', handleMetadataLoaded);
    audio.addEventListener('error', handleAudioError);

    // Cleanup event listeners when component unmounts
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleTrackEnded);
      audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, []);

  // Update volume when volume state changes
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume, audioElement]);

  const handleTimeUpdate = () => {
    if (audioElement) {
      setProgress(audioElement.currentTime);
    }
  };

  const handleMetadataLoaded = () => {
    if (audioElement) {
      setDuration(audioElement.duration);
    }
  };

  const handleTrackEnded = () => {
    nextTrack();
  };

  const handleAudioError = (e: Event) => {
    console.error('Audio playback error:', e);
    toast({
      title: "Erreur de lecture",
      description: "Impossible de lire ce morceau",
      variant: "destructive"
    });
    nextTrack();
  };

  const playTrack = async (track: Track) => {
    if (!audioElement) return;
    
    try {
      // If we're already playing this track, just resume
      if (currentTrack && currentTrack.id === track.id) {
        resumeTrack();
        return;
      }

      // Pause current playback
      audioElement.pause();
      
      // Set the new track
      setCurrentTrack(track);
      
      // Set new audio source
      audioElement.src = `/api/audio/${track.filename}`;
      
      // Reset progress
      setProgress(0);
      
      // Load and play
      await audioElement.load();
      await audioElement.play();
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play track:', error);
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire ce morceau",
        variant: "destructive"
      });
    }
  };

  const pauseTrack = () => {
    if (!audioElement) return;
    audioElement.pause();
    setIsPlaying(false);
  };

  const resumeTrack = async () => {
    if (!audioElement || !currentTrack) return;
    
    try {
      await audioElement.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to resume track:', error);
      toast({
        title: "Erreur de lecture",
        description: "Impossible de reprendre la lecture",
        variant: "destructive"
      });
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) {
      pauseTrack();
      return;
    }

    // Get next track and remove it from queue
    const nextTrack = queue[0];
    setQueue(prevQueue => prevQueue.slice(1));
    
    // Play next track
    playTrack(nextTrack);
  };

  const previousTrack = () => {
    if (!audioElement) return;
    
    // If we're less than 3 seconds in, restart the current track
    if (audioElement.currentTime < 3) {
      audioElement.currentTime = 0;
    } else {
      // Otherwise just restart the current track
      audioElement.currentTime = 0;
    }
  };

  const setProgressManually = (newProgress: number) => {
    if (!audioElement) return;
    audioElement.currentTime = newProgress;
    setProgress(newProgress);
  };

  const addToQueue = (track: Track) => {
    setQueue(prevQueue => [...prevQueue, track]);
    
    toast({
      title: "Ajouté à la file d'attente",
      description: `${track.title} ajouté à la file d'attente`,
    });
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const contextValue: MusicContextProps = {
    currentTrack,
    isPlaying,
    queue,
    volume,
    progress,
    duration,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    setVolume,
    setProgress: setProgressManually,
    addToQueue,
    clearQueue,
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
