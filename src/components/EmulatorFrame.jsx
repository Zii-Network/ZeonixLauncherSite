// EmulatorFrame.jsx
import React, { useState, useEffect, useRef } from 'react';
import './EmulatorFrame.css';

const EmulatorFrame = ({ game, consoleInfo, onClose }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameUrl, setGameUrl] = useState(null);

  // Создаем blob URL один раз при монтировании
  useEffect(() => {
    if (game?.fileObject) {
      try {
        const url = URL.createObjectURL(game.fileObject);
        setGameUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error creating blob URL:', err);
        setError('Не удалось загрузить файл игры');
      }
    }

    // Очистка при размонтировании
    return () => {
      if (gameUrl) {
        URL.revokeObjectURL(gameUrl);
      }
    };
  }, [game]);

  const getEmulatorCore = () => {
    if (!game?.fileName) return 'nes';
    
    const ext = game.fileName.toLowerCase().split('.').pop();
    const coreMap = {
      // Nintendo
      'gba': 'gba', 'gb': 'gb', 'gbc': 'gbc',
      'nds': 'nds',
      'sfc': 'snes', 'smc': 'snes',
      'z64': 'n64', 'n64': 'n64', 'v64': 'n64',
      'nes': 'nes', 'fds': 'nes',
      
      // Sega
      'md': 'segaMD', 'gen': 'segaMD', 'smd': 'segaMD',
      
      // Sony
      'iso': 'psp', 'cso': 'psp', 'pbp': 'psp',
      'bin': 'psx', 'cue': 'psx', 'img': 'psx',
      
      // Другие
      'ngp': 'ngp', 'ngc': 'ngp',
      'pce': 'pce',
      'ws': 'ws', 'wsc': 'ws',
      'col': 'coleco',
      'gg': 'segaGG',
      'sms': 'segaMS'
    };
    
    return coreMap[ext] || 'nes';
  };

  // Проверка поддержки формата
  const isFormatSupported = () => {
    if (!game?.fileName) return false;
    
    const ext = game.fileName.toLowerCase().split('.').pop();
    const supported = [
      'gba', 'gb', 'gbc', 'nds', 'nes', 'sfc', 'smc', 
      'z64', 'n64', 'v64', 'md', 'gen', 'smd', 'iso', 
      'cso', 'pbp', 'bin', 'cue', 'img', 'ngp', 'ngc',
      'pce', 'ws', 'wsc', 'col', 'gg', 'sms'
    ];
    
    return supported.includes(ext);
  };

  const generateEmulatorHTML = () => {
    const core = getEmulatorCore();
    
    return `
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="dark">
          <title>${game.name} - ${consoleInfo?.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body, html {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: #000;
              font-family: Arial, sans-serif;
            }
            
            #emulatorjs-container {
              width: 100%;
              height: 100%;
              position: relative;
            }
            
            #emulatorjs-container canvas {
              max-width: 100%;
              max-height: 100%;
            }
            
            .ejs-loader {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div id="emulatorjs-container"></div>
          
          <script>
            // Глобальные переменные EmulatorJS
            window.EJS_player = "#emulatorjs-container";
            window.EJS_core = "${core}";
            window.EJS_gameUrl = "${gameUrl}";
            window.EJS_pathtodata = "https://cdn.emulatorjs.org/latest/data/";
            
            // Настройки
            window.EJS_gameName = "${game.name}";
            window.EJS_platform = "${consoleInfo?.name || ''}";
            window.EJS_volume = 0.7;
            window.EJS_defaultControls = true;
            window.EJS_buttonOpts = 'controller,none';
            window.EJS_buttons = {
              "saveState": false,
              "loadState": false,
              "fullscreen": true,
              "restart": true
            };
            
            // Отправляем сообщение родителю при загрузке
            window.EJS_onStart = function() {
              window.parent.postMessage({ type: 'EMULATOR_LOADED' }, '*');
            };
            
            window.EJS_onGameStart = function() {
              window.parent.postMessage({ type: 'GAME_STARTED' }, '*');
            };
            
            window.EJS_onGamePause = function() {
              window.parent.postMessage({ type: 'GAME_PAUSED' }, '*');
            };
          </script>
          
          <script src="https://cdn.emulatorjs.org/latest/data/loader.js"></script>
        </body>
      </html>
    `;
  };

  // Обработчик сообщений от iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'EMULATOR_LOADED') {
        setIsLoading(false);
      }
      if (event.data.type === 'GAME_STARTED') {
        console.log('Игра запущена');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (error) {
    return (
      <div className="emulator-error-overlay">
        <div className="emulator-error">
          <h3><i className="fas fa-exclamation-triangle"></i> Ошибка</h3>
          <p>{error}</p>
          <button onClick={onClose} className="error-btn">
            <i className="fas fa-arrow-left"></i> Вернуться
          </button>
        </div>
      </div>
    );
  }

  if (!isFormatSupported()) {
    return (
      <div className="emulator-error-overlay">
        <div className="emulator-error">
          <h3><i className="fas fa-ban"></i> Формат не поддерживается</h3>
          <p>Формат файла <strong>.{game?.fileName?.split('.').pop()}</strong> не поддерживается в браузере.</p>
          <div className="error-solutions">
            <p>Попробуйте:</p>
            <ul>
              <li>Сконвертировать в другой формат</li>
              <li>Использовать настольный эмулятор</li>
              <li>Выбрать другую игру</li>
            </ul>
          </div>
          <button onClick={onClose} className="error-btn">
            <i className="fas fa-arrow-left"></i> Вернуться
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="emulator-frame-container">
      <div className="emulator-header">
        <div className="emulator-title">
          <i className="fas fa-gamepad" style={{ color: consoleInfo?.color }}></i>
          <div className="title-text">
            <span className="game-name">{game?.name}</span>
            <span className="console-name">{consoleInfo?.name}</span>
          </div>
        </div>
        
        <div className="emulator-controls">
          <button 
            className="control-btn" 
            onClick={() => iframeRef.current?.contentWindow?.EJS_toggleFullscreen?.()}
            title="Полный экран (F11)"
          >
            <i className="fas fa-expand"></i>
          </button>
          <button 
            className="control-btn" 
            onClick={() => iframeRef.current?.contentWindow?.EJS_saveState?.()}
            title="Сохранить (F5)"
          >
            <i className="fas fa-save"></i>
          </button>
          <button 
            className="control-btn" 
            onClick={() => iframeRef.current?.contentWindow?.EJS_loadState?.()}
            title="Загрузить (F7)"
          >
            <i className="fas fa-upload"></i>
          </button>
          <button 
            className="control-btn restart-btn"
            onClick={() => iframeRef.current?.contentWindow?.EJS_resetGame?.()}
            title="Перезапуск (F1)"
          >
            <i className="fas fa-redo"></i>
          </button>
          <button className="close-emulator-btn" onClick={onClose}>
            <i className="fas fa-times"></i> Выйти
          </button>
        </div>
      </div>
      
      <div className="emulator-content">
        {isLoading && (
          <div className="emulator-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка эмулятора...</p>
            <p className="loading-sub">Пожалуйста, подождите</p>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          srcDoc={gameUrl ? generateEmulatorHTML() : ''}
          title={`${game?.name} - ${consoleInfo?.name}`}
          className="emulator-iframe"
          allow="gamepad; fullscreen; accelerometer; gyroscope"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          onLoad={() => setIsLoading(false)}
        />
      </div>
      
      <div className="emulator-footer">
        <div className="footer-info">
          <div className="info-item">
            <i className="fas fa-keyboard"></i>
            <span>Управление: WASD/Стрелки + ZXCV</span>
          </div>
          <div className="info-item">
            <i className="fas fa-gamepad"></i>
            <span>Геймпад: подключите и нажмите START</span>
          </div>
          <div className="info-item">
            <i className="fas fa-save"></i>
            <span>Сохранения: автоматически в браузере</span>
          </div>
        </div>
        
        <div className="footer-tips">
          <span className="tip">
            <i className="fas fa-lightbulb"></i>
            Советы: F11 - полный экран, ESC - меню
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmulatorFrame;