import React from 'react';

const BottomBar = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'home', icon: 'icons_Zii/Home.png', label: 'Главная' },
    { id: 'games', icon: 'icons_Zii/Games.png', label: 'Игры' },
    { id: 'achievements', icon: 'icons_Zii/Achievements.png', label: 'Достижения' },
    { id: 'friends', icon: 'icons_Zii/Friends.png', label: 'Друзья' },
    { id: 'apps', icon: 'icons_Zii/ALLApps.png', label: 'Приложения' }
  ];

  return (
    <div className="bottom-wrapper">
      <div className="bottom-bar">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`bottom-icon ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
            title={section.label}
          >
            <img src={section.icon} alt={section.label} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;