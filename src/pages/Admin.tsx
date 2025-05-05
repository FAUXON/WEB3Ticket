import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  Settings, Users, BarChart3, ShieldAlert, DollarSign, 
  AlertCircle, Percent, Save, RefreshCw, ChevronRight, Lock
} from 'lucide-react';

const Admin: React.FC = () => {
  const { connected, address } = useWallet();
  
  // Mock admin address
  const adminAddress = 'So1ana3XnP7Zk8TmS...';
  
  // Mock reward probabilities
  const [probabilities, setProbabilities] = useState({
    sol: 5,       // 5%
    usdt: 10,     // 10%
    nft: 5,       // 5%
    scratchcard: 30, // 30%
    replay: 50     // 50%
  });
  
  // Mock user stats
  const userStats = {
    totalUsers: 4238,
    activeToday: 1432,
    totalSpins: 28965,
    totalScratchCards: 12487,
    totalRewardsPaid: 345.67
  };
  
  const [saving, setSaving] = useState(false);
  
  const handleProbabilityChange = (type: string, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    setProbabilities(prev => ({
      ...prev,
      [type]: numValue
    }));
  };
  
  const handleSave = () => {
    // Validate that probabilities sum to 100%
    const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      alert('Probabilities must sum to 100%');
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // In a real app, this would save to the blockchain/smart contract
      alert('Probabilities saved successfully');
    }, 1500);
  };
  
  // Check if user is admin
  const isAdmin = connected && address === adminAddress;
  
  return (
    <div className="pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
          <p className="text-slate-300">
            Manage rewards, probabilities, and view user statistics.
          </p>
        </div>
        
        {!connected ? (
          <div className="bg-slate-800/70 rounded-xl p-8 text-center">
            <Lock size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-medium text-white mb-2">Admin Access Required</h3>
            <p className="text-slate-400 mb-6">
              Please connect your wallet to access the admin dashboard.
            </p>
            <button
              onClick={() => document.getElementById('wallet-modal')?.classList.remove('hidden')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
              text-white font-medium py-2.5 px-6 rounded-lg transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="bg-slate-800/70 rounded-xl p-8 text-center">
            <ShieldAlert size={48} className="mx-auto mb-4 text-amber-500" />
            <h3 className="text-xl font-medium text-white mb-2">Access Denied</h3>
            <p className="text-slate-400 mb-4">
              Your wallet does not have admin privileges.
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Connected wallet: {address}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats overview */}
            <div className="md:col-span-3 bg-slate-800/70 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <BarChart3 size={18} className="mr-2 text-purple-400" />
                Platform Overview
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white">{userStats.totalUsers}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Active Today</p>
                  <p className="text-2xl font-bold text-green-400">{userStats.activeToday}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Total Spins</p>
                  <p className="text-2xl font-bold text-purple-400">{userStats.totalSpins}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Scratch Cards</p>
                  <p className="text-2xl font-bold text-orange-400">{userStats.totalScratchCards}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Rewards Paid</p>
                  <p className="text-2xl font-bold text-teal-400">${userStats.totalRewardsPaid}</p>
                </div>
              </div>
            </div>
            
            {/* Reward probabilities */}
            <div className="bg-slate-800/70 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Percent size={18} className="mr-2 text-purple-400" />
                Spin Wheel Probabilities
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span className="text-green-400">SOL Rewards</span>
                    <span className="text-slate-400">{probabilities.sol}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={probabilities.sol}
                    onChange={(e) => handleProbabilityChange('sol', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                  />
                </div>
                
                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span className="text-blue-400">USDT Rewards</span>
                    <span className="text-slate-400">{probabilities.usdt}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={probabilities.usdt}
                    onChange={(e) => handleProbabilityChange('usdt', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>
                
                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span className="text-purple-400">NFT Boosters</span>
                    <span className="text-slate-400">{probabilities.nft}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={probabilities.nft}
                    onChange={(e) => handleProbabilityChange('nft', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                  />
                </div>
                
                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span className="text-orange-400">Scratch Cards</span>
                    <span className="text-slate-400">{probabilities.scratchcard}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={probabilities.scratchcard}
                    onChange={(e) => handleProbabilityChange('scratchcard', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
                  />
                </div>
                
                <div>
                  <label className="flex justify-between text-sm mb-1">
                    <span className="text-pink-400">Replay Spins</span>
                    <span className="text-slate-400">{probabilities.replay}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={probabilities.replay}
                    onChange={(e) => handleProbabilityChange('replay', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500"
                  />
                </div>
                
                {/* Total indicator */}
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Total</span>
                    <span className={`font-bold ${
                      Object.values(probabilities).reduce((a, b) => a + b, 0) === 100
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {Object.values(probabilities).reduce((a, b) => a + b, 0)}%
                    </span>
                  </div>
                  
                  {Object.values(probabilities).reduce((a, b) => a + b, 0) !== 100 && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      Total must equal 100%
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={Object.values(probabilities).reduce((a, b) => a + b, 0) !== 100 || saving}
                  className={`w-full mt-2 py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors ${
                    Object.values(probabilities).reduce((a, b) => a + b, 0) === 100 && !saving
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Probabilities
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="bg-slate-800/70 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Settings size={18} className="mr-2 text-purple-400" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <DollarSign size={18} className="mr-2 text-green-400" />
                    <span>Adjust Payout Rates</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                
                <button className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Users size={18} className="mr-2 text-blue-400" />
                    <span>Manage Users</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                
                <button className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <BarChart3 size={18} className="mr-2 text-purple-400" />
                    <span>Analytics Dashboard</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
                
                <button className="w-full flex items-center justify-between bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <AlertCircle size={18} className="mr-2 text-amber-400" />
                    <span>System Alerts</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            {/* Recent activity */}
            <div className="md:col-span-3 bg-slate-800/70 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Users size={18} className="mr-2 text-purple-400" />
                Recent Activity
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="bg-slate-700/50 text-left">
                      <th className="py-3 px-4 font-medium text-slate-300">User</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Action</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Reward</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Value</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    <tr className="text-white">
                      <td className="py-3 px-4">So1ana3X...</td>
                      <td className="py-3 px-4">Spin</td>
                      <td className="py-3 px-4 text-green-400">0.15 SOL</td>
                      <td className="py-3 px-4">$3.75</td>
                      <td className="py-3 px-4 text-slate-400">5 min ago</td>
                    </tr>
                    <tr className="text-white">
                      <td className="py-3 px-4">So1ana8R...</td>
                      <td className="py-3 px-4">Scratch Card</td>
                      <td className="py-3 px-4 text-blue-400">2.5 USDT</td>
                      <td className="py-3 px-4">$2.50</td>
                      <td className="py-3 px-4 text-slate-400">12 min ago</td>
                    </tr>
                    <tr className="text-white">
                      <td className="py-3 px-4">So1ana5T...</td>
                      <td className="py-3 px-4">Spin</td>
                      <td className="py-3 px-4 text-pink-400">Replay</td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4 text-slate-400">18 min ago</td>
                    </tr>
                    <tr className="text-white">
                      <td className="py-3 px-4">So1ana9K...</td>
                      <td className="py-3 px-4">Spin</td>
                      <td className="py-3 px-4 text-orange-400">Scratch Card</td>
                      <td className="py-3 px-4">$1.00</td>
                      <td className="py-3 px-4 text-slate-400">23 min ago</td>
                    </tr>
                    <tr className="text-white">
                      <td className="py-3 px-4">So1ana2M...</td>
                      <td className="py-3 px-4">Buy Card</td>
                      <td className="py-3 px-4 text-green-400">0.08 SOL</td>
                      <td className="py-3 px-4">$2.00</td>
                      <td className="py-3 px-4 text-slate-400">32 min ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;