import React, { useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import {
  Wallet,
  X,
  LogOut,
  ArrowDownToLine,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const WalletConnect: React.FC = () => {
  const {
    connected,
    connecting,
    address,
    balance,
    chainId,
    walletType,
    connectWallet,
    disconnectWallet,
  } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (
    type: "phantom" | "metamask" | "trustwallet"
  ) => {
    try {
      setError(null);
      await connectWallet(type);
      closeModal();
    } catch (error: any) {
      // Handle specific error messages
      if (error.message.includes("install")) {
        const walletName = type.charAt(0).toUpperCase() + type.slice(1);
        setError(`${error.message}. Click here to install ${walletName}`);
      } else if (error.message.includes("rejected")) {
        setError(error.message);
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    }
  };

  const closeModal = () => {
    document.getElementById("wallet-modal")?.classList.add("hidden");
    setError(null);
  };

  const handleErrorClick = (type: "phantom" | "metamask" | "trustwallet") => {
    if (error?.includes("install")) {
      const urls = {
        phantom: "https://phantom.app/",
        metamask: "https://metamask.io/download/",
        trustwallet: "https://trustwallet.com/download",
      };
      window.open(urls[type], "_blank");
    }
  };

  const getChainName = () => {
    if (!chainId) return "";

    // Solana
    if (chainId === 101) return "Solana";
    if (chainId === 102) return "Solana Devnet";
    if (chainId === 103) return "Solana Testnet";

    // EVM
    if (chainId === 1) return "Ethereum";
    if (chainId === 56) return "BNB Chain";
    if (chainId === 137) return "Polygon";

    return `Chain #${chainId}`;
  };

  return (
    <div
      id="wallet-modal"
      className="fixed inset-0 z-50 flex items-center justify-center hidden"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-5 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Wallet size={20} className="mr-2" />
            {connected ? "Wallet Connected" : "Connect Wallet"}
          </h3>
          <button
            onClick={closeModal}
            className="text-slate-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {connected ? (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="mb-2 text-slate-400 text-sm">
                  Connected Wallet
                </div>
                <div className="font-mono text-white break-all">{address}</div>
                <div className="mt-2 text-sm text-slate-400">
                  {getChainName()}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <div className="mb-2 text-slate-400 text-sm">Balance</div>
                <div className="text-2xl font-bold text-teal-400">
                  {balance.toFixed(4)}{" "}
                  {walletType === "phantom" ? "SOL" : "ETH"}
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-lg transition-colors">
                  <ArrowDownToLine size={18} className="mr-2" />
                  Receive
                </button>
                <button className="flex-1 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-lg transition-colors">
                  <ExternalLink size={18} className="mr-2" />
                  Explorer
                </button>
              </div>

              <button
                onClick={disconnectWallet}
                className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-slate-300 mb-4">
                Connect your wallet to start spinning the wheel, collecting
                rewards, and tracking your progress.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleConnect("phantom")}
                  disabled={connecting}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-[#9945FF] to-[#8752F3] hover:from-[#8752F3] hover:to-[#7B46F3] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-70"
                >
                  <div className="flex items-center ">
                    <img
                      src="https://187760183-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MVOiF6Zqit57q_hxJYp%2Fuploads%2FHEjleywo9QOnfYebBPCZ%2FPhantom_SVG_Icon.svg?alt=media&token=71b80a0a-def7-4f98-ae70-5e0843fdaaec"
                      alt="Phantom"
                      className="w-6 h-6 mr-3 rounded-[5px]"
                    />
                    <span>Phantom Wallet</span>
                  </div>
                  <span className="text-white text-sm">Solana</span>
                </button>

                <button
                  onClick={() => handleConnect("metamask")}
                  disabled={connecting}
                  className="w-full flex items-center justify-between bg-[#F6851B] hover:bg-[#E2761B] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-70"
                >
                  <div className="flex items-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                      alt="MetaMask"
                      className="w-6 h-6 mr-3"
                    />
                    <span>MetaMask</span>
                  </div>
                  <span className="text-white text-sm">Ethereum</span>
                </button>

                <button
                  onClick={() => handleConnect("trustwallet")}
                  disabled={connecting}
                  className="w-full flex items-center justify-between bg-[#3375BB] hover:bg-[#2D68A8] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-70"
                >
                  <div className="flex items-center">
                    <img
                      src="https://99bitcoins.com/wp-content/uploads/2025/03/Trust-Wallet.jpg"
                      alt="Trust Wallet"
                      className="w-6 h-6 mr-3 rounded-[5px]"
                    />
                    <span>Trust Wallet</span>
                  </div>
                  <span className="text-white text-sm">Multi-Chain</span>
                </button>
              </div>

              {error && (
                <div
                  className="mt-4 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start cursor-pointer"
                  onClick={() =>
                    error.includes("install") &&
                    handleErrorClick(walletType || "phantom")
                  }
                >
                  <AlertCircle
                    className="text-red-500 mr-3 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-red-300 font-medium">Connection Error</p>
                    <p className="text-red-200/70 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-700 pt-4 mt-4 text-center">
                <p className="text-slate-400 text-sm">
                  By connecting your wallet, you agree to our <br />
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
