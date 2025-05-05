import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../contexts/WalletContext";
import {
  Wallet,
  Award,
  BarChart4,
  Ticket,
  Rotate3D,
  Menu,
  X,
} from "lucide-react";

const Navbar: React.FC = () => {
  const { connected, address, balance } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const walletPopupRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const SOLORETH = address?.startsWith("0x") ? "ETH" : "SOL";
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";

  const navLinks = [
    { to: "/", label: "Dashboard", icon: <BarChart4 size={18} /> },
    { to: "/spin", label: "Spin Wheel", icon: <Rotate3D size={18} /> },
    { to: "/scratch", label: "Scratch Cards", icon: <Ticket size={18} /> },
    { to: "/rewards", label: "Rewards", icon: <Award size={18} /> },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletPopupRef.current &&
        !walletPopupRef.current.contains(event.target as Node)
      ) {
        setShowWalletPopup(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
    setTimeout(() => window.location.reload(), 500);
  };

  const renderWalletPopup = () => (
    <div
      ref={walletPopupRef}
      className="absolute right-0 mt-2 lg:top-14 w-full lg:w-72 bg-slate-900 border border-purple-700 text-white text-sm rounded-lg shadow-lg z-50 p-4"
    >
      <div className="mb-2">
        <strong>Adresse :</strong>
        <p className="break-all text-purple-300 text-xs">{address}</p>
      </div>
      <div className="mb-2">
        <strong>Solde :</strong> {balance.toFixed(5)} {SOLORETH}
      </div>
      <button
        onClick={handleLogout}
        className="w-full mt-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 px-3 rounded-md text-center"
      >
        Se déconnecter
      </button>
    </div>
  );

  return (
    <nav
      className={`fixed top-5 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-slate-900/90 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Rotate3D className="text-purple-400" size={28} />
          <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-teal-300 bg-clip-text text-transparent">
            SpinToEarn
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-4 text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center space-x-1 py-2 px-3 rounded-lg text-white"
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Wallet Desktop */}
        <div className="hidden lg:block relative">
          {connected ? (
            <div className="flex items-center space-x-3">
              <div className="bg-slate-800 rounded-full px-4 py-1.5 text-sm flex items-center">
                <Wallet size={14} className="mr-2 text-teal-400" />
                <span className="text-teal-300">
                  {balance.toFixed(5)} {SOLORETH}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWalletPopup((prev) => !prev);
                }}
                className="bg-slate-800 hover:bg-slate-700 transition px-4 py-1.5 text-sm rounded-full text-white border border-slate-700"
              >
                {truncatedAddress}
              </button>
              {showWalletPopup && renderWalletPopup()}
            </div>
          ) : (
            <button
              onClick={() =>
                document
                  .getElementById("wallet-modal")
                  ?.classList.remove("hidden")
              }
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-full transition-all"
            >
              <Wallet size={16} className="mr-2" /> Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Navigation Mobile */}
      <div
        className={`lg:hidden fixed inset-0 bg-slate-900/95 backdrop-blur-md transition-transform duration-300 shadow-lg ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setIsOpen(false)} className="text-white">
            <X size={30} />
          </button>
        </div>

        <div className="container mx-auto px-4 py-2 space-y-2">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center space-x-3 p-3 rounded-lg text-white"
              onClick={() => setIsOpen(false)}
            >
              {icon}
              <span className="font-medium">{label}</span>
            </Link>
          ))}

          {connected && (
            <div className="relative mt-4 p-3 bg-slate-800/60 rounded-lg">
              <button
                onClick={() => setShowWalletPopup((prev) => !prev)}
                className="bg-slate-800 hover:bg-slate-700 transition px-4 py-1.5 text-sm rounded-full text-white border border-slate-700 w-full"
              >
                {truncatedAddress}
              </button>
              {showWalletPopup && renderWalletPopup()}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
