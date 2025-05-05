import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import SpinWheel from './pages/SpinWheel';
import ScratchCards from './pages/ScratchCards';
import Rewards from './pages/Rewards';
import Admin from './pages/Admin';
import WalletConnect from './components/wallet/WalletConnect';
import Footer from './components/layout/Footer';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/spin" element={<SpinWheel />} />
              <Route path="/scratch" element={<ScratchCards />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
          <WalletConnect />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;