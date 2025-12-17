class RetroAchievementsService {
    constructor() {
        this.baseUrl = 'https://retroachievements.org/API';
    }

    /**
     * 🏆 Получить профиль пользователя
     */
    async fetchUserProfile(username, apiKey) {
        try {
            const url = `${this.baseUrl}/API_GetUserProfile.php?u=${username}&y=${apiKey}`;
            console.log('UserProfile request URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('UserProfile raw response:', data);
            
            if (data && typeof data === 'object') {
                return data;
            } else {
                throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * 🎮 Получить детали игры
     */
    async fetchGameDetails(username, apiKey, gameId) {
        try {
            const url = `${this.baseUrl}/API_GetGame.php?i=${gameId}&u=${username}&y=${apiKey}`;
            console.log('GameDetails request URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('GameDetails raw response:', data);
            
            if (data && typeof data === 'object') {
                return data;
            } else {
                throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error('Error fetching game details:', error);
            throw error;
        }
    }

    /**
     * 📂 Найти gameId по хэшам ROM
     */
    async findGameIdsByHashes(username, apiKey, hashes) {
        try {
            console.log('findGameIdsByHashes: hashes=', hashes);
            // TODO: Реализовать реальный вызов API для сопоставления хэшей
            // Временная заглушка
            const result = {};
            hashes.forEach(hash => {
                result[hash] = -1;
            });
            return result;
        } catch (error) {
            console.error('Ошибка поиска игр по хэшу:', error);
            return {};
        }
    }
}

export default new RetroAchievementsService();