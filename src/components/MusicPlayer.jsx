import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const audioRef = useRef(null);
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio('/background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Исправленная функция для изменения громкости
  const updateVolumeFromClientX = (clientX) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newVolume = parseFloat(percentage.toFixed(2));
    
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Обработчик клика по слайдеру
  const handleSliderClick = (e) => {
    updateVolumeFromClientX(e.clientX);
  };

  // Обработчик начала перетаскивания
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    updateVolumeFromClientX(e.clientX);
    
    // Обработчики для document
    const handleMouseMove = (moveEvent) => {
      if (isDraggingRef.current) {
        updateVolumeFromClientX(moveEvent.clientX);
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <button
        id="music-toggle"
        onClick={toggleMusic}
        onMouseEnter={() => setIsVolumeVisible(true)}
        onMouseLeave={() => setIsVolumeVisible(false)}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>

      <div 
        className={`volume-control ${isVolumeVisible ? 'visible' : ''}`}
        onMouseEnter={() => setIsVolumeVisible(true)}
        onMouseLeave={() => setIsVolumeVisible(false)}
      >
        <div className="volume-label">Volume</div>
        <div className="volume-indicators">
          <div className="volume-indicator minus">−</div>
          <div className="volume-indicator plus">+</div>
        </div>
        <div 
          ref={sliderRef}
          className="volume-slider-container"
          onMouseDown={handleMouseDown}
          onClick={handleSliderClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="volume-slider-track"></div>
          <div 
            className="volume-slider-fill" 
            style={{ width: `${volume * 100}%` }}
          ></div>
          <div 
            className="volume-slider-handle" 
            style={{ left: `${volume * 100}%` }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;