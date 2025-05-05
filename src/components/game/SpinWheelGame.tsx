import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useWallet } from '../../contexts/WalletContext';
import { Rotate3D as Rotate, Timer, Clock, Trophy, ChevronsUp, AlertCircle } from 'lucide-react';
import Confetti from 'react-confetti';

// Define wheel segments (should match the reward probabilities in the store)
const segments = [
  { value: 'sol', label: '0.05 SOL', color: '#14F195' },
  { value: 'sol', label: '0.1 SOL', color: '#14F195' },
  { value: 'usdt', label: '1 USDT', color: '#2775CA' },
  { value: 'usdt', label: '3 USDT', color: '#2775CA' },
  { value: 'usdt', label: '5 USDT', color: '#2775CA' },
  { value: 'nft', label: 'NFT Boost', color: '#9945FF' },
  { value: 'scratchcard', label: 'Scratch Card', color: '#FF9C2A' },
  { value: 'replay', label: 'Replay', color: '#DB2777' },
];

const SpinWheelGame: React.FC = () => {
  const { connected } = useWallet();
  const { 
    performSpin, 
    canSpin, 
    timeUntilNextSpin, 
    streakDays,
    totalSpins
  } = useGameStore();
  
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [reward, setReward] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Format the remaining time until next spin
  useEffect(() => {
    if (!canSpin()) {
      const interval = setInterval(() => {
        const timeRemaining = timeUntilNextSpin();
        if (timeRemaining <= 0) {
          clearInterval(interval);
          setTimeLeft('');
          return;
        }
        
        // Format time remaining
        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setTimeLeft('');
    }
  }, [canSpin, timeUntilNextSpin]);
  
  const handleSpin = () => {
    if (!connected) {
      document.getElementById('wallet-modal')?.classList.remove('hidden');
      return;
    }
    
    if (!canSpin() || spinning) {
      return;
    }
    
    setSpinning(true);
    setSpinResult(null);
    
    // Calculate a random destination between 5-15 full rotations + segment position
    const spinDuration = 5000; // 5 seconds
    const minRotations = 5;
    const maxRotations = 15;
    const randomRotations = minRotations + Math.random() * (maxRotations - minRotations);
    
    // Calculate random segment position
    const segmentIndex = Math.floor(Math.random() * segments.length);
    const segmentAngle = (360 / segments.length) * segmentIndex;
    
    // For smoother animation, continue from current rotation rather than resetting
    const destinationAngle = rotation + (randomRotations * 360) + segmentAngle;
    
    // Start spinning animation
    setRotation(destinationAngle);
    
    // Wait for animation to complete
    setTimeout(() => {
      try {
        const result = performSpin();
        setReward(result);
        setSpinResult(result.type);
        setShowConfetti(result.type !== 'replay');
        
        // Hide confetti after a few seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } catch (error) {
        console.error('Error performing spin:', error);
      } finally {
        setSpinning(false);
      }
    }, spinDuration);
  };
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Confetti animation for wins */}
      {showConfetti && (
        <Confetti 
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      {/* Spin stats */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 w-full">
        <div className="bg-slate-800/60 rounded-lg p-4 flex items-center">
          <Clock size={20} className="text-purple-400 mr-2" />
          <div>
            <p className="text-sm text-slate-400">Next Spin</p>
            <p className="font-medium">
              {canSpin() ? (
                <span className="text-green-400">Available Now!</span>
              ) : (
                <span className="text-orange-400">{timeLeft}</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="bg-slate-800/60 rounded-lg p-4 flex items-center">
          <Trophy size={20} className="text-purple-400 mr-2" />
          <div>
            <p className="text-sm text-slate-400">Streak</p>
            <p className="font-medium flex items-center">
              <span className="text-yellow-400">{streakDays} days</span>
              {streakDays > 0 && <ChevronsUp className="text-green-400 ml-1" size={16} />}
            </p>
          </div>
        </div>
        
        <div className="bg-slate-800/60 rounded-lg p-4 flex items-center">
          <Rotate size={20} className="text-purple-400 mr-2" />
          <div>
            <p className="text-sm text-slate-400">Total Spins</p>
            <p className="font-medium text-teal-400">{totalSpins}</p>
          </div>
        </div>
      </div>
      
      {/* Spin wheel container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
        {/* Wheel segments */}
        <div
          ref={wheelRef}
          className="absolute inset-0 rounded-full overflow-hidden border-8 border-slate-700 shadow-[0_0_25px_rgba(153,69,255,0.5)] transition-transform duration-5000 ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '5s' : '0s',
          }}
        >
          {segments.map((segment, i) => {
            const angle = (360 / segments.length) * i;
            const skew = 90 - (360 / segments.length);
            
            return (
              <div
                key={i}
                className="absolute w-full h-full origin-bottom-left"
                style={{ transform: `rotate(${angle}deg) skew(${skew}deg)` }}
              >
                <div 
                  className="absolute w-full h-full flex justify-center items-center text-white font-bold text-sm"
                  style={{ 
                    background: segment.color,
                    transform: `skew(${-skew}deg) rotate(${45}deg)`,
                    transformOrigin: 'center'
                  }}
                >
                  <div style={{ transform: `rotate(${-angle - 45}deg)`, marginLeft: '90px' }}>
                    {segment.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center button */}
        <button
          onClick={handleSpin}
          disabled={spinning || (!canSpin() && connected)}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            w-20 h-20 rounded-full z-10 flex items-center justify-center 
            text-white font-bold shadow-lg transition-all
            ${spinning 
              ? 'bg-slate-600 cursor-not-allowed' 
              : canSpin() 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 cursor-pointer'
                : 'bg-slate-600 cursor-not-allowed'
            }`}
        >
          {spinning ? (
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <Rotate className="mr-1" size={20} />
              <span>SPIN</span>
            </>
          )}
        </button>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-500 z-20"></div>
      </div>
      
      {/* Result display */}
      {spinResult && (
        <div className="mt-8 w-full max-w-md bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 text-center animate-fadeIn">
          <h3 className="text-xl font-bold mb-2 text-white">
            {reward.name}
          </h3>
          <p className="text-slate-300 mb-4">
            {reward.description}
          </p>
          <div className={`p-4 rounded-lg mb-4 ${
            spinResult === 'sol' ? 'bg-green-900/50' : 
            spinResult === 'usdt' ? 'bg-blue-900/50' : 
            spinResult === 'nft' ? 'bg-purple-900/50' : 
            spinResult === 'scratchcard' ? 'bg-orange-900/50' : 'bg-pink-900/50'
          }`}>
            <div className="font-bold text-lg">
              {spinResult === 'sol' && (
                <span className="text-green-400">{reward.amount} SOL</span>
              )}
              {spinResult === 'usdt' && (
                <span className="text-blue-400">{reward.amount} USDT</span>
              )}
              {spinResult === 'nft' && (
                <span className="text-purple-400">NFT Booster</span>
              )}
              {spinResult === 'scratchcard' && (
                <span className="text-orange-400">Free Scratch Card</span>
              )}
              {spinResult === 'replay' && (
                <span className="text-pink-400">Replay Spin</span>
              )}
            </div>
          </div>
          
          {spinResult === 'replay' ? (
            <button
              onClick={handleSpin}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              <Rotate className="inline mr-2" size={16} />
              Use Replay Now
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/rewards'}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              View Rewards
            </button>
          )}
        </div>
      )}
      
      {/* Not connected warning */}
      {!connected && (
        <div className="mt-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg flex items-start max-w-md">
          <AlertCircle className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-amber-300 font-medium">Wallet Not Connected</p>
            <p className="text-amber-200/70 text-sm">
              Connect your wallet to spin the wheel and win rewards.
            </p>
            <button
              onClick={() => document.getElementById('wallet-modal')?.classList.remove('hidden')}
              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheelGame;