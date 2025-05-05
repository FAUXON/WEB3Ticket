import React from 'react';
import ScratchCardGame from '../components/game/ScratchCardGame';

const ScratchCards: React.FC = () => {
  return (
    <div className="pt-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Scratch Cards</h1>
          <p className="text-slate-300">
            Get free scratch cards or buy them with SOL. Scratch to reveal instant rewards.
          </p>
        </div>
        
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <ScratchCardGame />
        </div>
      </div>
    </div>
  );
};

export default ScratchCards;