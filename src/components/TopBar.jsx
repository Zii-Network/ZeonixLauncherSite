import React, { useState, useEffect } from 'react';

const TopBar = ({ onProfileClick, onFriendsClick }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      setCurrentDate(`${day}/${month}`);
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-bar">
      <div className="top-left" onClick={onFriendsClick}>
        <div 
          className="profile-icon" 
          style={{ backgroundImage: "url('/icons_Zii/sat.png')" }}
        />
        <div>Friends</div>
      </div>
      
      <div className="top-right">
        <div id="current-date">{currentDate}</div>
        <div id="current-time">{currentTime}</div>
        
        <div 
          className="profile-icon big" 
          onClick={onProfileClick}
          style={{ backgroundImage: "url('/icons_Zii/zinex.gif')" }}
        />
      </div>
    </div>
  );
};

export default TopBar;