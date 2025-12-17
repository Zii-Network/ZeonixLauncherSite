import React, { useState } from 'react';
import { useTheme } from '../themeContext';
import './ProfileMenu.css';

const ProfileMenu = ({ onClose, onEditIcons }) => {
  const [nickname, setNickname] = useState('Zinex');
  const { currentTheme, changeTheme, themes, liquidGlassEnabled, toggleLiquidGlass } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleThemeClick = (themeName) => {
    changeTheme(themeName);
    setIsThemeMenuOpen(false);
  };

  if (isThemeMenuOpen) {
    return (
      <div className="profile-menu-overlay" onClick={() => setIsThemeMenuOpen(false)}>
        <div className="theme-menu" onClick={e => e.stopPropagation()}>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Choose a theme</h3>
          
          <div className="theme-grid">
            {Object.entries(themes).map(([key, theme]) => (
              <div
                key={key}
                className={`theme-item ${currentTheme === key ? 'active' : ''}`}
                onClick={() => handleThemeClick(key)}
                style={{
                  background: theme.bg,
                  borderColor: theme.primary,
                  color: theme.primary
                }}
              >
                <div className="theme-preview" style={{ background: theme.bg }}>
                  <div className="theme-dot" style={{ background: theme.primary }}></div>
                  {theme.secondary && (
                    <div className="theme-dot secondary" style={{ background: theme.secondary }}></div>
                  )}
                </div>
                <div className="theme-name">{theme.name}</div>
                {theme.liquidGlass && <div className="liquid-icon">💧</div>}
              </div>
            ))}
          </div>

          <div className="theme-options">
            <div className="liquid-option">
              <span>Liquid Glass w.i.p.</span>
              <div 
                className={`liquid-toggle ${liquidGlassEnabled ? 'active' : ''}`}
                onClick={toggleLiquidGlass}
              >
                <div className="liquid-toggle-slider"></div>
              </div>
            </div>
          </div>

          <button 
            className="back-button"
            onClick={() => setIsThemeMenuOpen(false)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-menu-overlay" onClick={onClose}>
      <div className="profile-menu" onClick={e => e.stopPropagation()}>
        <div className="profile-menu-header">
          <div 
            className="profile-menu-avatar"
            style={{ backgroundImage: "url('/icons_Zii/zinex.gif')" }}
          />
          
          <input
            type="text"
            className="profile-menu-nick"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
          />
        </div>
        
        <div className="profile-menu-settings">
          <div className="settings-item">
            <span className="settings-item-label">Profile settings w.i.p.</span>
          </div>
          <div className="settings-item">
            <span className="settings-item-label">Stats w.i.p.</span>
          </div>
          
          <div className="settings-item" onClick={() => {
            if (onEditIcons) {
              onEditIcons(); // Включаем редактирование
            }
          }}>
            <span className="settings-item-label">Edit icons</span>
            <div className="theme-arrow">✏️</div>
          </div>

          <div className="settings-item" onClick={() => setIsThemeMenuOpen(true)}>
            <span className="settings-item-label">Themes</span>
            <div className="theme-arrow">›</div>
          </div>
          
          <div className="settings-item">
            <span className="settings-item-label">Exit</span>
          </div>
        </div>
        
        <button className="profile-menu-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;