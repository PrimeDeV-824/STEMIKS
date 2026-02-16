"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  soundEnabled: boolean;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  setCoins: (coins: number) => void;
  setXP: (xp: number) => void;
  toggleSound: () => void;
}

function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      coins: 100,
      streak: 0,
      soundEnabled: true,
      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount;
          return { xp: newXP, level: getLevelFromXP(newXP) };
        }),
      addCoins: (amount) =>
        set((state) => ({ coins: Math.max(0, state.coins + amount) })),
      setCoins: (coins) => set({ coins }),
      setXP: (xp) => set({ xp, level: getLevelFromXP(xp) }),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    { name: "stemiks-user-store" }
  )
);
