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