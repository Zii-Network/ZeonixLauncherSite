import React, { useState, useRef, useEffect } from 'react';

const HomePage = ({ isEditing = false, onToggleEdit }) => {
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
  const [editingGameIndex, setEditingGameIndex] = useState(null); // Для меню замены/удаления
  const fileInputRef = useRef(null);
  
  const ITEMS_PER_PAGE = 36;
  const totalPages = 3;

  useEffect(() => {
    localStorage.setItem('customGames', JSON.stringify(games));
  }, [games]);

  const handleGameClick = (index) => {
    const absoluteIndex = page * ITEMS_PER_PAGE + index;
    
    if (isEditing) {
      // Если иконка уже изменена, показываем меню
      if (games[absoluteIndex].customIcon) {
        setEditingGameIndex(absoluteIndex);
      } else {
        // Если иконка пустая, сразу открываем выбор файла
        fileInputRef.current.dataset.index = absoluteIndex;
        fileInputRef.current.click();
      }
    } else {
      // Обычный режим
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
      const name = prompt('Название игры:', games[index].name || 'Игра');
      
      const newGames = [...games];
      newGames[index] = {
        ...newGames[index],
        name: name || 'Игра',
        customIcon: event.target.result
      };
      
      setGames(newGames);
      setSelectedGame(index);
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Функции для меню редактирования
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
      setSelectedGame(page * ITEMS_PER_PAGE);
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
    <div className="section active">
      {/* Скрытый input для загрузки файлов */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Меню замены/удаления иконки */}
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
              background: 'rgba(50, 50, 50, 0.95)',
              border: '2px solid #73b7ff',
              borderRadius: '15px',
              padding: '20px',
              width: '90%',
              maxWidth: '300px',
              textAlign: 'center'
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
              <div style={{ color: 'white', fontSize: '16px', marginBottom: '15px' }}>
                {games[editingGameIndex]?.name || 'Иконка'}
              </div>
            </div>
            
            <button
              onClick={handleReplaceIcon}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '10px',
                background: 'rgba(115, 183, 255, 0.2)',
                color: '#73b7ff',
                border: '1px solid #73b7ff',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🔄</span> Заменить изображение
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
              <span>🗑️</span> Удалить иконку
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
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Заголовок */}
      <div
        className="app-title"
        style={{
          position: 'fixed',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          textShadow: '0 0 10px #73b7ff',
          zIndex: 9
        }}
      >
        {games[selectedGame]?.name || '—'}
        {isEditing && ' (Редактирование)'}
      </div>

      {/* Кнопка завершить редактирование */}
      {isEditing && (
        <button
          onClick={onToggleEdit}
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '20px',
            zIndex: 10,
            padding: '10px 20px',
            background: 'rgba(255, 100, 100, 0.8)',
            color: 'white',
            border: '2px solid #ff6464',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 100, 100, 0.9)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 100, 100, 0.8)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ❌ Завершить редактирование
        </button>
      )}

      {/* Стрелка влево */}
      <div
        onClick={prevPage}
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: page === 0 ? 'rgba(50, 50, 50, 0.3)' : 'rgba(50, 50, 50, 0.8)',
          color: 'white',
          border: '2px solid rgba(150, 150, 150, 0.5)',
          fontSize: '28px',
          cursor: page === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: page === 0 ? 0.3 : 1,
          transition: 'all 0.3s',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          if (page !== 0) {
            e.target.style.background = 'rgba(115, 183, 255, 0.3)';
            e.target.style.borderColor = '#73b7ff';
            e.target.style.boxShadow = '0 0 20px #73b7ff';
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (page !== 0) {
            e.target.style.background = 'rgba(50, 50, 50, 0.8)';
            e.target.style.borderColor = 'rgba(150, 150, 150, 0.5)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }
        }}
      >
        ‹
      </div>

      {/* Стрелка вправо */}
      <div
        onClick={nextPage}
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: page === totalPages - 1 ? 'rgba(50, 50, 50, 0.3)' : 'rgba(50, 50, 50, 0.8)',
          color: 'white',
          border: '2px solid rgba(150, 150, 150, 0.5)',
          fontSize: '28px',
          cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: page === totalPages - 1 ? 0.3 : 1,
          transition: 'all 0.3s',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          if (page !== totalPages - 1) {
            e.target.style.background = 'rgba(115, 183, 255, 0.3)';
            e.target.style.borderColor = '#73b7ff';
            e.target.style.boxShadow = '0 0 20px #73b7ff';
            e.target.style.transform = 'translateY(-50%) scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (page !== totalPages - 1) {
            e.target.style.background = 'rgba(50, 50, 50, 0.8)';
            e.target.style.borderColor = 'rgba(150, 150, 150, 0.5)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(-50%) scale(1)';
          }
        }}
      >
        ›
      </div>

      {/* Индикатор страниц */}
      <div className="page-indicator" style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '15px',
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
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: i === page ? '#73b7ff' : 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: i === page ? '0 0 10px #73b7ff' : 'none'
            }}
            onMouseEnter={(e) => {
              if (i !== page) {
                e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                e.target.style.transform = 'scale(1.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (i !== page) {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'scale(1)';
              }
            }}
          />
        ))}
      </div>

      {/* Сетка игр */}
      <div
        className="game-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '10px',
          width: '90%',
          height: 'calc(100vh - 300px)',
          margin: '0 auto',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
                animation: isEditing && !game.customIcon ? 'shake 0.5s ease-in-out infinite alternate' : 'none'
              }}
            >
              <img 
                src={game.customIcon || game.icon} 
                alt={game.name} 
                style={{
                  borderRadius: '15px'
                }}
              />
              
              {/* Плюсик на пустых иконках */}
              {isEditing && !game.customIcon && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(115, 183, 255, 0.9)',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
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

      {/* Анимация тряски */}
      <style jsx="true">{`
        @keyframes shake {
          0% { transform: translateX(-2px) rotate(-1deg); }
          100% { transform: translateX(2px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;