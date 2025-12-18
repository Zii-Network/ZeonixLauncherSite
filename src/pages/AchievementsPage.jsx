import React, { useState, useEffect } from 'react';
import RetroAchievementsService from '../services/RetroAchievementsService';

const AchievementsPage = () => {
    const [username, setUsername] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recentGames, setRecentGames] = useState([]);

    // Проверяем сохраненные данные при загрузке
    useEffect(() => {
        const savedUsername = localStorage.getItem('ra_username');
        const savedApiKey = localStorage.getItem('ra_apiKey');
        const savedProfile = localStorage.getItem('ra_userProfile');
        
        if (savedUsername && savedApiKey) {
            setUsername(savedUsername);
            setApiKey(savedApiKey);
            if (savedProfile) {
                setUserProfile(JSON.parse(savedProfile));
                setIsLoggedIn(true);
                fetchRecentGames(savedUsername, savedApiKey);
            }
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const profile = await RetroAchievementsService.fetchUserProfile(username, apiKey);
            
            if (profile) {
                setUserProfile(profile);
                setIsLoggedIn(true);
                
                // Сохраняем данные
                localStorage.setItem('ra_username', username);
                localStorage.setItem('ra_apiKey', apiKey);
                localStorage.setItem('ra_userProfile', JSON.stringify(profile));
                
                // Загружаем недавно сыгранные игры
                await fetchRecentGames(username, apiKey);
            }
        } catch (err) {
            setError('Login error. Check your login and API key.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ra_username');
        localStorage.removeItem('ra_apiKey');
        localStorage.removeItem('ra_userProfile');
        setUsername('');
        setApiKey('');
        setUserProfile(null);
        setIsLoggedIn(false);
        setRecentGames([]);
    };

    const fetchRecentGames = async (user, key) => {
        try {
            if (userProfile?.RecentlyPlayed) {
                const games = [];
                for (const game of userProfile.RecentlyPlayed.slice(0, 5)) {
                    try {
                        const details = await RetroAchievementsService.fetchGameDetails(
                            user, 
                            key, 
                            game.GameID
                        );
                        games.push({
                            id: game.GameID,
                            title: details.Title || 'Unknown Game',
                            lastPlayed: game.LastPlayed,
                            achievements: details.Achievements?.length || 0
                        });
                    } catch (err) {
                        console.error(`Error fetching game ${game.GameID}:`, err);
                    }
                }
                setRecentGames(games);
            }
        } catch (err) {
            console.error('Error fetching recent games:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="achievements-section">
            <h2>🏆 RetroAchievements</h2>
            
            {!isLoggedIn ? (
                <div className="login-container">
                    <h3>Login to RetroAchievements</h3>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="apiKey">API key:</label>
                            <input
                                type="password"
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                                required
                                disabled={loading}
                            />
                            <small>
                                The API key can be obtained from the{' '}
                                <a 
                                    href="https://retroachievements.org/controlpanel.php" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    RetroAchievements website.
                                </a>
                            </small>
                        </div>
                        
                        {error && <div className="error-message">{error}</div>}
                        
                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Login'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="profile-container">
                    <div className="profile-header">
                        <h3>👤 Profile: {userProfile.User}</h3>
                        <button onClick={handleLogout} className="logout-button">
                            Exit
                        </button>
                    </div>
                    
                    <div className="profile-info">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">Points</span>
                                <span className="stat-value">{userProfile.TotalPoints}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Rank</span>
                                <span className="stat-value">#{userProfile.Rank}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Contributions</span>
                                <span className="stat-value">{userProfile.ContribCount}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Member since</span>
                                <span className="stat-value">
                                    {formatDate(userProfile.MemberSince)}
                                </span>
                            </div>
                        </div>
                        
                        {userProfile.Motto && (
                            <div className="motto">
                                <strong>Motto:</strong> {userProfile.Motto}
                            </div>
                        )}
                        
                        {recentGames.length > 0 && (
                            <div className="recent-games">
                                <h4>Recently played:</h4>
                                <div className="games-list">
                                    {recentGames.map(game => (
                                        <div key={game.id} className="game-card">
                                            <div className="game-title">{game.title}</div>
                                            <div className="game-meta">
                                                <span>Achievements: {game.achievements}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsPage;