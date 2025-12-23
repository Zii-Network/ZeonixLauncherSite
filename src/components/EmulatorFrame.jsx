import React, { useState, useEffect, useRef } from 'react';
import './EmulatorFrame.css';

const EmulatorFrame = ({ game, consoleInfo, onClose }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameUrl, setGameUrl] = useState(null);

  //Blob URL для файла игры
  useEffect(() => {
    if (game?.fileObject) {
      try {
        const url = URL.createObjectURL(game.fileObject);
        setGameUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error creating blob URL:', err);
        setError('Failed to load game file');
      }
    }

    return () => {
      if (gameUrl) URL.revokeObjectURL(gameUrl);
    };
  }, [game]);

  const getEmulatorCore = () => {
    if (!game?.fileName) return 'nes';
    const ext = game.fileName.toLowerCase().split('.').pop();
    const coreMap = {
      'gba': 'gba', 'gb': 'gb', 'gbc': 'gbc', 'nds': 'nds',
      'sfc': 'snes', 'smc': 'snes', 'z64': 'n64', 'n64': 'n64', 'v64': 'n64',
      'nes': 'nes', 'fds': 'nes', 'md': 'segaMD', 'gen': 'segaMD', 'smd': 'segaMD',
      'iso': 'psp', 'cso': 'psp', 'pbp': 'psp', 'bin': 'psx', 'cue': 'psx', 'img': 'psx',
      'ngp': 'ngp', 'ngc': 'ngp', 'pce': 'pce', 'ws': 'ws', 'wsc': 'ws',
      'col': 'coleco', 'gg': 'segaGG', 'sms': 'segaMS'
    };
    return coreMap[ext] || 'nes';
  };

  // ффффункция инициализации эмулятора внутри iframe
  const initEmulator = () => {
    if (!iframeRef.current || !gameUrl) return;

    const core = getEmulatorCore();
    
    iframeRef.current.contentWindow.postMessage({
        type: 'INIT_EMULATOR',
        core: core,
        gameUrl: gameUrl,
        gameName: game.name,
        platform: consoleInfo?.name || ''
    }, '*');
  };

  // (Loaded, Started)
  useEffect(() => {
    const handleMessage = (event) => {

      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;

      if (event.data.type === 'EMULATOR_LOADED') {
        setIsLoading(false);
      }
      if (event.data.type === 'GAME_STARTED') {
        console.log('Game started!');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // (Fullscreen, Save, etc)
  const sendCommand = (action) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'COMMAND', action }, '*');
  };

  if (error) return <div className="emulator-error">{error}</div>;

  return (
    <div className="emulator-frame-container">
      <div className="emulator-header">
        <div className="emulator-title">
          <span>{game?.name}</span>
        </div>
        
        <div className="emulator-controls">
          <button className="control-btn" onClick={() => sendCommand('fullscreen')}>
            <i className="fas fa-expand"></i>
          </button>
          <button className="control-btn" onClick={() => sendCommand('save')}>
            <i className="fas fa-save"></i>
          </button>
          <button className="control-btn" onClick={() => sendCommand('load')}>
            <i className="fas fa-upload"></i>
          </button>
          <button className="control-btn" onClick={() => sendCommand('restart')}>
            <i className="fas fa-redo"></i>
          </button>
          <button className="close-emulator-btn" onClick={onClose}>
            <i className="fas fa-times"></i> Exit
          </button>
        </div>
      </div>
      
      <div className="emulator-content">
        {isLoading && (
          <div className="emulator-loading">
            <div className="loading-spinner"></div>
            <p>Loading core...</p>
          </div>
        )}
        
        {/* ну если шо: src указывает на статический файл в public */}
        <iframe
          ref={iframeRef}
          src="/emulator.html"
          title="emulator"
          className="emulator-iframe"
          allow="gamepad; fullscreen; accelerometer; gyroscope; autoplay"
          allowFullScreen
          onLoad={initEmulator} 
        />
      </div>
    </div>
  );
};

export default EmulatorFrame;