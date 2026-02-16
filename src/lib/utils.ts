import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function getXPForNextLevel(level: number): number {
  return level * level * 100;
}

export function getXPProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  percentage: number;
} {
  const level = getLevelFromXP(xp);
  const current = xp - getXPForLevel(level);
  const needed = getXPForNextLevel(level) - getXPForLevel(level);
  const percentage = Math.min((current / needed) * 100, 100);
  return { level, current, needed, percentage };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
