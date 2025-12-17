// models/RetroAchievementsProfile.js
class RetroAchievementsProfile {
    constructor(data) {
        this.User = data.User || '';
        this.MemberSince = data.MemberSince || '';
        this.RichPresenceMsg = data.RichPresenceMsg || '';
        this.LastGameID = data.LastGameID || 0;
        this.ContribCount = data.ContribCount || 0;
        this.ContribYield = data.ContribYield || 0;
        this.TotalPoints = data.TotalPoints || 0;
        this.TotalTruePoints = data.TotalTruePoints || 0;
        this.Permissions = data.Permissions || 0;
        this.Untracked = data.Untracked || false;
        this.ID = data.ID || 0;
        this.UserWallActive = data.UserWallActive || false;
        this.Motto = data.Motto || '';
        this.Rank = data.Rank || 0;
        this.RecentlyPlayed = data.RecentlyPlayed || [];
        this.Status = data.Status || '';
    }
}

export default RetroAchievementsProfile;

// models/GameDetailsDto.js
class GameDetailsDto {
    constructor(data) {
        this.Title = data.Title || '';
        this.ConsoleID = data.ConsoleID || 0;
        this.ForumTopicID = data.ForumTopicID || 0;
        this.Flags = data.Flags || 0;
        this.ImageIcon = data.ImageIcon || '';
        this.ImageTitle = data.ImageTitle || '';
        this.ImageIngame = data.ImageIngame || '';
        this.ImageBoxArt = data.ImageBoxArt || '';
        this.Publisher = data.Publisher || '';
        this.Developer = data.Developer || '';
        this.Genre = data.Genre || '';
        this.Released = data.Released || '';
        this.ID = data.ID || 0;
        this.Achievements = data.Achievements || [];
    }
}

export default GameDetailsDto;