import React, { useState, useEffect, useRef } from 'react';

const GamesCarousel = () => {
  const allConsoles = [
    {
      id: "gba",
      name: "Game Boy Advance",
      icon: "fas fa-gamepad",
      color: "#73b7ff",
      fileExtensions: ['gba', 'gb', 'gbc']
    },
    {
      id: "nes",
      name: "Nintendo NES",
      icon: "fas fa-gamepad",
      color: "#ff3366",
      fileExtensions: ['nes', 'fds']
    },
    {
      id: "snes",
      name: "Super Nintendo",
      icon: "fas fa-gamepad",
      color: "#9966ff",
      fileExtensions: ['sfc', 'smc']
    },
    {
      id: "genesis",
      name: "Sega Genesis",
      icon: "fas fa-gamepad",
      color: "#ffcc00",
      fileExtensions: ['md', 'gen', 'smd']
    },
    {
      id: "n64",
      name: "Nintendo 64",
      icon: "fas fa-gamepad",
      color: "#ff9900",
      fileExtensions: ['z64', 'n64', 'v64']
    },
    {
      id: "psp",
      name: "PlayStation Portable",
      icon: "fas fa-gamepad",
      color: "#ff6b3d",
      fileExtensions: ['iso', 'cso', 'pbp']
    }
  ];

  const [consoles, setConsoles] = useState([]);
  const [selectedConsole, setSelectedConsole] = useState(0);
  const [selectedGame, setSelectedGame] = useState(0);
  const [showFolderSelector, setShowFolderSelector] = useState(true);
  const [showEmulator, setShowEmulator] = useState(false);
  const [currentGameData, setCurrentGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFolderPath, setCurrentFolderPath] = useState('');
  
  const fileInputRef = useRef(null);
  const emulatorIframeRef = useRef(null);

  // Определение консоли по расширению
  const getConsoleByExtension = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    for (const console of allConsoles) {
      if (console.fileExtensions.includes(ext)) {
        return console.id;
      }
    }
    return null;
  };

  // Загрузка сохраненных игр
  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('userGames') || '{}');
    const savedConsoles = JSON.parse(localStorage.getItem('userConsoles') || '[]');
    const savedFolderPath = localStorage.getItem('currentFolderPath') || '';
    
    if (savedConsoles.length > 0 && Object.keys(savedGames).length > 0) {
      const restoredConsoles = savedConsoles.map(consoleId => {
        const consoleInfo = allConsoles.find(c => c.id === consoleId);
        return {
          ...consoleInfo,
          games: savedGames[consoleId] || []
        };
      });
      
      setConsoles(restoredConsoles);
      setCurrentFolderPath(savedFolderPath);
      setShowFolderSelector(false);
      
      if (restoredConsoles.length > 0) {
        setSelectedConsole(0);
        setSelectedGame(0);
      }
    }
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsLoading(true);
    setShowFolderSelector(false);

    const folderPath = files[0]?.webkitRelativePath?.split('/')[0] || 'Выбранная папка';
    setCurrentFolderPath(folderPath);

    const gamesByConsole = {};
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const consoleId = getConsoleByExtension(file.name);
      
      if (consoleId && file.size < 10 * 1024 * 1024) { // 10MB лимит
        if (!gamesByConsole[consoleId]) {
          gamesByConsole[consoleId] = [];
        }
        
        const gameName = file.name.replace(/\.[^/.]+$/, "");
        const base64Data = await fileToBase64(file);
        
        gamesByConsole[consoleId].push({
          id: `${consoleId}_${Date.now()}_${i}`,
          name: gameName,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          uploadDate: new Date().toLocaleDateString(),
          consoleId: consoleId,
          data: base64Data
        });
      }
    }

    const consolesWithGames = Object.keys(gamesByConsole).map(consoleId => {
      const consoleInfo = allConsoles.find(c => c.id === consoleId);
      return {
        ...consoleInfo,
        games: gamesByConsole[consoleId]
      };
    });

    consolesWithGames.sort((a, b) => b.games.length - a.games.length);
    setConsoles(consolesWithGames);
    
    // Сохранение в localStorage
    const gamesToSave = {};
    const consoleIds = [];
    consolesWithGames.forEach(console => {
      if (console.games.length > 0) {
        gamesToSave[console.id] = console.games;
        consoleIds.push(console.id);
      }
    });
    
    localStorage.setItem('userGames', JSON.stringify(gamesToSave));
    localStorage.setItem('userConsoles', JSON.stringify(consoleIds));
    localStorage.setItem('currentFolderPath', folderPath);
    
    if (consolesWithGames.length > 0) {
      setSelectedConsole(0);
      setSelectedGame(0);
    } else {
      setTimeout(() => {
        alert('Не найдено поддерживаемых игр в выбранной папке.\nПоддерживаемые форматы: .gba, .gb, .gbc, .nes, .snes и другие.');
        setShowFolderSelector(true);
      }, 100);
    }

    setIsLoading(false);
    event.target.value = '';
  };

  const handleGameClick = (game) => {
    setCurrentGameData({
      gameName: game.name,
      fileName: game.fileName,
      consoleName: consoles[selectedConsole]?.name,
      consoleColor: consoles[selectedConsole]?.color,
      data: game.data
    });
    setShowEmulator(true);
  };

  const closeEmulator = () => {
    setShowEmulator(false);
    setCurrentGameData(null);
    
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const downloadGame = () => {
    if (!currentGameData) return;
    
    const link = document.createElement('a');
    link.href = currentGameData.data;
    link.download = currentGameData.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetLibrary = () => {
    if (window.confirm('Удалить все загруженные игры и выбрать другую папку?')) {
      localStorage.removeItem('userGames');
      localStorage.removeItem('userConsoles');
      localStorage.removeItem('currentFolderPath');
      setConsoles([]);
      setCurrentFolderPath('');
      setShowFolderSelector(true);
      setSelectedConsole(0);
      setSelectedGame(0);
    }
  };

  const reloadCurrentFolder = () => {
    const savedGames = JSON.parse(localStorage.getItem('userGames') || '{}');
    const savedConsoles = JSON.parse(localStorage.getItem('userConsoles') || '[]');
    
    if (savedConsoles.length > 0 && Object.keys(savedGames).length > 0) {
      const restoredConsoles = savedConsoles.map(consoleId => {
        const consoleInfo = allConsoles.find(c => c.id === consoleId);
        return {
          ...consoleInfo,
          games: savedGames[consoleId] || []
        };
      });
      
      setConsoles(restoredConsoles);
      alert('Библиотека обновлена!');
    } else {
      alert('Нет сохраненной папки для перезагрузки.');
    }
  };

  // Навигация клавиатурой
  useEffect(() => {
    if (showEmulator) {
      const handleEmulatorKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeEmulator();
        }
      };
      
      window.addEventListener('keydown', handleEmulatorKeyDown);
      return () => window.removeEventListener('keydown', handleEmulatorKeyDown);
    }

    if (showFolderSelector || consoles.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        const games = consoles[selectedConsole]?.games || [];
        if (games.length > 0) {
          setSelectedGame((prev) => (prev + 1) % games.length);
        }
      } else if (e.key === 'ArrowUp') {
        const games = consoles[selectedConsole]?.games || [];
        if (games.length > 0) {
          setSelectedGame((prev) => (prev - 1 + games.length) % games.length);
        }
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (selectedConsole - 1 + consoles.length) % consoles.length;
        setSelectedConsole(prevIndex);
        setSelectedGame(0);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (selectedConsole + 1) % consoles.length;
        setSelectedConsole(nextIndex);
        setSelectedGame(0);
      } else if (e.key === 'Enter') {
        const game = consoles[selectedConsole]?.games[selectedGame];
        if (game) {
          handleGameClick(game);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedConsole, selectedGame, consoles, showFolderSelector, showEmulator]);

  // Компонент эмулятора
  const EmulatorWindow = () => {
    if (!showEmulator || !currentGameData) return null;

    return (
      <div className="emulator-overlay">
        <div className="emulator-header">
          <div className="emulator-title">
            <i className="fas fa-gamepad"></i>
            {currentGameData.gameName} - {currentGameData.consoleName}
          </div>
          <button className="close-emulator-btn" onClick={closeEmulator}>
            <i className="fas fa-times"></i> Закрыть (ESC)
          </button>
        </div>
        
        <div className="emulator-container">
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a2e',
            color: 'white',
            padding: '40px',
            textAlign: 'center'
          }}>
            <i className="fas fa-gamepad" style={{
              fontSize: '80px',
              color: currentGameData.consoleColor,
              marginBottom: '30px',
              opacity: 0.8
            }}></i>
            
            <h2 style={{
              fontSize: '32px',
              marginBottom: '20px',
              color: currentGameData.consoleColor
            }}>
              {currentGameData.gameName}
            </h2>
            
            <p style={{
              fontSize: '18px',
              marginBottom: '10px',
              opacity: 0.8
            }}>
              {currentGameData.consoleName}
            </p>
            
            <p style={{
              fontSize: '14px',
              marginBottom: '40px',
              opacity: 0.6
            }}>
              Файл: {currentGameData.fileName}
            </p>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '30px',
              borderRadius: '15px',
              maxWidth: '600px',
              marginBottom: '30px'
            }}>
              <p style={{ marginBottom: '15px', fontSize: '16px' }}>
                🎮 <strong>Игра готова к запуску!</strong>
              </p>
              <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>
                Для полноценной игры используйте EmulatorJS или RetroArch.
                <br/>Нажмите кнопку "Скачать ROM" ниже, чтобы сохранить файл игры,
                <br/>затем загрузите его в эмулятор на сайте emulatorjs.com
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={downloadGame}
                style={{
                  background: 'linear-gradient(135deg, #73b7ff, #5aa0ff)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <i className="fas fa-download"></i>
                Скачать ROM
              </button>
              
              <button
                onClick={() => window.open('https://www.emulatorjs.com/', '_blank')}
                style={{
                  background: 'linear-gradient(135deg, #9966ff, #7744cc)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <i className="fas fa-external-link-alt"></i>
                Открыть EmulatorJS
              </button>
            </div>
          </div>
        </div>
        
        <div className="emulator-info" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          padding: '15px',
          background: 'rgba(30, 30, 40, 0.9)',
          borderTop: '1px solid rgba(115, 183, 255, 0.3)',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.7)',
          flexWrap: 'wrap'
        }}>
          <div className="info-item">
            <i className="fas fa-keyboard"></i>
            <span> Управление: Стрелки + Enter</span>
          </div>
          <div className="info-item">
            <i className="fas fa-gamepad"></i>
            <span> Поддерживаются геймпады</span>
          </div>
          <div className="info-item">
            <i className="fas fa-sd-card"></i>
            <span> Состояния сохраняются в эмуляторе</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="games-carousel-wrapper">
      {/* Скрытый input для выбора папки */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        onChange={handleFolderSelect}
        style={{ display: 'none' }}
      />

      {/* Эмулятор */}
      <EmulatorWindow />

      {/* Экран выбора папки */}
      {showFolderSelector ? (
        <div className="folder-selector-screen">
          <div className="folder-selector-content">
            <div className="folder-icon">
              <i className="fas fa-folder-open"></i>
            </div>
            
            <h1 className="selector-title">Выберите папку с играми</h1>
            
            <p className="selector-description">
              Выберите папку, содержащую ваши игровые файлы. Система автоматически определит консоли и отсортирует игры по форматам.
            </p>
            
            <button 
              className="select-folder-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-folder"></i> Выбрать папку
            </button>
            
            <div className="supported-info">
              <h3>Поддерживаемые форматы:</h3>
              <div className="formats-grid">
                {allConsoles.map(console => (
                  <div key={console.id} className="format-category">
                    <h4>{console.name}</h4>
                    <div className="format-list">
                      {console.fileExtensions.map(ext => `.${ext}`).join(' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Левая панель - консоли */}
          <div className="carousel-panel consoles-panel">
            <div className="panel-header">
              <h2 className="panel-title">Консоли</h2>
              <div className="panel-subtitle">
                {consoles.length} найдено • Стрелки ← →
              </div>
            </div>
            
            <div className="carousel-container vertical">
              <div className="carousel-track">
                {consoles.map((console, index) => (
                  <div 
                    key={console.id}
                    className={`carousel-slide ${selectedConsole === index ? 'active' : ''} 
                              ${selectedConsole === index - 1 ? 'prev' : ''}
                              ${selectedConsole === index + 1 ? 'next' : ''}`}
                    onClick={() => {
                      setSelectedConsole(index);
                      setSelectedGame(0);
                    }}
                  >
                    <div className="slide-content">
                      <div className="square-icon" style={{ color: console.color }}>
                        <i className={console.icon}></i>
                      </div>
                      
                      <div className="slide-info">
                        <div className="slide-title">{console.name}</div>
                        <div className="slide-count">
                          <i className="fas fa-gamepad"></i> {console.games.length} игр
                        </div>
                        <div className="console-stats">
                          <span className="stat-item">
                            <i className="fas fa-file"></i> {console.fileExtensions.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="carousel-indicator">
              {consoles.map((_, index) => (
                <div
                  key={index}
                  className={`indicator-dot ${selectedConsole === index ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedConsole(index);
                    setSelectedGame(0);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Управление папкой */}
          <div className="folder-controls-left">
            <div className="folder-buttons-left">
              <button 
                className="folder-btn reload-btn"
                onClick={reloadCurrentFolder}
                title="Обновить библиотеку"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
              
              <button 
                className="folder-btn change-btn"
                onClick={handleResetLibrary}
                title="Выбрать другую папку"
              >
                <i className="fas fa-exchange-alt"></i>
              </button>
              
              <button 
                className="folder-btn server-btn"
                onClick={() => window.open('https://www.emulatorjs.com/', '_blank')}
                title="Открыть EmulatorJS"
                style={{
                  background: 'linear-gradient(135deg, rgba(153, 102, 255, 0.2), rgba(153, 102, 255, 0.3))',
                  color: '#9966ff',
                  border: '1px solid rgba(153, 102, 255, 0.3)'
                }}
              >
                <i className="fas fa-external-link-alt"></i>
              </button>
            </div>
          </div>

          {/* Правая панель - игры */}
          <div className="carousel-panel games-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="console-name" style={{ color: consoles[selectedConsole]?.color }}>
                  {consoles[selectedConsole]?.name}
                </span>
                <span className="games-count">
                  ({consoles[selectedConsole]?.games.length || 0} игр)
                </span>
              </h2>
              <div className="panel-subtitle">
                Стрелки ↑ ↓ для выбора • Enter для запуска
              </div>
            </div>
          
            <div className="carousel-container vertical">
              <div className="carousel-track">
                {consoles[selectedConsole]?.games.length > 0 ? (
                  consoles[selectedConsole].games.map((game, index) => (
                    <div 
                      key={game.id}
                      className={`carousel-slide ${selectedGame === index ? 'active' : ''}
                                 ${selectedGame === index - 1 ? 'prev' : ''}
                                 ${selectedGame === index + 1 ? 'next' : ''}`}
                      onClick={() => {
                        setSelectedGame(index);
                        handleGameClick(game);
                      }}
                    >
                      <div className="slide-content">
                        <div className="square-icon" style={{ color: consoles[selectedConsole]?.color }}>
                          <i className={consoles[selectedConsole]?.icon}></i>
                        </div>
                        
                        <div className="slide-info">
                          <div className="slide-title">{game.name}</div>
                          <div className="slide-time">
                            <i className="fas fa-clock"></i> Не играно
                          </div>
                          
                          <div className="game-details">
                            <div className="game-meta">
                              <span className="game-file">
                                <i className="fas fa-file"></i> {game.fileName}
                              </span>
                              <span className="game-size">
                                <i className="fas fa-hdd"></i> {game.fileSize}
                              </span>
                              <span className="game-date">
                                <i className="fas fa-calendar"></i> {game.uploadDate}
                              </span>
                            </div>
                            <div className="game-platform">
                              <i className={consoles[selectedConsole]?.icon}></i>
                              <span>{consoles[selectedConsole]?.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-games-message">
                    <div className="empty-icon">
                      <i className="fas fa-gamepad"></i>
                    </div>
                    <h3>Нет игр в этой консоли</h3>
                    <p>В выбранной папке не найдено игр для {consoles[selectedConsole]?.name}</p>
                  </div>
                )}
              </div>
            </div>
            
            {consoles[selectedConsole]?.games.length > 0 && (
              <div className="carousel-indicator">
                {consoles[selectedConsole]?.games.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator-dot ${selectedGame === index ? 'active' : ''}`}
                    onClick={() => setSelectedGame(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            Сканирование папки...
            <div className="loading-subtext">
              Определение консолей и сортировка игр
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesCarousel;