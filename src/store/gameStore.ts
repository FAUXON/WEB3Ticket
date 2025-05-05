import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Reward {
  id: string;
  type: "sol" | "usdt" | "nft" | "scratchcard" | "replay";
  amount?: number;
  name: string;
  description: string;
  claimed: boolean;
  timestamp: number;
}

interface ScratchCard {
  id: string;
  revealed: boolean;
  reward: Reward | null;
}

interface GameState {
  // User stats
  lastSpinTime: number | null;
  streakDays: number;
  nextSpinAvailable: number | null;
  totalSpins: number;

  // Rewards
  rewards: Reward[];
  scratchCards: ScratchCard[];
  freeCardsThisWeek: number;

  // Game actions
  addReward: (reward: Omit<Reward, "id" | "claimed" | "timestamp">) => void;
  claimReward: (id: string) => void;
  performSpin: () => Reward;
  addScratchCard: (paid: boolean) => ScratchCard;
  revealScratchCard: (id: string) => Reward | null;
  resetFreeCards: () => void;

  // Time helpers
  canSpin: () => boolean;
  timeUntilNextSpin: () => number;

  // For development and testing
  resetGameState: () => void;
}

// Reward probabilities (would come from smart contract in production)
const REWARD_PROBABILITIES = {
  sol: 0.05, // 5% chance
  usdt: 0.1, // 10% chance
  nft: 0.05, // 5% chance
  scratchcard: 0.3, // 30% chance
  replay: 0.5, // 50% chance
};

// Helper to generate a random reward based on probabilities
const generateRandomReward = (): Omit<
  Reward,
  "id" | "claimed" | "timestamp"
