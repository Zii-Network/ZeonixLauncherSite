import React, { useState } from 'react';
import { ThemeProvider } from './themeContext';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import MusicPlayer from './components/MusicPlayer';
import ProfileMenu from './components/ProfileMenu';
import FriendsMenu from './components/FriendsMenu';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import AchievementsPage from './pages/AchievementsPage';
import FriendsPage from './pages/FriendsPage';
import AppsPage from './pages/AppsPage';
import './styles/main.css';
import './styles/themes.css';
import './styles/animations.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [friendsMenuOpen, setFriendsMenuOpen] = useState(false);
  const [isEditingIcons, setIsEditingIcons] = useState(false);

  const sections = {
    home: <HomePage isEditing={isEditingIcons} onToggleEdit={() => setIsEditingIcons(!isEditingIcons)} />,
    games: <GamesPage />,
    achievements: <AchievementsPage />,
    friends: <FriendsPage />,
    apps: <AppsPage />
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        <TopBar 
          onProfileClick={() => setProfileMenuOpen(true)}
          onFriendsClick={() => setFriendsMenuOpen(true)}
        />
        
        <div className="content-container">
          {sections[activeSection]}
        </div>

        <BottomBar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <MusicPlayer />
        
        {profileMenuOpen && (
          <ProfileMenu 
            onClose={() => setProfileMenuOpen(false)}
            onEditIcons={() => {
              setIsEditingIcons(true);
              setProfileMenuOpen(false);
            }}
          />
        )}
        
        {friendsMenuOpen && (
          <FriendsMenu onClose={() => setFriendsMenuOpen(false)} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;