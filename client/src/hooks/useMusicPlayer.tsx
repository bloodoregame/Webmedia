import { useState, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';

export const useMusicPlayer = () => {
  const { 
    progress, 
    duration, 
    isPlaying,
    setProgress 
  } = useMusic();
  
  const [formattedProgress, setFormattedProgress] = useState('0:00');
  const [formattedDuration, setFormattedDuration] = useState('0:00');
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Format time in seconds to mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Update formatted times when progress or duration changes
  useEffect(() => {
    setFormattedProgress(formatTime(progress));
    setFormattedDuration(formatTime(duration));
    
    // Calculate percentage for progress bar
    if (duration > 0) {
      setProgressPercentage((progress / duration) * 100);
    } else {
      setProgressPercentage(0);
    }
  }, [progress, duration, isPlaying]);

  // Handle progress bar change
  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(event.target.value);
    const newTime = (newProgress / 100) * duration;
    setProgress(newTime);
  };

  return {
    formattedProgress,
    formattedDuration,
    progressPercentage,
    handleProgressChange
  };
};