> => {
  const rand = Math.random();
  let cumulative = 0;

  for (const [type, probability] of Object.entries(REWARD_PROBABILITIES)) {
    cumulative += probability;
    if (rand <= cumulative) {
      switch (type) {
        case "sol":
          const solAmount = parseFloat(
            (Math.random() * 0.02 + 0.001).toFixed(4)
          );
          return {
            type: "sol",
            amount: solAmount,
            name: `${solAmount} SOL`,
            description: `You won ${solAmount} SOL!`,
          };
        case "usdt":
          const usdtAmount = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
          return {
            type: "usdt",
            amount: usdtAmount,
            name: `${usdtAmount} USDT`,
            description: `You won ${usdtAmount} USDT!`,
          };
        case "nft":
          return {
            type: "nft",
            name: "NFT Booster",
            description:
              "Lucky Spinner NFT: Increases your next spin reward by 50%",
          };
        case "scratchcard":
          return {
            type: "scratchcard",
            name: "Scratch Card",
            description: "You won a free scratch card!",
          };
        case "replay":
          return {
            type: "replay",
            name: "Replay Spin",
            description: "Spin again without waiting for the cooldown!",
          };
      }
    }
  }

  // Fallback (should never reach here if probabilities sum to 1)
  return {
    type: "replay",
    name: "Replay Spin",
    description: "Spin again without waiting for the cooldown!",
  };
};

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      lastSpinTime: null,
      streakDays: 0,
      nextSpinAvailable: null,
      totalSpins: 0,
      rewards: [],
      scratchCards: [],
      freeCardsThisWeek: 0,

      // Actions
      addReward: (rewardData) =>
        set((state) => {
          const newReward: Reward = {
            ...rewardData,
            id: generateId(),
            claimed: false,
            timestamp: Date.now(),
          };

          // Handle special reward types
          if (rewardData.type === "scratchcard") {
            // Add a scratch card automatically
            get().addScratchCard(false);
          }

          return { rewards: [...state.rewards, newReward] };
        }),

      claimReward: (id) =>
        set((state) => ({
          rewards: state.rewards.map((reward) =>
            reward.id === id ? { ...reward, claimed: true } : reward
          ),
        })),

      performSpin: () => {
        const now = Date.now();
        const canSpin = get().canSpin();

        if (!canSpin && get().lastSpinTime !== null) {
          throw new Error("Spin not available yet");
        }

        // Check for streak
        const lastSpin = get().lastSpinTime;
        let newStreakDays = get().streakDays;

        if (lastSpin) {
          const lastSpinDate = new Date(lastSpin);
          const today = new Date(now);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          // If last spin was yesterday, increase streak
          if (lastSpinDate.toDateString() === yesterday.toDateString()) {
            newStreakDays += 1;
          }
          // If last spin was more than a day ago but not today, reset streak
          else if (lastSpinDate.toDateString() !== today.toDateString()) {
            newStreakDays = 1;
          }
        } else {
          // First spin ever
          newStreakDays = 1;
        }

        // Calculate next spin time (24 hours from now)
        const nextSpinTime = now + 24 * 60 * 60 * 1000;

        // Generate reward (with streak bonus in a real implementation)
        const reward = generateRandomReward();

        // Add the reward
        get().addReward(reward);

        // Update state
        set((state) => ({
          lastSpinTime: now,
          nextSpinAvailable: nextSpinTime,
          streakDays: newStreakDays,
          totalSpins: state.totalSpins + 1,
        }));

        return {
          ...reward,
          id: generateId(),
          claimed: false,
          timestamp: now,
        };
      },

      addScratchCard: (paid) => {
        // If not paid, check free card limit
        if (!paid && get().freeCardsThisWeek >= 3) {
          throw new Error("Weekly free scratch card limit reached");
        }

        // Create new scratch card
        const newCard: ScratchCard = {
          id: generateId(),
          revealed: false,
          reward: null,
        };

        // Update state
        set((state) => ({
          scratchCards: [...state.scratchCards, newCard],
          freeCardsThisWeek: paid
            ? state.freeCardsThisWeek
            : state.freeCardsThisWeek + 1,
        }));

        return newCard;
      },

      revealScratchCard: (id) => {
        // Find the card
        const card = get().scratchCards.find((card) => card.id === id);

        if (!card) {
          throw new Error("Scratch card not found");
        }

        if (card.revealed) {
          throw new Error("Card already revealed");
        }

        // Generate a reward (generally smaller than spin rewards)
        const reward: Reward = {
          id: generateId(),
          type: Math.random() > 0.5 ? "sol" : "usdt",
          amount:
            Math.random() > 0.5
              ? parseFloat((Math.random() * 0.02 + 0.002).toFixed(4)) // Entre 0.02 et 3.022 SOL
              : parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)), // Entre 0.760 et 6.60 USDT

          name: Math.random() > 0.5 ? "Small SOL Reward" : "Small USDT Reward",
          description: "You scratched a card and won!",
          claimed: false,
          timestamp: Date.now(),
        };

        // Update the card and add the reward
        set((state) => ({
          scratchCards: state.scratchCards.map((c) =>
            c.id === id ? { ...c, revealed: true, reward } : c
          ),
          rewards: [...state.rewards, reward],
        }));

        return reward;
      },

      resetFreeCards: () => set({ freeCardsThisWeek: 0 }),

      canSpin: () => {
        const { lastSpinTime, rewards } = get();

        // Check if user has never spun or if 24 hours have passed
        if (lastSpinTime === null) {
          return true;
        }

        // Check if user has a replay reward
        const hasReplay = rewards.some(
          (reward) => reward.type === "replay" && !reward.claimed
        );

        if (hasReplay) {
          return true;
        }

        // Check if 24 hours have passed since last spin
        const now = Date.now();
        const timePassed = now - lastSpinTime;
        return timePassed >= 24 * 60 * 60 * 1000;
      },

      timeUntilNextSpin: () => {
        const { lastSpinTime, rewards } = get();

        // If user has never spun or has a replay, they can spin now
        if (
          lastSpinTime === null ||
          rewards.some((r) => r.type === "replay" && !r.claimed)
        ) {
          return 0;
        }

        const now = Date.now();
        const nextSpinTime = lastSpinTime + 24 * 60 * 60 * 1000;

        if (now >= nextSpinTime) {
          return 0;
        }

        return nextSpinTime - now;
      },

      resetGameState: () =>
        set({
          lastSpinTime: null,
          streakDays: 0,
          nextSpinAvailable: null,
          totalSpins: 0,
          rewards: [],
          scratchCards: [],
          freeCardsThisWeek: 0,
        }),
    }),
    {
      name: "spintoearn-game-state",
    }
  )
);
