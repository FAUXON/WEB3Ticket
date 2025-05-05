import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useGameStore } from '../store/gameStore';
import { 
  Rotate3D, Ticket, Award, Clock, Trophy, ChevronsUp, 
  AlertCircle, ArrowRight, TrendingUp, Wallet, BarChart2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { connected, address, balance } = useWallet();
  const { 
    lastSpinTime, streakDays, canSpin, timeUntilNextSpin, 
    rewards, scratchCards, totalSpins
  } = useGameStore();
  
  const [timeLeft, setTimeLeft] = useState<string>('');
  
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
  
  // Calculate stats
  const unclaimedRewards = rewards.filter(r => !r.claimed);
  const totalRewardsValue = rewards.reduce((sum, reward) => {
    if (reward.type === 'sol' || reward.type === 'usdt') {
      return sum + (reward.amount || 0);
    }
    return sum;
  }, 0);
  const unrevealedCards = scratchCards.filter(card => !card.revealed);
  
  return (
    <div className="pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Hero section */}
        <div className="rounded-2xl overflow-hidden mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-900"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.pexels.com/photos/1587014/pexels-photo-1587014.jpeg?auto=compress&cs=tinysrgb&w=1260')]
            bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Spin, Scratch, Win Crypto!
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-2xl">
              Welcome to SpinToEarn, where you can win Solana, USDT, and other rewards daily.
              Connect your wallet to start earning!
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Link
                to="/spin"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
                text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center"
              >
                <Rotate3D size={18} className="mr-2" />
                Spin The Wheel
                {canSpin() && <span className="ml-2 text-xs bg-green-500 text-white py-0.5 px-2 rounded-full">Available!</span>}
              </Link>
              
              <Link
                to="/scratch"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center"
              >
                <Ticket size={18} className="mr-2" />
                Scratch Cards
                <span className="ml-2 text-xs bg-indigo-800 text-white py-0.5 px-2 rounded-full">
                  {unrevealedCards.length} Cards
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Account status */}
          <div className="bg-slate-800/70 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Wallet size={18} className="mr-2 text-teal-400" />
              Wallet Status
            </h2>
            
            {connected ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Address</span>
                  <span className="font-mono text-white text-sm">
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Balance</span>
                  <span className="font-medium text-teal-400">{balance.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Unclaimed Rewards</span>
                  <span className="font-medium text-purple-400">{unclaimedRewards.length}</span>
                </div>
                <button 
                  onClick={() => window.location.href = '/rewards'}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  View Rewards
                  <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
                <p className="text-slate-300 mb-4">Wallet not connected</p>
                <button
                  onClick={() => document.getElementById('wallet-modal')?.classList.remove('hidden')}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
          
          {/* Spin status */}
          <div className="bg-slate-800/70 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Rotate3D size={18} className="mr-2 text-purple-400" />
              Spin Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Next Spin</span>
                {canSpin() ? (
                  <span className="font-medium text-green-400">Available Now!</span>
                ) : (
                  <span className="font-medium text-amber-400">{timeLeft}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Daily Streak</span>
                <span className="font-medium text-yellow-400 flex items-center">
                  {streakDays} days
                  {streakDays > 0 && <ChevronsUp className="text-green-500 ml-1" size={16} />}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Total Spins</span>
                <span className="font-medium text-purple-400">{totalSpins}</span>
              </div>
              <Link 
                to="/spin"
                className={`w-full text-white py-2 rounded-lg flex items-center justify-center transition-colors ${
                  canSpin() 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {canSpin() ? 'Spin Now!' : 'View Spin'}
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Rewards summary */}
          <div className="bg-slate-800/70 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Award size={18} className="mr-2 text-teal-400" />
              Rewards Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Total Rewards</span>
                <span className="font-medium text-white">{rewards.length}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Total Value</span>
                <span className="font-medium text-green-400">${totalRewardsValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                <span className="text-slate-400">Scratch Cards</span>
                <span className="font-medium text-amber-400">{unrevealedCards.length} available</span>
              </div>
              <Link 
                to="/rewards"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                View All Rewards
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Game features */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-white">Game Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
              <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Rotate3D size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Spin Wheel</h3>
              <p className="text-slate-300 mb-4">
                Spin the wheel once every 24 hours for a chance to win Solana, USDT, 
                NFT boosters, scratch cards, or replay spins.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="bg-purple-500/20 p-1 rounded mr-2 mt-0.5">
                    <Clock size={14} className="text-purple-400" />
                  </span>
                  <span className="text-slate-300 text-sm">
                    Available once every 24 hours
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-500/20 p-1 rounded mr-2 mt-0.5">
                    <Trophy size={14} className="text-purple-400" />
                  </span>
                  <span className="text-slate-300 text-sm">
                    Maintain a streak for bonus rewards
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-500/20 p-1 rounded mr-2 mt-0.5">
                    <TrendingUp size={14} className="text-purple-400" />
                  </span>
                  <span className="text-slate-300 text-sm">
                    Random rewards with varying probabilities
                  </span>
                </li>
              </ul>
              <Link 
                to="/spin"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
              >
                Try Spinning
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-900/60 to-blue-900/60 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/30">
              <div className="bg-indigo-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Ticket size={24} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Scratch Cards</h3>
              <p className="text-slate-300 mb-4">
                Get free scratch cards or buy them with SOL. Scratch to reveal
                instant crypto rewards, bonus spins, or XP boosters.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="bg-indigo-500/20 p-1 rounded mr-2 mt-0.5">
                    <Award size={14} className="text-indigo-400" />
                  </span>
                  <span className="text-slate-300 text-sm">
                    Up to 3 free cards per week
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-indigo-500/20 p-1 rounded mr-2 mt-0.5">
                    <Wallet size={14} className="text-indigo-400" />
                  </span>
                  <span className="text-slate-300 text-sm">
                    Buy unlimited cards with SOL
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-indigo-500/20 p-1 rounded mr-2 mt-0.5">
                    <BarChart2 size={14} className="text-indigo-400" />
                  </span>
                  <span className="text-slate-300 text-sm">
                    Higher value rewards in paid cards
                  </span>
                </li>
              </ul>
              <Link 
                to="/scratch"
                className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Try Scratch Cards
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        {!connected && (
          <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 rounded-xl p-8 mb-10 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Ready to Start Earning?</h2>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Connect your Solana wallet to start spinning the wheel, collecting rewards,
              and experiencing the future of Web3 gaming.
            </p>
            <button
              onClick={() => document.getElementById('wallet-modal')?.classList.remove('hidden')}
              className="bg-white text-purple-900 hover:bg-slate-100 font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;