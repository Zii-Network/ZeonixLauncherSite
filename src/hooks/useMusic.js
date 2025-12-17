import { useState, useEffect, useRef } from 'react';

export const useMusic = (initialVolume = 1) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuteFocused, setIsMuteFocused] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('zinex.lol_files/background-music.mp3');
    audioRef.current.volume = volume;
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling music:', error);
    }
  };

  const changeVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };

  const setMuteFocus = (focused) => {
    setIsMuteFocused(focused);
  };

  return {
    isPlaying,
    volume,
    isMuteFocused,
    toggleMusic,
    changeVolume,
    setMuteFocus,
    musicIcon: isPlaying ? '🔊' : '🔇'
  };
};