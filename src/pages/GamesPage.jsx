import React from 'react';
import GamesCarousel from '../components/GamesCarousel';

const GamesPage = () => {
  return (
    <div className="section active">
      <h2>Игры</h2>
      <GamesCarousel />
    </div>
  );
};

export default GamesPage;