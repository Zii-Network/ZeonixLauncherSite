import React, { useState, useEffect, useRef } from 'react';
import './GamesCarousel.css';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const SIGNALING_SERVER_URL =
  process.env.REACT_APP_SIGNALING_SERVER ||
  'https://0.peerjs.com';

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const generateRoomId = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── MULTIPLAYER HOOK ──────────────────────────────────────────────────────────
const useMultiplayer = (onGuestLaunch) => {
  const [serverStatus, setServerStatus] = useState('idle'); // idle | checking | online | offline
  const [menuOpen, setMenuOpen]         = useState(false);
  const [roomId, setRoomId]             = useState('');
  const [joinInput, setJoinInput]       = useState('');
  const [nickname, setNickname]         = useState('Player' + Math.floor(Math.random() * 9000 + 1000));
  const [role, setRole]                 = useState(null); // 'host' | 'guest'
  const wsRef                           = useRef(null);

  // Ping the signaling server
  const checkServer = async () => {
    setServerStatus('checking');
    try {
      const res = await fetch(`${SIGNALING_SERVER_URL}/health`, { signal: AbortSignal.timeout(4000) });
      setServerStatus(res.ok ? 'online' : 'offline');
    } catch {
      setServerStatus('offline');
    }
  };

  const connectWS = (room, isHost) => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`${SIGNALING_SERVER_URL.replace(/^http/, 'ws')}/room/${room}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', role: isHost ? 'host' : 'guest', nickname }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'LAUNCH_GAME' && !isHost) {
          onGuestLaunch(msg.payload);
        }
      } catch { /* ignore */ }
    };

    ws.onerror = () => console.error('WS error');
  };

  const hostRoom = () => {
    const id = generateRoomId();
    setRoomId(id);
    setRole('host');
    connectWS(id, true);
  };

  const joinRoom = () => {
    const id = joinInput.trim();
    if (!id || id.length !== 6) { alert('Please enter a valid 6-digit Room ID.'); return; }
    setRoomId(id);
    setRole('guest');
    setJoinInput('');
    connectWS(id, false);
  };

  const broadcastLaunch = (payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'LAUNCH_GAME', payload }));
    }
  };

  const leaveRoom = () => {
    if (wsRef.current) wsRef.current.close();
    setRoomId('');
    setRole(null);
    setMenuOpen(false);
  };

  useEffect(() => () => wsRef.current?.close(), []);

  return {
    serverStatus, menuOpen, setMenuOpen,
    roomId, joinInput, setJoinInput,
    nickname, setNickname, role,
    checkServer, hostRoom, joinRoom, broadcastLaunch, leaveRoom,
  };
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const GamesCarousel = () => {
  const allConsoles = [
    // Nintendo
    { id: "nes",       name: "Nintendo (NES)",         icon: "fas fa-gamepad",     color: "#e4000f", fileExtensions: ['nes','fds','unf','unif','zip','7z'] },
    { id: "snes",      name: "Super Nintendo",         icon: "fas fa-gamepad",     color: "#ff3366", fileExtensions: ['sfc','smc','fig','swc','bs','st','zip','7z'] },
    { id: "n64",       name: "Nintendo 64",            icon: "fas fa-gamepad",     color: "#ff9900", fileExtensions: ['z64','v64','n64','ndd','zip','7z'] },
    { id: "gba",       name: "Game Boy Advance",       icon: "fas fa-gamepad",     color: "#73b7ff", fileExtensions: ['gba','zip','7z'] },
    { id: "gb",        name: "Game Boy",               icon: "fas fa-gamepad",     color: "#8bac0f", fileExtensions: ['gb','gbc','zip','7z'] },
    { id: "nds",       name: "Nintendo DS",            icon: "fas fa-gamepad",     color: "#ff66cc", fileExtensions: ['nds','zip'] },
    { id: "vb",        name: "Virtual Boy",            icon: "fas fa-vr-cardboard",color: "#cc0000", fileExtensions: ['vb','vboy','zip','7z'] },
    // Sega
    { id: "segaMD",    name: "Sega Genesis / MegaDrive", icon: "fas fa-gamepad",  color: "#ffcc00", fileExtensions: ['md','gen','smd','bin','zip','7z'] },
    { id: "segaMS",    name: "Sega Master System",     icon: "fas fa-gamepad",     color: "#1a75ff", fileExtensions: ['sms','zip','7z'] },
    { id: "segaGG",    name: "Sega Game Gear",         icon: "fas fa-gamepad",     color: "#ff6600", fileExtensions: ['gg','zip','7z'] },
    { id: "segaCD",    name: "Sega CD / MegaCD",       icon: "fas fa-compact-disc",color: "#ccaa00", fileExtensions: ['chd','cue','iso','bin'] },
    { id: "sega32x",   name: "Sega 32X",               icon: "fas fa-gamepad",     color: "#ff3300", fileExtensions: ['32x','zip','7z'] },
    { id: "segaSaturn",name: "Sega Saturn",            icon: "fas fa-compact-disc",color: "#9999ff", fileExtensions: ['chd','cue','iso','bin','mdf'] },
    { id: "dreamcast", name: "Sega Dreamcast",         icon: "fas fa-gamepad",     color: "#00cc99", fileExtensions: ['cdi','gdi','chd','iso'] },
    // Sony
    { id: "psx",       name: "PlayStation 1",          icon: "fas fa-playstation", color: "#9966ff", fileExtensions: ['cue','bin','img','chd','pbp','mdf','toc','cbn','m3u'] },
    { id: "ps2",       name: "PlayStation 2",          icon: "fas fa-playstation", color: "#0066cc", fileExtensions: ['iso','chd','bin','img','mdf'] },
    { id: "psp",       name: "PlayStation Portable",   icon: "fas fa-gamepad",     color: "#ff6b3d", fileExtensions: ['iso','cso','pbp','chd'] },
    // Atari
    { id: "atari2600", name: "Atari 2600",             icon: "fas fa-gamepad",     color: "#e67300", fileExtensions: ['a26','bin','zip','7z'] },
    { id: "atari5200", name: "Atari 5200",             icon: "fas fa-gamepad",     color: "#cc5500", fileExtensions: ['a52','bin','zip','7z'] },
    { id: "atari7800", name: "Atari 7800",             icon: "fas fa-gamepad",     color: "#ff7733", fileExtensions: ['a78','bin','zip','7z'] },
    { id: "atarilynx", name: "Atari Lynx",             icon: "fas fa-gamepad",     color: "#ff9966", fileExtensions: ['lnx','zip','7z'] },
    { id: "atariJaguar",name:"Atari Jaguar",           icon: "fas fa-gamepad",     color: "#cc3300", fileExtensions: ['j64','jag','rom','abs','cof','bin','prg','zip','7z'] },
    // NEC
    { id: "pce",       name: "PC Engine / TurboGrafx", icon: "fas fa-gamepad",    color: "#ff4499", fileExtensions: ['pce','zip','7z'] },
    { id: "pcecd",     name: "PC Engine CD",           icon: "fas fa-compact-disc",color: "#cc2266", fileExtensions: ['chd','cue','iso'] },
    { id: "pcfx",      name: "PC-FX",                  icon: "fas fa-gamepad",     color: "#cc44aa", fileExtensions: ['chd','cue','toc','ccd'] },
    // SNK
    { id: "ngp",       name: "Neo Geo Pocket",         icon: "fas fa-gamepad",     color: "#50ff50", fileExtensions: ['ngp','ngc','zip','7z'] },
    { id: "neogeo",    name: "Neo Geo AES / MVS",      icon: "fas fa-gamepad",     color: "#cc0000", fileExtensions: ['zip','7z'] },
    // Arcade / MAME
    { id: "arcade",    name: "Arcade (MAME)",          icon: "fas fa-dice",        color: "#ff4400", fileExtensions: ['zip','7z','chd'] },
    { id: "fba",       name: "FinalBurn Alpha / Neo",  icon: "fas fa-dice",        color: "#ff6600", fileExtensions: ['zip','7z'] },
    // Other Handhelds
    { id: "ws",        name: "WonderSwan",             icon: "fas fa-gamepad",     color: "#33ccff", fileExtensions: ['ws','wsc','zip','7z'] },
    // Computers / Other
    { id: "coleco",    name: "ColecoVision",           icon: "fas fa-gamepad",     color: "#ff8800", fileExtensions: ['col','bin','rom','zip','7z'] },
    { id: "vectrex",   name: "Vectrex",                icon: "fas fa-gamepad",     color: "#66ccff", fileExtensions: ['vec','gam','bin','zip','7z'] },
    { id: "msx",       name: "MSX / MSX2",            icon: "fas fa-keyboard",    color: "#ccff00", fileExtensions: ['rom','mx1','mx2','col','dsk','cas','zip','7z'] },
    { id: "doom",      name: "DOOM (PrBoom)",          icon: "fas fa-skull",       color: "#ff0000", fileExtensions: ['wad','iwad','pwad'] },
  ];

  const [consoles, setConsoles]                   = useState([]);
  const [currentFolderPath, setCurrentFolderPath] = useState('');
  const [selectedConsole, setSelectedConsole]     = useState(0);
  const [selectedGame, setSelectedGame]           = useState(0);
  const [isLoading, setIsLoading]                 = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(true);
  const [currentGameForEmulator, setCurrentGameForEmulator] = useState(null);
  const [showEmulator, setShowEmulator]           = useState(false);

  const gameFilesRef = useRef({});
  const fileInputRef = useRef(null);

  // Guest auto-launch handler: validates ROM is loaded locally, then launches
  const handleGuestLaunch = ({ fileName, core: broadcastCore, gameName, platform, roomId, netplayUrl }) => {
    const fileObject = gameFilesRef.current[fileName];
    if (!fileObject) {
      alert(
        `⚠️ ROM Mismatch!\n\nThe host launched "${gameName}" (${fileName}).\n` +
        `You don't have this ROM loaded. Please load the same ROM file and join the room again.`
      );
      return;
    }
    // Use the platform name broadcast by the host as a tiebreaker for ambiguous extensions
    const consoleInfo = getConsoleByExtensionAndPlatform(fileName, platform);
    const resolvedCore = consoleInfo
      ? getEmulatorCoreForConsole(fileName, consoleInfo.id)
      : (broadcastCore || 'nes');
    setCurrentGameForEmulator({
      game: { name: gameName, fileName, fileObject },
      consoleInfo: consoleInfo || { name: platform, icon: 'fas fa-gamepad', color: '#fff' },
      netplay: { netplayUrl, roomId, role: 'guest', nickname: mp.nickname },
      resolvedCore,
    });
    setShowEmulator(true);
  };

  const mp = useMultiplayer(handleGuestLaunch);

  // ── File handling ────────────────────────────────────────────────────────────

  // Pre-compute which extensions are shared across >1 console (ambiguous).
  // Built once from allConsoles so every call below is O(1) lookup.
  const ambiguousExtensions = (() => {
    const counts = {};
    for (const c of allConsoles)
      for (const ext of c.fileExtensions)
        counts[ext] = (counts[ext] || 0) + 1;
    return new Set(Object.keys(counts).filter(ext => counts[ext] > 1));
  })();

  /**
   * Returns the best console id for a given filename.
   *
   * Strategy (highest-priority first):
   *  1. If the file extension is UNIQUE to exactly one console → return that console immediately.
   *  2. If the extension is ambiguous (shared), score every matching console by how many
   *     of its OWN extensions are *exclusive* (not shared). A console that owns unique
   *     extensions is more "specific" and wins over a catch-all console like NES or arcade
   *     whose entire list is zip/7z.
   *  3. Ties broken by array order (so NES/arcade stay last, not first).
   */
  const getConsoleByExtension = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();

    // Fast path — unambiguous extension
    if (!ambiguousExtensions.has(ext)) {
      const match = allConsoles.find(c => c.fileExtensions.includes(ext));
      return match ? match.id : null;
    }

    // Ambiguous path — pick the most specific console
    const candidates = allConsoles.filter(c => c.fileExtensions.includes(ext));
    if (!candidates.length) return null;

    // Score = number of exclusive (non-shared) extensions this console owns.
    // A console like NES whose list is [nes, fds, unf, unif, zip, 7z] scores 4 (the native
    // ones). A catch-all like neogeo whose list is [zip, 7z] scores 0.
    let best = null, bestScore = -1;
    for (const c of candidates) {
      const score = c.fileExtensions.filter(e => !ambiguousExtensions.has(e)).length;
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return best ? best.id : null;
  };

  /**
   * Variant used by handleGuestLaunch: same logic, but when the score is still tied
   * we fall back to the platform name broadcast by the host, which is authoritative.
   */
  const getConsoleByExtensionAndPlatform = (filename, platformName) => {
    const ext = filename.toLowerCase().split('.').pop();
    // Try an exact platform-name match first (host already knows the console)
    const byName = allConsoles.find(
      c => c.name.toLowerCase() === platformName?.toLowerCase() && c.fileExtensions.includes(ext)
    );
    if (byName) return byName;
    // Fall back to the scored heuristic
    const id = getConsoleByExtension(filename);
    return allConsoles.find(c => c.id === id) || null;
  };

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    setIsLoading(true);
    setShowFolderSelector(false);
    const folderPath = files[0]?.webkitRelativePath?.split('/')[0] || 'Selected folder';
    setCurrentFolderPath(folderPath);
    const gamesByConsole = {};
    const filesMap = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const consoleId = getConsoleByExtension(file.name);
      if (consoleId) {
        if (!gamesByConsole[consoleId]) gamesByConsole[consoleId] = [];
        filesMap[file.name] = file;
        gamesByConsole[consoleId].push({
          id: `${consoleId}_${Date.now()}_${i}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          uploadDate: new Date().toLocaleDateString(),
          consoleId,
          fileObject: file,
        });
      }
    }
    const consolesWithGames = Object.keys(gamesByConsole)
      .map(id => ({ ...allConsoles.find(c => c.id === id), games: gamesByConsole[id] }))
      .sort((a, b) => b.games.length - a.games.length);
    setConsoles(consolesWithGames);
    gameFilesRef.current = filesMap;
    if (consolesWithGames.length > 0) { setSelectedConsole(0); setSelectedGame(0); }
    else { setTimeout(() => { alert('No supported games found.'); setShowFolderSelector(true); }, 100); }
    setIsLoading(false);
    event.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ── Emulator launch ──────────────────────────────────────────────────────────
  const launchEmulator = (game) => {
    const currentConsole = consoles[selectedConsole];
    if (!currentConsole || !game) return;
    const fileObject = gameFilesRef.current[game.fileName];
    if (!fileObject) { alert('Game file not loaded. Please select the folder again.'); return; }
    if (fileObject.size > 25 * 1024 * 1024) {
      if (!window.confirm(`Large file (${game.fileSize}). Emulation may be slow. Continue?`)) return;
    }

    // ROM validation for multiplayer guest (shouldn't reach here, but belt & suspenders)
    // Host: broadcast the launch to guests
    const core = getEmulatorCoreForConsole(game.fileName, currentConsole.id);
    if (mp.role === 'host' && mp.roomId) {
      // Validate guest will have this ROM – we can only hint; actual check is on the guest side
      mp.broadcastLaunch({
        fileName: game.fileName,
        core,
        gameName: game.name,
        platform: currentConsole.name,
        roomId: mp.roomId,
        netplayUrl: SIGNALING_SERVER_URL,
      });
    }

    const netplayPayload = mp.role && mp.roomId
      ? { netplayUrl: SIGNALING_SERVER_URL, roomId: mp.roomId, role: mp.role, nickname: mp.nickname }
      : null;

    setCurrentGameForEmulator({
      game: { ...game, fileObject },
      consoleInfo: currentConsole,
      netplay: netplayPayload,
    });
    setShowEmulator(true);
  };

  const getEmulatorCore = (fileName) => {
    if (!fileName) return 'nes';
    const ext = fileName.toLowerCase().split('.').pop();
    const coreMap = {
      // Nintendo
      'nes':'nes','fds':'nes','unf':'nes','unif':'nes',
      'sfc':'snes','smc':'snes','fig':'snes','swc':'snes','bs':'snes','st':'snes',
      'z64':'n64','v64':'n64','n64':'n64','ndd':'n64',
      'gba':'gba',
      'gb':'gb','gbc':'gb',
      'nds':'nds',
      'vb':'vb','vboy':'vb',
      // Sega
      'md':'segaMD','gen':'segaMD','smd':'segaMD',
      'sms':'segaMS',
      'gg':'segaGG',
      '32x':'sega32x',
      'mdf':'psx', // overridden below per context; handled by extension priority
      'cdi':'dreamcast','gdi':'dreamcast',
      // Sony
      'cue':'psx','img':'psx','toc':'psx','cbn':'psx','m3u':'psx','pbp':'psp',
      'iso':'psx',  // default; PSP ISOs still use 'psp' core — resolved via console detection
      'cso':'psp',
      // Atari
      'a26':'atari2600',
      'a52':'atari5200',
      'a78':'atari7800',
      'lnx':'atarilynx',
      'j64':'atariJaguar','jag':'atariJaguar',
      // NEC
      'pce':'pce',
      // SNK
      'ngp':'ngp','ngc':'ngp',
      'ws':'ws','wsc':'ws',
      // Computers / Other
      'col':'coleco',
      'vec':'vectrex','gam':'vectrex',
      'mx1':'msx','mx2':'msx','dsk':'msx','cas':'msx',
      'wad':'doom','iwad':'doom','pwad':'doom',
      // Generic containers — resolved by console context
      'chd':'psx','bin':'nes','rom':'coleco','zip':'nes','7z':'nes',
    };
    return coreMap[ext] || 'nes';
  };

  // Smarter core resolver: uses the detected console id when available
  const getEmulatorCoreForConsole = (fileName, consoleId) => {
    const consoleCoreMap = {
      'nes':'nes','snes':'snes','n64':'n64','gba':'gba','gb':'gb','nds':'nds','vb':'vb',
      'segaMD':'segaMD','segaMS':'segaMS','segaGG':'segaGG','segaCD':'segaCD',
      'sega32x':'sega32x','segaSaturn':'segaSaturn','dreamcast':'dreamcast',
      'psx':'psx','ps2':'ps2','psp':'psp',
      'atari2600':'atari2600','atari5200':'atari5200','atari7800':'atari7800',
      'atarilynx':'atarilynx','atariJaguar':'atariJaguar',
      'pce':'pce','pcecd':'pcecd','pcfx':'pcfx',
      'ngp':'ngp','neogeo':'neogeo',
      'arcade':'arcade','fba':'fba',
      'ws':'ws','coleco':'coleco','vectrex':'vectrex','msx':'msx','doom':'doom',
    };
    return consoleCoreMap[consoleId] || getEmulatorCore(fileName);
  };

  const handleGameClick = (game) => launchEmulator(game);
  const handleSelectFolderClick = () => fileInputRef.current.click();

  const handleResetLibrary = () => {
    if (window.confirm('Delete all loaded games and choose another folder?')) {
      gameFilesRef.current = {};
      setConsoles([]);
      setCurrentFolderPath('');
      setShowFolderSelector(true);
      setSelectedConsole(0);
      setSelectedGame(0);
    }
  };

  const closeEmulator = () => { setShowEmulator(false); setCurrentGameForEmulator(null); };

  // ── Keyboard nav ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (showEmulator) {
      const handler = (e) => { if (e.key === 'Escape') closeEmulator(); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
    if (showFolderSelector || consoles.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        if (document.querySelector('.games-panel .carousel-slide.active')) {
          const games = consoles[selectedConsole]?.games || [];
          if (games.length > 0) setSelectedGame(p => (p + 1) % games.length);
        } else { setSelectedConsole(p => (p + 1) % consoles.length); setSelectedGame(0); }
      } else if (e.key === 'ArrowUp') {
        if (document.querySelector('.games-panel .carousel-slide.active')) {
          const games = consoles[selectedConsole]?.games || [];
          if (games.length > 0) setSelectedGame(p => (p - 1 + games.length) % games.length);
        } else { setSelectedConsole(p => (p - 1 + consoles.length) % consoles.length); setSelectedGame(0); }
      } else if (e.key === 'Enter') {
        const game = consoles[selectedConsole]?.games[selectedGame];
        if (game) handleGameClick(game);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedConsole, selectedGame, consoles, showFolderSelector, showEmulator]);

  // ── EmulatorFrame ────────────────────────────────────────────────────────────
  const EmulatorFrame = () => {
    const iframeRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const game        = currentGameForEmulator?.game;
    const consoleInfo = currentGameForEmulator?.consoleInfo;
    const netplay     = currentGameForEmulator?.netplay;
    // resolvedCore is pre-computed on the guest path (handleGuestLaunch) where
    // consoleInfo may only be a fallback object without a valid .id.
    // On the host path it is always undefined, so we derive it here instead.
    const resolvedCore = currentGameForEmulator?.resolvedCore;

    useEffect(() => {
      if (!isReady || !iframeRef.current || !game?.fileObject) return;
      const gameUrl = URL.createObjectURL(game.fileObject);
      // Use the pre-resolved core when available (guest), otherwise derive from
      // the confirmed consoleInfo.id (host). Never fall back to the old
      // getEmulatorCore() which hard-codes zip/bin/chd to 'nes'.
      const core = resolvedCore ?? getEmulatorCoreForConsole(game.fileName, consoleInfo?.id);
      setTimeout(() => {
        if (iframeRef.current) {
          const message = {
            type:     'INIT_GAME',
            core,
            gameUrl,
            gameName: game.name,
            platform: consoleInfo?.name || 'Unknown',
          };

          if (netplay && netplay.netplayUrl && netplay.roomId && netplay.nickname) {
            message.netplay = {
              netplayUrl: netplay.netplayUrl.replace(/^http(s?):\/\//, 'ws$1://'),
              roomId:     String(netplay.roomId),
              nickname:   String(netplay.nickname),
              role:       netplay.role,
            };
          }

          iframeRef.current.contentWindow.postMessage(message, '*');
        }
      }, 500);
      return () => URL.revokeObjectURL(gameUrl);
    }, [isReady, game, consoleInfo, netplay, resolvedCore]);

    if (!showEmulator || !currentGameForEmulator) return null;

    return (
      <div className="emulator-overlay">
        <div className="emulator-header">
          <div className="emulator-title">
            <i className="fas fa-gamepad"></i>
            {game.name} — {consoleInfo?.name}
            {netplay && (
              <span className="emulator-room-badge">
                <i className="fas fa-globe"></i> Room: {netplay.roomId} · {netplay.role}
              </span>
            )}
          </div>
          <button className="close-emulator-btn" onClick={closeEmulator}>
            <i className="fas fa-times"></i> Close (ESC)
          </button>
        </div>
        <div className="emulator-container">
          <iframe
            ref={iframeRef}
            src="/emulator.html"
            title={`${game.name} Emulator`}
            className="emulator-iframe"
            allow="gamepad; fullscreen"
            allowFullScreen
            onLoad={() => setIsReady(true)}
          />
        </div>
        <div className="emulator-controls">
          <div className="controls-info">
            <div className="info-item"><i className="fas fa-keyboard"></i><span>Controls: Auto</span></div>
            <div className="info-item"><i className="fas fa-gamepad"></i><span>Gamepad: Supported</span></div>
            <div className="info-item"><i className="fas fa-save"></i><span>Saves: In browser</span></div>
            {netplay && (
              <div className="info-item">
                <i className="fas fa-globe"></i>
                <span>Netplay · {netplay.nickname}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Multiplayer Menu ─────────────────────────────────────────────────────────
  const MultiplayerMenu = () => {
    if (!mp.menuOpen) return null;
    const statusColor = { idle:'#aaa', checking:'#f0c040', online:'#4caf50', offline:'#f44336' }[mp.serverStatus];
    const statusLabel = { idle:'Not checked', checking:'Checking…', online:'Online ✓', offline:'Offline ✗' }[mp.serverStatus];

    return (
      <div className="mp-menu-overlay" onClick={() => mp.setMenuOpen(false)}>
        <div className="mp-menu" onClick={e => e.stopPropagation()}>
          <div className="mp-menu-header">
            <i className="fas fa-globe"></i>
            <span>Multiplayer</span>
            <button className="mp-close-btn" onClick={() => mp.setMenuOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Server status */}
          <div className="mp-section">
            <div className="mp-server-row">
              <span className="mp-server-label">Signaling Server</span>
              <span className="mp-status-dot" style={{ background: statusColor }}></span>
              <span className="mp-status-text" style={{ color: statusColor }}>{statusLabel}</span>
              <button className="mp-ping-btn" onClick={mp.checkServer}>
                <i className="fas fa-sync-alt"></i> Ping
              </button>
            </div>
            <div className="mp-server-url">{SIGNALING_SERVER_URL}</div>
          </div>

          {/* Nickname */}
          <div className="mp-section">
            <label className="mp-label">Your Nickname</label>
            <input
              className="mp-input"
              value={mp.nickname}
              onChange={e => mp.setNickname(e.target.value)}
              maxLength={20}
              disabled={!!mp.role}
            />
          </div>

          {mp.role ? (
            /* In a room */
            <div className="mp-section mp-in-room">
              <div className="mp-room-display">
                <i className="fas fa-door-open"></i>
                <span>Room: <strong>{mp.roomId}</strong></span>
                <span className="mp-role-badge">{mp.role}</span>
              </div>
              {mp.role === 'host' && (
                <p className="mp-hint">Select a game from the carousel and press Enter or click it to launch for all players.</p>
              )}
              {mp.role === 'guest' && (
                <p className="mp-hint">Waiting for the host to launch a game…</p>
              )}
              <button className="mp-leave-btn" onClick={mp.leaveRoom}>
                <i className="fas fa-sign-out-alt"></i> Leave Room
              </button>
            </div>
          ) : (
            /* Not in a room */
            <>
              <div className="mp-section">
                <button
                  className="mp-host-btn"
                  onClick={mp.hostRoom}
                  disabled={mp.serverStatus !== 'online'}
                >
                  <i className="fas fa-crown"></i> Host Room
                </button>
                {mp.serverStatus !== 'online' && (
                  <p className="mp-hint">Ping the server first to enable hosting.</p>
                )}
              </div>

              <div className="mp-section mp-divider">
                <label className="mp-label">Join a Room</label>
                <div className="mp-join-row">
                  <input
                    className="mp-input mp-room-input"
                    placeholder="6-digit Room ID"
                    value={mp.joinInput}
                    onChange={e => mp.setJoinInput(e.target.value.replace(/\D/g,'').slice(0,6))}
                    maxLength={6}
                  />
                  <button
                    className="mp-join-btn"
                    onClick={mp.joinRoom}
                    disabled={mp.joinInput.length !== 6}
                  >
                    <i className="fas fa-sign-in-alt"></i> Join
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="games-carousel-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        accept=".nes,.fds,.unf,.unif,.sfc,.smc,.fig,.swc,.bs,.st,.z64,.v64,.n64,.ndd,.gba,.gb,.gbc,.nds,.vb,.vboy,.md,.gen,.smd,.sms,.gg,.32x,.cdi,.gdi,.cue,.bin,.img,.chd,.pbp,.mdf,.toc,.cbn,.m3u,.iso,.cso,.a26,.a52,.a78,.lnx,.j64,.jag,.pce,.ngp,.ngc,.ws,.wsc,.col,.vec,.gam,.rom,.mx1,.mx2,.dsk,.cas,.wad,.iwad,.pwad,.abs,.cof,.prg,.zip,.7z"
        onChange={handleFolderSelect}
        style={{ display: 'none' }}
      />

      <EmulatorFrame />
      <MultiplayerMenu />

      {showFolderSelector ? (
        <div className="folder-selector-screen">
          <div className="folder-selector-content">
            <div className="folder-icon"><i className="fas fa-folder-open"></i></div>
            <h1 className="selector-title">Select the folder with games</h1>
            <p className="selector-description">
              Select the folder containing your game files. The system will automatically detect consoles and sort games by format.
            </p>
            <button className="select-folder-btn" onClick={handleSelectFolderClick}>
              <i className="fas fa-folder"></i> Select folder
            </button>
            <div className="supported-info">
              <h3>Supported formats:</h3>
              <div className="formats-grid">
                <div className="format-category"><h4>Nintendo (NES)</h4><div className="format-list">.nes .fds .unf .zip</div></div>
                <div className="format-category"><h4>Super Nintendo</h4><div className="format-list">.sfc .smc .fig .swc .zip</div></div>
                <div className="format-category"><h4>Nintendo 64</h4><div className="format-list">.z64 .v64 .n64 .ndd .zip</div></div>
                <div className="format-category"><h4>Game Boy / GBC</h4><div className="format-list">.gb .gbc .zip</div></div>
                <div className="format-category"><h4>Game Boy Advance</h4><div className="format-list">.gba .zip .7z</div></div>
                <div className="format-category"><h4>Nintendo DS</h4><div className="format-list">.nds .zip</div></div>
                <div className="format-category"><h4>Virtual Boy</h4><div className="format-list">.vb .vboy .zip</div></div>
                <div className="format-category"><h4>Sega Genesis / MD</h4><div className="format-list">.md .gen .smd .bin .zip</div></div>
                <div className="format-category"><h4>Sega Master System</h4><div className="format-list">.sms .zip</div></div>
                <div className="format-category"><h4>Sega Game Gear</h4><div className="format-list">.gg .zip</div></div>
                <div className="format-category"><h4>Sega CD / MegaCD</h4><div className="format-list">.chd .cue .iso .bin</div></div>
                <div className="format-category"><h4>Sega 32X</h4><div className="format-list">.32x .zip</div></div>
                <div className="format-category"><h4>Sega Saturn</h4><div className="format-list">.chd .cue .iso .mdf .zip</div></div>
                <div className="format-category"><h4>Sega Dreamcast</h4><div className="format-list">.cdi .gdi .chd .iso</div></div>
                <div className="format-category"><h4>PlayStation 1</h4><div className="format-list">.cue .bin .img .chd .pbp .m3u</div></div>
                <div className="format-category"><h4>PlayStation 2</h4><div className="format-list">.iso .chd .bin .img</div></div>
                <div className="format-category"><h4>PlayStation Portable</h4><div className="format-list">.iso .cso .pbp .chd</div></div>
                <div className="format-category"><h4>Atari 2600</h4><div className="format-list">.a26 .bin .zip</div></div>
                <div className="format-category"><h4>Atari 5200</h4><div className="format-list">.a52 .bin .zip</div></div>
                <div className="format-category"><h4>Atari 7800</h4><div className="format-list">.a78 .bin .zip</div></div>
                <div className="format-category"><h4>Atari Lynx</h4><div className="format-list">.lnx .zip</div></div>
                <div className="format-category"><h4>Atari Jaguar</h4><div className="format-list">.j64 .jag .abs .cof .zip</div></div>
                <div className="format-category"><h4>PC Engine / TurboGrafx</h4><div className="format-list">.pce .zip</div></div>
                <div className="format-category"><h4>PC Engine CD</h4><div className="format-list">.chd .cue .iso</div></div>
                <div className="format-category"><h4>PC-FX</h4><div className="format-list">.chd .cue .toc .ccd</div></div>
                <div className="format-category"><h4>Neo Geo Pocket</h4><div className="format-list">.ngp .ngc .zip</div></div>
                <div className="format-category"><h4>Neo Geo AES / MVS</h4><div className="format-list">.zip .7z</div></div>
                <div className="format-category"><h4>Arcade (MAME)</h4><div className="format-list">.zip .7z .chd</div></div>
                <div className="format-category"><h4>WonderSwan</h4><div className="format-list">.ws .wsc .zip</div></div>
                <div className="format-category"><h4>ColecoVision</h4><div className="format-list">.col .bin .rom .zip</div></div>
                <div className="format-category"><h4>Vectrex</h4><div className="format-list">.vec .gam .bin .zip</div></div>
                <div className="format-category"><h4>MSX / MSX2</h4><div className="format-list">.rom .mx1 .mx2 .dsk .cas .zip</div></div>
                <div className="format-category"><h4>DOOM (PrBoom)</h4><div className="format-list">.wad .iwad .pwad</div></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Consoles panel ── */}
          <div className="carousel-panel consoles-panel">
            <div className="panel-header">
              <h2 className="panel-title">Consoles</h2>
              <div className="panel-subtitle">{consoles.length} found • Arrows ↑ ↓</div>
            </div>
            <div className="carousel-container vertical">
              <div className="carousel-track">
                {consoles.map((c, index) => (
                  <div
                    key={c.id}
                    className={`carousel-slide ${selectedConsole === index ? 'active' : ''} ${selectedConsole === index - 1 ? 'prev' : ''} ${selectedConsole === index + 1 ? 'next' : ''}`}
                    onClick={() => { setSelectedConsole(index); setSelectedGame(0); }}
                  >
                    <div className="slide-content">
                      <div className="square-icon" style={{ color: c.color }}><i className={c.icon}></i></div>
                      <div className="slide-info">
                        <div className="slide-title">{c.name}</div>
                        <div className="slide-count"><i className="fas fa-gamepad"></i> {c.games.length} games</div>
                        <div className="console-stats">
                          <span className="stat-item"><i className="fas fa-file"></i> {c.fileExtensions.slice(0,2).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="carousel-indicator">
              {consoles.map((_, index) => (
                <div key={index} className={`indicator-dot ${selectedConsole === index ? 'active' : ''}`}
                  onClick={() => { setSelectedConsole(index); setSelectedGame(0); }} />
              ))}
            </div>
          </div>

          {/* ── Left controls (folder + multiplayer) ── */}
          <div className="folder-controls-left">
            <div className="folder-buttons-left">
              <button className="folder-btn change-btn" onClick={handleResetLibrary} title="Select another folder">
                <i className="fas fa-exchange-alt"></i>
              </button>

              <button className="folder-btn server-btn" onClick={() => window.open('https://www.emulatorjs.com/', '_blank')} title="Open EmulatorJS">
                <i className="fas fa-external-link-alt"></i>
              </button>

              {/* ── GLOBE / MULTIPLAYER BUTTON ── */}
              <button
                className={`folder-btn globe-btn ${mp.role ? 'globe-btn--active' : ''}`}
                onClick={() => { mp.setMenuOpen(true); if (mp.serverStatus === 'idle') mp.checkServer(); }}
                title={mp.role ? `Room: ${mp.roomId}` : 'Multiplayer'}
              >
                <i className="fas fa-globe"></i>
                {mp.role && <span className="globe-room-badge">{mp.roomId}</span>}
              </button>
            </div>
          </div>

          {/* ── Games panel ── */}
          <div className="carousel-panel games-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <span className="console-name" style={{ color: consoles[selectedConsole]?.color }}>
                  {consoles[selectedConsole]?.name}
                </span>
                <span className="games-count">({consoles[selectedConsole]?.games.length || 0} games)</span>
              </h2>
              <div className="panel-subtitle">
                Arrows ↑ ↓ to select • Enter to run
                {mp.role === 'host' && <span className="mp-hosting-hint"> • Hosting Room {mp.roomId}</span>}
              </div>
            </div>
            <div className="carousel-container vertical">
              <div className="carousel-track">
                {consoles[selectedConsole]?.games.length > 0 ? (
                  consoles[selectedConsole].games.map((game, index) => (
                    <div
                      key={game.id}
                      className={`carousel-slide ${selectedGame === index ? 'active' : ''} ${selectedGame === index - 1 ? 'prev' : ''} ${selectedGame === index + 1 ? 'next' : ''}`}
                      onClick={() => { setSelectedGame(index); handleGameClick(game); }}
                    >
                      <div className="slide-content">
                        <div className="square-icon" style={{ color: consoles[selectedConsole]?.color }}>
                          <i className={consoles[selectedConsole]?.icon}></i>
                        </div>
                        <div className="slide-info">
                          <div className="slide-title">{game.name}</div>
                          <div className="slide-time"><i className="fas fa-clock"></i> Not played</div>
                          <div className="game-details">
                            <div className="game-meta">
                              <span className="game-file"><i className="fas fa-file"></i> {game.fileName}</span>
                              <span className="game-size"><i className="fas fa-hdd"></i> {game.fileSize}</span>
                              <span className="game-date"><i className="fas fa-calendar"></i> {game.uploadDate}</span>
                            </div>
                            <div className="game-platform">
                              <i className={consoles[selectedConsole]?.icon}></i>
                              <span>{consoles[selectedConsole]?.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-games-message">
                    <div className="empty-icon"><i className="fas fa-gamepad"></i></div>
                    <h3>There are no games on this console.</h3>
                    <p>No games found for {consoles[selectedConsole]?.name}</p>
                  </div>
                )}
              </div>
            </div>
            {consoles[selectedConsole]?.games.length > 0 && (
              <div className="carousel-indicator">
                {consoles[selectedConsole]?.games.map((_, index) => (
                  <div key={index} className={`indicator-dot ${selectedGame === index ? 'active' : ''}`}
                    onClick={() => setSelectedGame(index)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            Scanning folder…
            <div className="loading-subtext">Identifying consoles and sorting games</div>
          </div>
        </div>
      )}

      {/* ── Multiplayer menu CSS (injected inline to avoid touching .css file) ── */}
      <style>{`
        /* Globe button */
        .globe-btn { position: relative; }
        .globe-btn--active { color: #1AD6FF !important; border-color: #1AD6FF !important; box-shadow: 0 0 8px #1AD6FF55; }
        .globe-room-badge {
          position: absolute; top: -6px; right: -6px;
          background: #1AD6FF; color: #000; font-size: 9px; font-weight: 700;
          padding: 1px 4px; border-radius: 6px; letter-spacing: 0.5px; white-space: nowrap;
        }

        /* Overlay */
        .mp-menu-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
        }
        .mp-menu {
          background: #0f1923; border: 1px solid #1e3045;
          border-radius: 14px; padding: 0; width: 360px; max-width: 95vw;
          box-shadow: 0 24px 64px rgba(0,0,0,0.7);
          font-family: inherit; color: #cde;
          overflow: hidden;
        }
        .mp-menu-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px; background: #0a1520;
          border-bottom: 1px solid #1e3045; font-size: 1rem; font-weight: 600;
        }
        .mp-menu-header i { color: #1AD6FF; font-size: 1.1rem; }
        .mp-close-btn {
          margin-left: auto; background: none; border: none; color: #88a;
          cursor: pointer; font-size: 1rem; padding: 2px 6px;
          transition: color .2s;
        }
        .mp-close-btn:hover { color: #fff; }

        .mp-section { padding: 14px 20px; border-bottom: 1px solid #1a2d42; }
        .mp-section:last-child { border-bottom: none; }
        .mp-label { display: block; font-size: 0.72rem; color: #7a9ab8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 7px; }

        /* Server row */
        .mp-server-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .mp-server-label { font-size: 0.85rem; color: #aac; }
        .mp-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .mp-status-text { font-size: 0.78rem; font-weight: 600; }
        .mp-ping-btn {
          margin-left: auto; background: #1a2d42; border: 1px solid #2a4060; color: #7ab;
          border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; cursor: pointer;
          transition: background .2s;
        }
        .mp-ping-btn:hover { background: #223d58; }
        .mp-server-url { font-size: 0.7rem; color: #4a7090; margin-top: 5px; word-break: break-all; }

        /* Inputs */
        .mp-input {
          width: 100%; background: #0a1520; border: 1px solid #1e3045; border-radius: 7px;
          color: #cde; font-size: 0.9rem; padding: 8px 12px; outline: none; box-sizing: border-box;
          transition: border-color .2s;
        }
        .mp-input:focus { border-color: #1AD6FF; }
        .mp-input:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Buttons */
        .mp-host-btn, .mp-join-btn, .mp-leave-btn {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          width: 100%; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem;
          font-weight: 600; cursor: pointer; border: none; transition: opacity .2s, transform .1s;
        }
        .mp-host-btn { background: linear-gradient(135deg, #1AD6FF, #0095cc); color: #000; }
        .mp-host-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .mp-join-btn { background: #1e3045; color: #1AD6FF; border: 1px solid #1AD6FF; flex: none; width: auto; padding: 8px 14px; }
        .mp-join-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .mp-leave-btn { background: #2a1020; color: #f66; border: 1px solid #5a2030; margin-top: 8px; }

        .mp-host-btn:not(:disabled):hover, .mp-join-btn:not(:disabled):hover, .mp-leave-btn:hover { opacity: 0.85; transform: translateY(-1px); }

        /* Join row */
        .mp-join-row { display: flex; gap: 8px; align-items: center; }
        .mp-room-input { flex: 1; letter-spacing: 3px; font-size: 1.1rem !important; text-align: center; }
        .mp-divider { margin-top: 0; }

        /* In-room */
        .mp-in-room {}
        .mp-room-display {
          display: flex; align-items: center; gap: 10px;
          background: #0a1520; border: 1px solid #1e3045; border-radius: 8px;
          padding: 10px 14px; font-size: 1rem;
        }
        .mp-room-display i { color: #1AD6FF; }
        .mp-room-display strong { color: #fff; letter-spacing: 2px; }
        .mp-role-badge {
          margin-left: auto; background: #1a3a20; color: #4caf50;
          font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 10px;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .mp-hint { font-size: 0.78rem; color: #6a8aaa; margin: 8px 0 0; line-height: 1.5; }

        /* Emulator room badge */
        .emulator-room-badge {
          margin-left: 14px; background: #0a2a3a; border: 1px solid #1AD6FF;
          color: #1AD6FF; font-size: 0.75rem; padding: 2px 10px; border-radius: 10px;
          font-weight: 600; letter-spacing: 1px;
        }
        .emulator-room-badge i { margin-right: 5px; }

        /* Hosting hint in panel subtitle */
        .mp-hosting-hint { color: #1AD6FF; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default GamesCarousel;