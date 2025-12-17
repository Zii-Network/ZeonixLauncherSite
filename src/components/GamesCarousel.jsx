import React, { useState, useEffect, useRef } from 'react';
import './GamesCarousel.css';

const GamesCarousel = () => {
  // Все возможные консоли
  const allConsoles = [
    {
      id: "gba",
      name: "Game Boy Advance",
      icon: "fas fa-gameboy",
      color: "#73b7ff",
      fileExtensions: ['gba', 'gb', 'gbc', 'zip', '7z']
    },
    {
      id: "psp",
      name: "PlayStation Portable",
      icon: "fas fa-gamepad",
      color: "#ff6b3d",
      fileExtensions: ['iso', 'cso', 'pbp', 'bin']
    },
    {
      id: "ngpc",
      name: "Neo Geo Pocket",
      icon: "fas fa-gamepad",
      color: "#50ff50",
      fileExtensions: ['ngp', 'ngc', 'zip']
    },
    {
      id: "nds",
      name: "Nintendo DS",
      icon: "fas fa-gamepad",
      color: "#ff66cc",
      fileExtensions: ['nds', 'zip']
    },
    {
      id: "ps1",
      name: "PlayStation 1",
      icon: "fas fa-playstation",
      color: "#9966ff",
      fileExtensions: ['cue', 'bin', 'img']
    },
    {
      id: "genesis",
      name: "Sega Genesis",
      icon: "fas fa-gamepad",
      color: "#ffcc00",
      fileExtensions: ['md', 'gen', 'smd', 'zip']
    },
    {
      id: "snes",
      name: "Super Nintendo",
      icon: "fas fa-gamepad",
      color: "#ff3366",
      fileExtensions: ['sfc', 'smc', 'zip']
    },
    {
      id: "n64",
      name: "Nintendo 64",
      icon: "fas fa-gamepad",
      color: "#ff9900",
      fileExtensions: ['z64', 'v64', 'n64', 'zip']
    },
    {
      id: "ps2",
      name: "PlayStation 2",
      icon: "fas fa-playstation",
      color: "#0066cc",
      fileExtensions: ['iso', 'bin', 'img']
    },
    {
      id: "dreamcast",
      name: "Sega Dreamcast",
      icon: "fas fa-gamepad",
      color: "#00cc99",
      fileExtensions: ['cdi', 'gdi', 'iso']
    }
  ];

  const [consoles, setConsoles] = useState([]);
  const [currentFolderPath, setCurrentFolderPath] = useState('');
  const [selectedConsole, setSelectedConsole] = useState(0);
  const [selectedGame, setSelectedGame] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(true);
  const [currentGameForEmulator, setCurrentGameForEmulator] = useState(null);
  const [showEmulator, setShowEmulator] = useState(false);
  const [gameFiles, setGameFiles] = useState({}); // Добавлено
  
  const fileInputRef = useRef(null);

  // Определение консоли по расширению файла
  const getConsoleByExtension = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    
    for (const console of allConsoles) {
      if (console.fileExtensions.includes(ext)) {
        return console.id;
      }
    }
    
    return null;
  };

  // Функция для преобразования dataURL обратно в File
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while(n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type: mime});
  };

  useEffect(() => {
    // Загружаем сохраненные игры
    const savedGames = JSON.parse(localStorage.getItem('userGames') || '{}');
    const savedConsoles = JSON.parse(localStorage.getItem('userConsoles') || '[]');
    const savedFolderPath = localStorage.getItem('currentFolderPath') || '';
    const savedGameFiles = JSON.parse(localStorage.getItem('gameFiles') || '{}');
  
    if (savedConsoles.length > 0 && Object.keys(savedGames).length > 0) {
      const restoredConsoles = savedConsoles.map(consoleId => {
        const consoleInfo = allConsoles.find(c => c.id === consoleId);
        const gamesWithData = (savedGames[consoleId] || []).map(game => ({
          ...game,
          fileObject: savedGameFiles[game.fileName] ? 
            dataURLtoFile(savedGameFiles[game.fileName], game.fileName) : null
        }));
        
        return {
          ...consoleInfo,
          games: gamesWithData
        };
      });
    
      setConsoles(restoredConsoles);
      setCurrentFolderPath(savedFolderPath);
      setGameFiles(savedGameFiles);
      setShowFolderSelector(false);
    
      if (restoredConsoles.length > 0) {
        setSelectedConsole(0);
        setSelectedGame(0);
      }
    }
  }, []);

  const saveToStorage = (consolesWithGames, filesMap, folderPath = '') => {
    const games = {};
    const consoleIds = [];
    const gameFilesData = {};
  
    consolesWithGames.forEach(console => {
      if (console.games.length > 0) {
        games[console.id] = console.games.map(game => ({
          id: game.id,
          name: game.name,
          fileName: game.fileName,
          fileSize: game.fileSize,
          uploadDate: game.uploadDate,
          consoleId: game.consoleId
        }));
        consoleIds.push(console.id);
      }
    });
  
    // Сохраняем файлы как dataURL
    Object.keys(filesMap).forEach(fileName => {
      const file = filesMap[fileName];
      if (file && file.size < 10 * 1024 * 1024) { // Ограничение 10MB
        const reader = new FileReader();
        reader.onload = (e) => {
          gameFilesData[fileName] = e.target.result;
          localStorage.setItem('gameFiles', JSON.stringify(gameFilesData));
        };
        reader.readAsDataURL(file);
      }
    });
  
    localStorage.setItem('userGames', JSON.stringify(games));
    localStorage.setItem('userConsoles', JSON.stringify(consoleIds));
    if (folderPath) {
      localStorage.setItem('currentFolderPath', folderPath);
    }
  };

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsLoading(true);
    setShowFolderSelector(false);

    const folderPath = files[0]?.webkitRelativePath?.split('/')[0] || 'Выбранная папка';
    setCurrentFolderPath(folderPath);

    // Группируем файлы по консолям и сохраняем файлы
    const gamesByConsole = {};
    const filesMap = {};
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const consoleId = getConsoleByExtension(file.name);
      
      if (consoleId) {
        if (!gamesByConsole[consoleId]) {
          gamesByConsole[consoleId] = [];
        }
        
        const consoleInfo = allConsoles.find(c => c.id === consoleId);
        const gameName = file.name.replace(/\.[^/.]+$/, "");
        
        // Сохраняем файл
        filesMap[file.name] = file;
        
        gamesByConsole[consoleId].push({
          id: `${consoleId}_${Date.now()}_${i}`,
          name: gameName,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          uploadDate: new Date().toLocaleDateString(),
          consoleId: consoleId,
          fileObject: file
        });
      }
    }

    // Создаем массив консолей с играми
    const consolesWithGames = Object.keys(gamesByConsole).map(consoleId => {
      const consoleInfo = allConsoles.find(c => c.id === consoleId);
      return {
        ...consoleInfo,
        games: gamesByConsole[consoleId]
      };
    });

    // Сортируем по количеству игр
    consolesWithGames.sort((a, b) => b.games.length - a.games.length);

    setConsoles(consolesWithGames);
    setGameFiles(filesMap);
    
    if (consolesWithGames.length > 0) {
      setSelectedConsole(0);
      setSelectedGame(0);
      saveToStorage(consolesWithGames, filesMap, folderPath);
    } else {
      setTimeout(() => {
        alert('No supported games were found in the selected folder.\nSupported formats: .gba, .gb, .gbc, .iso, .nds и другие.');
        setShowFolderSelector(true);
      }, 100);
    }

    setIsLoading(false);
    event.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const launchEmulator = (game) => {
    const currentConsole = consoles[selectedConsole];
    if (!currentConsole || !game) return;
    
    // Проверяем наличие файла
    if (!game.fileObject) {
      alert('The game file did not load. Try reloading your library.');
      return;
    }
    
    // Проверяем размер файла
    if (game.fileObject.size > 25 * 1024 * 1024) {
      if (!window.confirm(`The game file is large (${game.fileSize}).\nEmulation may be slow. Continue?`)) {
        return;
      }
    }
    
    setCurrentGameForEmulator({
      game: game,
      consoleInfo: currentConsole
    });
    setShowEmulator(true);
  };

  const handleGameClick = (game) => {
    launchEmulator(game);
  };

  const handleSelectFolderClick = () => {
    fileInputRef.current.click();
  };

  const reloadCurrentFolder = async () => {
    const savedGames = JSON.parse(localStorage.getItem('userGames') || '{}');
    const savedConsoles = JSON.parse(localStorage.getItem('userConsoles') || '[]');
    const savedGameFiles = JSON.parse(localStorage.getItem('gameFiles') || '{}');
    
    if (savedConsoles.length > 0 && Object.keys(savedGames).length > 0) {
      const restoredConsoles = savedConsoles.map(consoleId => {
        const consoleInfo = allConsoles.find(c => c.id === consoleId);
        const gamesWithData = (savedGames[consoleId] || []).map(game => ({
          ...game,
          fileObject: savedGameFiles[game.fileName] ? 
            dataURLtoFile(savedGameFiles[game.fileName], game.fileName) : null
        }));
        
        return {
          ...consoleInfo,
          games: gamesWithData
        };
      });
      
      setConsoles(restoredConsoles);
      setGameFiles(savedGameFiles);
      alert('The library has been updated!');
    } else {
      alert('There is no saved folder for reboot.');
    }
  };

  const handleResetLibrary = () => {
    if (window.confirm('Delete all downloaded games and choose another folder?')) {
      localStorage.removeItem('userGames');
      localStorage.removeItem('userConsoles');
      localStorage.removeItem('currentFolderPath');
      localStorage.removeItem('gameFiles');
      setConsoles([]);
      setGameFiles({});
      setCurrentFolderPath('');
      setShowFolderSelector(true);
      setSelectedConsole(0);
      setSelectedGame(0);
    }
  };

  const closeEmulator = () => {
    setShowEmulator(false);
    setCurrentGameForEmulator(null);
  };

  // EmulatorFrame компонент
  const EmulatorFrame = () => {
    if (!showEmulator || !currentGameForEmulator) return null;
    
    const { game, consoleInfo } = currentGameForEmulator;
    
    const getEmulatorCore = () => {
      if (!game?.fileName) return 'nes';
      
      const ext = game.fileName.toLowerCase().split('.').pop();
      const coreMap = {
        'gba': 'gba', 'gb': 'gb', 'gbc': 'gbc',
        'nds': 'nds',
        'sfc': 'snes', 'smc': 'snes',
        'z64': 'n64', 'n64': 'n64', 'v64': 'n64',
        'nes': 'nes',
        'md': 'segaMD', 'gen': 'segaMD', 'smd': 'segaMD',
        'iso': 'psp', 'cso': 'psp', 'pbp': 'psp',
        'bin': 'psx', 'cue': 'psx', 'img': 'psx',
        'ngp': 'ngp', 'ngc': 'ngp'
      };
      
      return coreMap[ext] || 'nes';
    };

    const generateEmulatorHTML = () => {
      const core = getEmulatorCore();
      const gameUrl = game.fileObject ? URL.createObjectURL(game.fileObject) : '';
      
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                overflow: hidden;
                width: 100vw;
                height: 100vh;
                background: #000;
              }
              #game {
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <div id="game"></div>
            <script>
              EJS_player = "#game";
              EJS_core = "${core}";
              EJS_gameUrl = "${gameUrl}";
              EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
              EJS_volume = 1.0;
              EJS_defaultControls = true;
              EJS_gameName = "${game.name}";
              EJS_platform = "${consoleInfo?.name || 'Unknown'}";
            </script>
            <script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
          </body>
        </html>
      `;
    };

    return (
      <div className="emulator-overlay">
        <div className="emulator-header">
          <div className="emulator-title">
            <i className="fas fa-gamepad"></i>
            {game.name} - {consoleInfo?.name}
          </div>
          <button className="close-emulator-btn" onClick={closeEmulator}>
            <i className="fas fa-times"></i> Закрыть (ESC)
          </button>
        </div>
        
        <div className="emulator-container">
          <iframe
            srcDoc={generateEmulatorHTML()}
            title={`${game.name} Emulator`}
            className="emulator-iframe"
            allow="fullscreen"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
        
        <div className="emulator-controls">
          <div className="controls-info">
            <div className="info-item">
              <i className="fas fa-keyboard"></i>
              <span>Controls: </span>
            </div>
            <div className="info-item">
              <i className="fas fa-gamepad"></i>
              <span>Gamepads are supported</span>
            </div>
            <div className="info-item">
              <i className="fas fa-save"></i>
              <span>Saves in the browser</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Обработка клавиатуры
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
        if (document.querySelector('.games-panel .carousel-slide.active')) {
          const games = consoles[selectedConsole]?.games || [];
          if (games.length > 0) {
            setSelectedGame((prev) => (prev + 1) % games.length);
          }
        } else {
          const nextIndex = (selectedConsole + 1) % consoles.length;
          setSelectedConsole(nextIndex);
          setSelectedGame(0);
        }
      } else if (e.key === 'ArrowUp') {
        if (document.querySelector('.games-panel .carousel-slide.active')) {
          const games = consoles[selectedConsole]?.games || [];
          if (games.length > 0) {
            setSelectedGame((prev) => (prev - 1 + games.length) % games.length);
          }
        } else {
          const prevIndex = (selectedConsole - 1 + consoles.length) % consoles.length;
          setSelectedConsole(prevIndex);
          setSelectedGame(0);
        }
      } else if (e.key === 'Enter') {
        if (document.querySelector('.games-panel .carousel-slide.active')) {
          const game = consoles[selectedConsole]?.games[selectedGame];
          if (game) {
            handleGameClick(game);
          }
        }
      } else if (e.key === 'Escape' && showEmulator) {
        closeEmulator();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedConsole, selectedGame, consoles, showFolderSelector, showEmulator]);

  return (
    <div className="games-carousel-wrapper">
      {/* Скрытый input для выбора папки */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        accept=".gba,.gb,.gbc,.zip,.7z,.iso,.cso,.pbp,.bin,.ngp,.ngc,.nds,.cue,.img,.md,.gen,.smd,.sfc,.smc,.z64,.v64,.n64"
        onChange={handleFolderSelect}
        style={{ display: 'none' }}
      />

      {/* Emulator Frame */}
      <EmulatorFrame />

      {/* Экран выбора папки */}
      {showFolderSelector ? (
        <div className="folder-selector-screen">
          <div className="folder-selector-content">
            <div className="folder-icon">
              <i className="fas fa-folder-open"></i>
            </div>
            
            <h1 className="selector-title">Select the folder with games</h1>
            
            <p className="selector-description">
              Select the folder containing your game files. The system will automatically detect consoles and sort games by format.
            </p>
            
            <button 
              className="select-folder-btn"
              onClick={handleSelectFolderClick}
            >
              <i className="fas fa-folder"></i> Select folder
            </button>
            
            <div className="supported-info">
              <h3>Supported formats:</h3>
              <div className="formats-grid">
                <div className="format-category">
                  <h4>Game Boy Advance</h4>
                  <div className="format-list">.gba .gb .gbc .zip .7z</div>
                </div>
                <div className="format-category">
                  <h4>PlayStation Portable</h4>
                  <div className="format-list">.iso .cso .pbp .bin</div>
                </div>
                <div className="format-category">
                  <h4>Nintendo DS</h4>
                  <div className="format-list">.nds .zip</div>
                </div>
                <div className="format-category">
                  <h4>Super Nintendo</h4>
                  <div className="format-list">.sfc .smc .zip</div>
                </div>
                <div className="format-category">
                  <h4>Sega Genesis</h4>
                  <div className="format-list">.md .gen .smd .zip</div>
                </div>
                <div className="format-category">
                  <h4>And others...</h4>
                  <div className="format-list">.ngp .ngc .cue .bin .z64 .n64</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Левая панель - консоли */}
          <div className="carousel-panel consoles-panel">
            <div className="panel-header">
              <h2 className="panel-title">Consoles</h2>
              <div className="panel-subtitle">
                {consoles.length} found • Arrows ↑ ↓
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
                Arrows ↑ ↓ to select • Enter to run
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
                            <i className="fas fa-clock"></i> Not played
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
                    <h3>There are no games on this console.</h3>
                    <p>No games were found in the selected folder for {consoles[selectedConsole]?.name}</p>
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
            Scanning folder...
            <div className="loading-subtext">
              Identifying consoles and sorting games
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesCarousel;