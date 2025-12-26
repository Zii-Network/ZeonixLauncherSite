import React, { createContext, useContext, useRef, useState } from 'react';

const GamesContext = createContext();

export const useGames = () => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGames must be used within GamesProvider');
  }
  return context;
};

export const GamesProvider = ({ children }) => {
  const gameFilesRef = useRef({});
  const [consoles, setConsoles] = useState([]);
  const [currentFolderPath, setCurrentFolderPath] = useState('');
  const [hasLoadedGames, setHasLoadedGames] = useState(false);

  const value = {
    gameFilesRef,
    consoles,
    setConsoles,
    currentFolderPath,
    setCurrentFolderPath,
    hasLoadedGames,
    setHasLoadedGames
  };

  return (
    <GamesContext.Provider value={value}>
      {children}
    </GamesContext.Provider>
  );
};