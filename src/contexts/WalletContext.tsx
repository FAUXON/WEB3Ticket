import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  balance: number;
  chainId: number | null;
  walletType: "phantom" | "metamask" | "trustwallet" | null;
  connectWallet: (
    type: "phantom" | "metamask" | "trustwallet"
  ) => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  address: null,
  balance: 0,
  chainId: null,
  walletType: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletType, setWalletType] = useState<
    "phantom" | "metamask" | "trustwallet" | null
  >(null);

  // Initialize wallet connection on load
  useEffect(() => {
    const savedWalletType = localStorage.getItem("walletType") as
      | "phantom"
      | "metamask"
      | "trustwallet"
      | null;
    if (savedWalletType) {
      connectWallet(savedWalletType).catch(console.error);
    }
  }, []);

  const connectPhantom = async () => {
    const { solana } = window as any;

    if (!solana?.isPhantom) {
      throw new Error("Please install Phantom wallet to continue");
    }

    try {
      const response = await solana.connect();
      const address = response.publicKey.toString();

      const connection = new Connection(
        "https://mainnet.helius-rpc.com/?api-key=d7276370-0068-486b-b709-0c1075dc7b08"
      );

      const balance = await connection.getBalance(new PublicKey(address));

      // Vérification du cluster : on veut juste vérifier que c’est bien le mainnet
      if (!connection.rpcEndpoint.includes("mainnet")) {
        throw new Error("You must be connected to Solana Mainnet.");
      }

      return {
        address,
        balance: balance / 1e9, // Conversion en SOL
        chainId: 101, // Mainnet
      };
    } catch (error) {
      console.error("Phantom connection failed:", error);
      throw new Error("Failed to connect or fetch balance.");
    }
  };

  const connectEVM = async (type: "metamask" | "trustwallet") => {
    const { ethereum } = window as any;

    if (!ethereum) {
      throw new Error(
        `Please install ${
          type === "metamask" ? "MetaMask" : "Trust Wallet"
        } to continue`
      );
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = Number(
      ethers.formatEther(await provider.getBalance(address))
    );
    const chainId = Number(await ethereum.request({ method: "eth_chainId" }));

    if (chainId !== 1) {
      // Vérifie si l'utilisateur est sur Ethereum mainnet
      throw new Error("Please switch to the Ethereum Mainnet.");
    }

    return { address, balance, chainId };
  };

  const connectWallet = async (
    type: "phantom" | "metamask" | "trustwallet"
  ) => {
    try {
      setConnecting(true);

      let walletData;
      if (type === "phantom") {
        walletData = await connectPhantom();
      } else {
        walletData = await connectEVM(type);
      }

      setConnected(true);
      setAddress(walletData.address);
      setBalance(walletData.balance);
      setChainId(walletData.chainId);
      setWalletType(type);

      localStorage.setItem("walletType", type);
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAddress(null);
    setBalance(0);
    setChainId(null);
    setWalletType(null);
    localStorage.removeItem("walletType");
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        address,
        balance,
        chainId,
        walletType,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
