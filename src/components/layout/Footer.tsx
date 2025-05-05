import React from 'react';
import { Heart, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 py-8 mt-12 bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-teal-300 bg-clip-text text-transparent">
              SpinToEarn
            </h3>
            <p className="text-slate-300 mb-4 max-w-md">
              A Web3-based gamified application designed to offer users a simple and engaging 
              experience with real crypto rewards.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-slate-400 hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/spin" className="text-slate-400 hover:text-white transition-colors">
                  Spin Wheel
                </a>
              </li>
              <li>
                <a href="/scratch" className="text-slate-400 hover:text-white transition-colors">
                  Scratch Cards
                </a>
              </li>
              <li>
                <a href="/rewards" className="text-slate-400 hover:text-white transition-colors">
                  Rewards
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SpinToEarn. All rights reserved.
          </p>
          <p className="text-slate-400 text-sm flex items-center">
            Built with <Heart size={14} className="mx-1 text-red-500" /> by StackBlitz
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;