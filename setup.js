const fs = require('fs');
const path = require('path');

console.log('🚀 Создание React проекта ConsoleDS...\n');

// Создаём структуру папок
const directories = [
  'src',
  'src/components',
  'src/components/ConsoleDS',
  'src/components/GameKarusel',
  'src/styles',
  'public',
  'public/icons_Zii',
  'public/zinex.lol_files'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Создана папка: ${dir}`);
  }
});

// Создаём package.json
const packageJson = {
  name: "console-ds-react",
  version: "1.0.0",
  private: true,
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  scripts: {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  devDependencies: {
    "react-scripts": "5.0.1"
  },
  browserslist: {
    production: [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    development: [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('📦 Создан package.json');

// Создаём основной App.jsx
const appJsx = `import React, { useState } from 'react';
import ConsoleDSApp from './components/ConsoleDS/ConsoleDSApp';
import GamesKaruselApp from './components/GamesKarusel/GamesKaruselApp';
import './App.css';

const App = () => {
  const [activeApp, setActiveApp] = useState('consoleDS');

  const renderApp = () => {
    switch(activeApp) {
      case 'consoleDS':
        return <ConsoleDSApp />;
      case 'gamesKarusel':
        return <GamesKaruselApp />;
      default:
        return <ConsoleDSApp />;
    }
  };

  return (
    <div className="main-app">
      <div className="app-selector">
        <button 
          className={\`selector-btn \${activeApp === 'consoleDS' ? 'active' : ''}\`}
          onClick={() => setActiveApp('consoleDS')}
        >
          📱 ConsoleDS Menu
        </button>
        <button 
          className={\`selector-btn \${activeApp === 'gamesKarusel' ? 'active' : ''}\`}
          onClick={() => setActiveApp('gamesKarusel')}
        >
          🎮 Games Karusel
        </button>
      </div>
      <div className="app-container">
        {renderApp()}
      </div>
    </div>
  );
};

export default App;`;

fs.writeFileSync('src/App.jsx', appJsx);
console.log('📝 Создан src/App.jsx');

// Создаём index.js
const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

fs.writeFileSync('src/index.js', indexJs);
console.log('📝 Создан src/index.js');

// Создаём index.css
const indexCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

#root {
  height: 100vh;
  overflow: hidden;
}`;

fs.writeFileSync('src/index.css', indexCss);
console.log('🎨 Создан src/index.css');

// Создаём App.css
const appCss = `.main-app {
  height: 100vh;
  background: #0d0f14;
}

.app-selector {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 1000;
  background: rgba(26, 29, 36, 0.8);
  padding: 10px 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 107, 61, 0.3);
}

.selector-btn {
  padding: 8px 16px;
  background: #252830;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.selector-btn:hover {
  background: #2a2d35;
}

.selector-btn.active {
  background: #ff6b3d;
  color: white;
}

.app-container {
  height: 100vh;
  overflow: hidden;
}`;

fs.writeFileSync('src/App.css', appCss);
console.log('🎨 Создан src/App.css');

// Создаём public/index.html
const indexHtml = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="ConsoleDS - Игровая консоль" />
    <title>ConsoleDS React</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
  </head>
  <body>
    <noscript>Для работы приложения необходим JavaScript.</noscript>
    <div id="root"></div>
  </body>
</html>`;

fs.writeFileSync('public/index.html', indexHtml);
console.log('🌐 Создан public/index.html');

console.log('\n✅ Проект создан!');
console.log('\n📋 Дальнейшие действия:');
console.log('1. Скопируй свои иконки в папку public/icons_Zii/');
console.log('2. Скопируй audio файлы в public/zinex.lol_files/');
console.log('3. Запусти: npm install && npm start');
console.log('\n4. Перенеси стили:');
console.log('   - Скопируй стили из consoleDS.html в src/styles/consoleDS.css');
console.log('   - Скопируй стили из gameskarusel.html в src/styles/gamesKarusel.css');
console.log('\n5. Добавь импорт стилей в компоненты:');
console.log('   - В ConsoleDSApp.jsx добавь: import "../../styles/consoleDS.css"');
console.log('   - В GamesKaruselApp.jsx добавь: import "../../styles/gamesKarusel.css"');
console.log('\n🎮 Готово! Приложение запустится на http://localhost:3000');