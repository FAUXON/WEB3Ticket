import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useWallet } from '../contexts/WalletContext';
import { ArrowDownToLine, ExternalLink, DollarSign, Ticket, Rotate3D, Filter, X, AlertCircle } from 'lucide-react';

type RewardType = 'all' | 'sol' | 'usdt' | 'nft' | 'scratchcard' | 'replay';

const Rewards: React.FC = () => {
  const { connected } = useWallet();
  const { rewards, claimReward } = useGameStore();
  const [filter, setFilter] = useState<RewardType>('all');
  
  // Sort rewards by timestamp (newest first)
  const sortedRewards = [...rewards].sort((a, b) => b.timestamp - a.timestamp);
  
  // Apply filter
  const filteredRewards = filter === 'all' 
    ? sortedRewards 
    : sortedRewards.filter(reward => reward.type === filter);
  
  const handleClaimReward = (id: string) => {
    if (!connected) {
      document.getElementById('wallet-modal')?.classList.remove('hidden');
      return;
    }
    
    claimReward(id);
  };
  
  // Group rewards by date
  const groupedRewards: Record<string, typeof sortedRewards> = {};
  
  filteredRewards.forEach(reward => {
    const date = new Date(reward.timestamp).toLocaleDateString();
    if (!groupedRewards[date]) {
      groupedRewards[date] = [];
    }
    groupedRewards[date].push(reward);
  });
  
  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Your Rewards</h1>
            <p className="text-slate-300">
              View and claim your earned rewards.
            </p>
          </div>
          
          {/* Filter buttons */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
              }`}
            >
              All Rewards
            </button>
            <button
              onClick={() => setFilter('sol')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'sol'
                  ? 'bg-green-900/70 text-green-200'
                  : 'bg-green-900/20 text-green-400/70 hover:bg-green-900/40 hover:text-green-300'
              }`}
            >
              SOL
            </button>
            <button
              onClick={() => setFilter('usdt')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'usdt'
                  ? 'bg-blue-900/70 text-blue-200'
                  : 'bg-blue-900/20 text-blue-400/70 hover:bg-blue-900/40 hover:text-blue-300'
              }`}
            >
              USDT
            </button>
            <button
              onClick={() => setFilter('nft')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'nft'
                  ? 'bg-purple-900/70 text-purple-200'
                  : 'bg-purple-900/20 text-purple-400/70 hover:bg-purple-900/40 hover:text-purple-300'
              }`}
            >
              NFT
            </button>
            <button
              onClick={() => setFilter('scratchcard')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'scratchcard'
                  ? 'bg-orange-900/70 text-orange-200'
                  : 'bg-orange-900/20 text-orange-400/70 hover:bg-orange-900/40 hover:text-orange-300'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setFilter('replay')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filter === 'replay'
                  ? 'bg-pink-900/70 text-pink-200'
                  : 'bg-pink-900/20 text-pink-400/70 hover:bg-pink-900/40 hover:text-pink-300'
              }`}
            >
              Replay
            </button>
          </div>
        </div>
        
        {/* Rewards list */}
        {rewards.length === 0 ? (
          <div className="bg-slate-800/70 rounded-xl p-8 text-center">
            <Filter size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-medium text-white mb-2">No Rewards Yet</h3>
            <p className="text-slate-400 mb-6">
              Spin the wheel or scratch cards to earn rewards.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a 
                href="/spin" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
                text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Spin the Wheel
              </a>
              <a 
                href="/scratch" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Scratch Cards
              </a>
            </div>
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="bg-slate-800/70 rounded-xl p-8 text-center">
            <Filter size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-medium text-white mb-2">No Matching Rewards</h3>
            <p className="text-slate-400 mb-4">
              There are no rewards matching your current filter.
            </p>
            <button
              onClick={() => setFilter('all')}
              className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Show All Rewards
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRewards).map(([date, dayRewards]) => (
              <div key={date} className="bg-slate-800/70 rounded-xl overflow-hidden">
                <div className="bg-slate-700/50 py-3 px-4">
                  <h3 className="font-medium text-white">{date}</h3>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {dayRewards.map((reward) => (
                    <div 
                      key={reward.id} 
                      className={`p-4 ${
                        reward.claimed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start mb-4 md:mb-0">
                          <div className={`p-2 rounded-lg mr-3 flex-shrink-0 ${
                            reward.type === 'sol' ? 'bg-green-900/30 text-green-400' :
                            reward.type === 'usdt' ? 'bg-blue-900/30 text-blue-400' :
                            reward.type === 'nft' ? 'bg-purple-900/30 text-purple-400' :
                            reward.type === 'scratchcard' ? 'bg-orange-900/30 text-orange-400' :
                            'bg-pink-900/30 text-pink-400'
                          }`}>
                            {reward.type === 'sol' && <DollarSign size={20} />}
                            {reward.type === 'usdt' && <DollarSign size={20} />}
                            {reward.type === 'nft' && <ExternalLink size={20} />}
                            {reward.type === 'scratchcard' && <Ticket size={20} />}
                            {reward.type === 'replay' && <Rotate3D size={20} />}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{reward.name}</h4>
                            <p className="text-slate-400 text-sm">{reward.description}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              {new Date(reward.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-9 md:ml-0">
                          {reward.claimed ? (
                            <span className="bg-slate-700 text-slate-400 text-sm py-1 px-3 rounded-full">
                              Claimed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimReward(reward.id)}
                              className={`flex items-center text-sm py-1.5 px-3 rounded-full font-medium ${
                                reward.type === 'sol' ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70' :
                                reward.type === 'usdt' ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70' :
                                reward.type === 'nft' ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900/70' :
                                reward.type === 'scratchcard' ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-900/70' :
                                'bg-pink-900/50 text-pink-300 hover:bg-pink-900/70'
                              }`}
                            >
                              <ArrowDownToLine size={14} className="mr-1" />
                              Claim Reward
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Not connected warning */}
        {!connected && (
          <div className="mt-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg flex items-start max-w-md">
            <AlertCircle className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-300 font-medium">Wallet Not Connected</p>
              <p className="text-amber-200/70 text-sm">
                Connect your wallet to claim your rewards.
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
    </div>
  );
};

export default Rewards;