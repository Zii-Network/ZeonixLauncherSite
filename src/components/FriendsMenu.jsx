import React from 'react';
import './FriendsMenu.css';

const FriendsMenu = ({ onClose }) => {
  return (
    <div className="friends-menu-overlay" onClick={onClose}>
      <div className="friends-menu" onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, color: 'white' }}>Друзья</h2>
        <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
          <p>Здесь будет список друзей.</p>
        </div>
        <button className="friends-menu-close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default FriendsMenu;