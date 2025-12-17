import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const themes = {
    dark: {
      name: 'Темная',
      class: 'theme-dark',
      bg: '#111',
      primary: '#73b7ff',
      secondary: '#ff6b3d',
      liquidGlass: false
    },
    light: {
      name: 'Светлая',
      class: 'theme-light',
      bg: '#f5f5f5',
      primary: '#73b7ff',
      secondary: '#ff6b3d',
      liquidGlass: false
    },
    cyberpunk: {
      name: 'Киберпанк',
      class: 'theme-cyberpunk',
      bg: '#0a0a1a',
      primary: '#ff00ff',
      secondary: '#00ffff',
      liquidGlass: true
    },
    neon: {
      name: 'Неоновая',
      class: 'theme-neon',
      bg: '#000011',
      primary: '#00ff00',
      secondary: '#ff0099',
      liquidGlass: true
    }
  };

  const [currentTheme, setCurrentTheme] = useState('dark');
  const [liquidGlassEnabled, setLiquidGlassEnabled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedLiquid = localStorage.getItem('liquidGlass') === 'true';
    
    setCurrentTheme(savedTheme);
    setLiquidGlassEnabled(savedLiquid);
    applyTheme(savedTheme, savedLiquid);
  }, []);

  const applyTheme = (themeName, liquidGlass) => {
    const theme = themes[themeName];
    
    // Устанавливаем CSS переменные
    document.documentElement.style.setProperty('--bg-primary', theme.bg);
    document.documentElement.style.setProperty('--bg-secondary', theme.bg === '#111' ? '#222' : '#e8e8e8');
    document.documentElement.style.setProperty('--text-primary', theme.bg === '#111' ? 'white' : '#333');
    document.documentElement.style.setProperty('--text-secondary', theme.bg === '#111' ? '#ccc' : '#666');
    document.documentElement.style.setProperty('--accent', theme.primary);
    document.documentElement.style.setProperty('--accent-secondary', theme.secondary);
    document.documentElement.style.setProperty('--border', theme.bg === '#111' 
      ? 'rgba(150, 150, 150, 0.5)' 
      : 'rgba(100, 100, 100, 0.3)');
    
    // Удаляем все классы тем
    Object.values(themes).forEach(t => {
      document.body.classList.remove(t.class);
    });
    
    // Добавляем текущую тему
    document.body.classList.add(theme.class);
    
    if (liquidGlass && theme.liquidGlass) {
      document.body.classList.add('liquid-glass');
    } else {
      document.body.classList.remove('liquid-glass');
    }
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    applyTheme(themeName, liquidGlassEnabled);
    localStorage.setItem('theme', themeName);
  };

  const toggleLiquidGlass = () => {
    const newValue = !liquidGlassEnabled;
    setLiquidGlassEnabled(newValue);
    applyTheme(currentTheme, newValue);
    localStorage.setItem('liquidGlass', newValue);
  };

  return (
    <ThemeContext.Provider value={{
      themes,
      currentTheme,
      liquidGlassEnabled,
      changeTheme,
      toggleLiquidGlass
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);