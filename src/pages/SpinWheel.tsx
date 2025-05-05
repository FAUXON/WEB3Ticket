import React from 'react';
import SpinWheelGame from '../components/game/SpinWheelGame';

const SpinWheel: React.FC = () => {
  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Spin & Win</h1>
          <p className="text-slate-300">
            Spin the wheel once every 24 hours to win Solana, USDT, and other rewards.
          </p>
        </div>
        
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <SpinWheelGame />
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;