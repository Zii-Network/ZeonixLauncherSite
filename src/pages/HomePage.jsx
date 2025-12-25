import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../themeContext'; 

const HomePage = ({ isEditing = false, onToggleEdit }) => {
  const { currentTheme } = useTheme();

  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('customGames');
    if (saved) return JSON.parse(saved);
    
    const allGames = [];
    for (let i = 0; i < 108; i++) {
      allGames.push({ 
        id: i + 1, 
        name: i === 0 ? 'Emulator' : '—',
        icon: i === 0 ? '/icons_Zii/SegaMegaDrive.png' : '/icons_Zii/empty.png',
        url: i === 0 ? 'data/index.html' : null,
        customIcon: null
      });
    }
    return allGames;
  });

  const [page, setPage] = useState(0);
  const [selectedGame, setSelectedGame] = useState(0);
  const [editingGameIndex, setEditingGameIndex] = useState(null);
  const fileInputRef = useRef(null);
  
  const ITEMS_PER_PAGE = 36;
  const totalPages = 3;

  // цвет снега в зависимости от темы
  const snowColor = useMemo(() => {
    switch (currentTheme) {
      case 'light':
        return '#4a90e2'; 
      case 'cyberpunk':
        return '#00ffff'; 
      case 'neon':
        return '#39ff14'; 
      case 'dark':
      default:
        return 'rgba(255, 255, 255, 0.8)'; 
    }
  }, [currentTheme]);

  // --- ГЕНЕРАЦИЯ СНЕЖИНОК ---
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 10 + 10,
      animationDelay: Math.random() * 10,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.2 // Чуть повысил минимальную прозрачность
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem('customGames', JSON.stringify(games));
  }, [games]);

  const handleGameClick = (index) => {
    const absoluteIndex = page * ITEMS_PER_PAGE + index;
    
    if (isEditing) {
      if (games[absoluteIndex].customIcon) {
        setEditingGameIndex(absoluteIndex);
      } else {
        fileInputRef.current.dataset.index = absoluteIndex;
        fileInputRef.current.click();
      }
    } else {
      setSelectedGame(absoluteIndex);
      const game = games[absoluteIndex];
      if (game.url) {
        window.location.href = game.url;
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const index = parseInt(e.target.dataset.index);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const name = prompt('Game name:', games[index].name || 'Game');
      
      const newGames = [...games];
      newGames[index] = {
        ...newGames[index],
        name: name || 'Game',
        customIcon: event.target.result
      };
      
      setGames(newGames);
      setSelectedGame(index);
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReplaceIcon = () => {
    if (editingGameIndex !== null) {
      fileInputRef.current.dataset.index = editingGameIndex;
      fileInputRef.current.click();
      setEditingGameIndex(null);
    }
  };

  const handleDeleteIcon = () => {
    if (editingGameIndex === null) return;
    
    const newGames = [...games];
    newGames[editingGameIndex] = {
      ...newGames[editingGameIndex],
      name: "—",
      customIcon: null
    };
    
    setGames(newGames);
    setSelectedGame(editingGameIndex);
    setEditingGameIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingGameIndex(null);
  };

  const nextPage = () => {
    if (page < totalPages - 1) {
      setPage(prev => prev + 1);
      setSelectedGame((page + 1) * ITEMS_PER_PAGE);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
      setSelectedGame((page - 1) * ITEMS_PER_PAGE);
    }
  };

  const pageGames = games.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <div className="section active" style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative',
      // Убрал жесткий фон background: '#1a1a1a', так как он теперь управляется через CSS темы
      background: 'transparent' 
    }}>
      
      {/* --- СЛОЙ СНЕГА --- */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            style={{
              position: 'absolute',
              top: '-20px',
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              background: snowColor, // ИСПОЛЬЗУЕМ ЦВЕТ ТЕМЫ
              borderRadius: '50%',
              opacity: flake.opacity,
              animation: `snowfall ${flake.animationDuration}s linear infinite`,
              animationDelay: `-${flake.animationDelay}s`,
              filter: currentTheme === 'cyberpunk' || currentTheme === 'neon' ? 'blur(0.5px) drop-shadow(0 0 2px currentColor)' : 'blur(1px)', // Добавил свечение для киберпанка/неона
              transition: 'background-color 0.5s ease' // Плавная смена цвета при переключении темы
            }}
          />
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileSelect}
      />

      {editingGameIndex !== null && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
          }}
          onClick={handleCancelEdit}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)', // Используем CSS переменную темы
              border: '2px solid var(--accent)',
              borderRadius: '15px',
              padding: '20px',
              width: '90%',
              maxWidth: '300px',
              textAlign: 'center',
              color: 'var(--text-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '15px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 10px',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <img 
                  src={games[editingGameIndex]?.customIcon || games[editingGameIndex]?.icon} 
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: '16px', marginBottom: '15px' }}>
                {games[editingGameIndex]?.name || 'Icon'}
              </div>
            </div>
            
            <button
              onClick={handleReplaceIcon}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '10px',
                background: 'rgba(115, 183, 255, 0.2)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🔄</span> Replace image
            </button>
            
            <button
              onClick={handleDeleteIcon}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 100, 100, 0.2)',
                color: '#ff6464',
                border: '1px solid #ff6464',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🗑️</span> Delete icon
            </button>
            
            <button
              onClick={handleCancelEdit}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '15px',
                background: 'rgba(100, 100, 100, 0.5)',
                color: 'white',
                border: '1px solid rgba(150, 150, 150, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        className="app-title"
        style={{
          position: 'fixed',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(18px, 2.5vw, 32px)',
          textShadow: '0 0 10px var(--accent)',
          zIndex: 9,
          color: 'var(--text-primary)'
        }}
      >
        {games[selectedGame]?.name || '—'}
        {isEditing && ' (Editing)'}
      </div>

      {isEditing && (
        <button
          onClick={onToggleEdit}
          style={{
            position: 'fixed',
            bottom: 'clamp(80px, 10vh, 120px)',
            left: '20px',
            zIndex: 10,
            padding: '10px 20px',
            background: 'rgba(255, 100, 100, 0.8)',
            color: 'white',
            border: '2px solid #ff6464',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontSize: 'clamp(12px, 1.2vw, 16px)',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          ✖ Finish editing
        </button>
      )}

      <div
        onClick={prevPage}
        style={{
          position: 'fixed',
          left: 'clamp(10px, 1.5vw, 20px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 'clamp(50px, 5vw, 70px)',
          height: 'clamp(50px, 5vw, 70px)',
          borderRadius: '50%',
          background: page === 0 ? 'rgba(50, 50, 50, 0.3)' : 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '2px solid var(--border)',
          fontSize: 'clamp(24px, 3vw, 36px)',
          cursor: page === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: page === 0 ? 0.3 : 0.8,
          transition: 'all 0.3s',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          if (page !== 0) {
            e.target.style.background = 'rgba(115, 183, 255, 0.3)';
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 20px var(--accent)';
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (page !== 0) {
            e.target.style.background = 'var(--bg-secondary)';
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }
        }}
      >
        ‹
      </div>

      <div
        onClick={nextPage}
        style={{
          position: 'fixed',
          right: 'clamp(10px, 1.5vw, 20px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 'clamp(50px, 5vw, 70px)',
          height: 'clamp(50px, 5vw, 70px)',
          borderRadius: '50%',
          background: page === totalPages - 1 ? 'rgba(50, 50, 50, 0.3)' : 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '2px solid var(--border)',
          fontSize: 'clamp(24px, 3vw, 36px)',
          cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: page === totalPages - 1 ? 0.3 : 0.8,
          transition: 'all 0.3s',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          if (page !== totalPages - 1) {
            e.target.style.background = 'rgba(115, 183, 255, 0.3)';
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 20px var(--accent)';
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (page !== totalPages - 1) {
            e.target.style.background = 'var(--bg-secondary)';
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }
        }}
      >
        ›
      </div>

      <div className="page-indicator" style={{
        position: 'fixed',
        bottom: 'clamp(80px, 10vh, 120px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'clamp(10px, 1.2vw, 18px)',
        zIndex: 10
      }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i}
            className={`page-dot ${i === page ? 'active' : ''}`}
            onClick={() => {
              setPage(i);
              setSelectedGame(i * ITEMS_PER_PAGE);
            }}
            style={{
              width: 'clamp(10px, 1vw, 14px)',
              height: 'clamp(10px, 1vw, 14px)',
              borderRadius: '50%',
              background: i === page ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: i === page ? '0 0 10px var(--accent)' : 'none',
              opacity: i === page ? 1 : 0.5
            }}
          />
        ))}
      </div>

      <div
        className="game-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridAutoRows: '1fr',
          gap: 'clamp(8px, 1.2vw, 20px)',
          width: 'clamp(85%, 90vw, 95%)',
          aspectRatio: '12 / 3',
          margin: '0 auto',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '0',
          maxHeight: '80vh',
          zIndex: 5
        }}
      >
        {pageGames.map((game, index) => {
          const absoluteIndex = page * ITEMS_PER_PAGE + index;
          
          return (
            <div
              key={game.id}
              className={`game-icon ${absoluteIndex === selectedGame ? 'selected' : ''}`}
              onClick={() => handleGameClick(index)}
              onMouseEnter={() => setSelectedGame(absoluteIndex)}
              data-name={game.name}
              style={{
                position: 'relative',
                animation: isEditing && !game.customIcon ? 'shake 0.5s ease-in-out infinite alternate' : 'none',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <img 
                src={game.customIcon || game.icon} 
                alt={game.name} 
                style={{
                  borderRadius: 'clamp(8px, 1vw, 15px)',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  transition: 'transform 0.2s',
                  border: absoluteIndex === selectedGame ? '2px solid var(--accent)' : '2px solid transparent',
                  boxShadow: absoluteIndex === selectedGame ? '0 0 15px var(--accent)' : 'none'
                }}
              />
              
              {isEditing && !game.customIcon && (
                <div style={{
                  position: 'absolute',
                  top: 'clamp(3px, 0.5vw, 8px)',
                  right: 'clamp(3px, 0.5vw, 8px)',
                  background: 'rgba(115, 183, 255, 0.9)',
                  color: 'white',
                  width: 'clamp(20px, 2.2vw, 30px)',
                  height: 'clamp(20px, 2.2vw, 30px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(14px, 1.5vw, 22px)',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px #73b7ff'
                }}>
                  +
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(-2px) rotate(-1deg); }
          100% { transform: translateX(2px) rotate(1deg); }
        }
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0);
          }
          25% {
            transform: translateY(25vh) translateX(10px);
          }
          50% {
            transform: translateY(50vh) translateX(-10px);
          }
          75% {
            transform: translateY(75vh) translateX(10px);
          }
          100% {
            transform: translateY(110vh) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;