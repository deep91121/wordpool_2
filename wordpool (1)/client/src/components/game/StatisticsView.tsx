/**
 * StatisticsView — full statistics modal
 *
 * One accent color (primary) + neutral surfaces, instead of a
 * different hue per stat card.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy, TrendingUp, Flame, Star, X } from "lucide-react";
import type { GameStats } from "@/lib/stats";

interface StatisticsViewProps {
  stats: GameStats;
  onClose: () => void;
}

export function StatisticsView({ stats, onClose }: StatisticsViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const overlay = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm bg-background rounded-3xl p-6 transition-all duration-300 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{ margin: "0 16px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={22} className="text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">Statistics</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            aria-label="Close statistics"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Games Played */}
          <div className="bg-card rounded-2xl p-4 text-center">
            <div className="font-display font-bold text-3xl text-foreground">
              {stats.gamesPlayed}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Games Played
            </div>
          </div>

          {/* Win Percentage */}
          <div className="bg-card rounded-2xl p-4 text-center">
            <div className="font-display font-bold text-3xl text-primary">
              {stats.winPercentage}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Win Rate
            </div>
          </div>

          {/* Wins */}
          <div className="bg-accent rounded-2xl p-4 text-center">
            <Trophy size={20} className="mx-auto mb-1 text-primary" />
            <div className="font-display font-bold text-2xl text-primary">
              {stats.wins}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Wins
            </div>
          </div>

          {/* Losses */}
          <div className="bg-destructive/10 rounded-2xl p-4 text-center">
            <span className="text-lg mx-auto mb-1 block text-destructive">✕</span>
            <div className="font-display font-bold text-2xl text-destructive">
              {stats.losses}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Losses
            </div>
          </div>
        </div>

        {/* Win Progress Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Win Progress</span>
            <span>{stats.winPercentage}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${stats.winPercentage}%` }}
            />
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Current Streak */}
          <div className="bg-card rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={18} className="text-primary" />
              <span className="font-display font-bold text-2xl text-foreground">
                {stats.currentWinStreak}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Current Streak
            </div>
          </div>

          {/* Best Streak */}
          <div className="bg-card rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={18} className="text-primary" />
              <span className="font-display font-bold text-2xl text-foreground">
                {stats.bestWinStreak}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Best Streak
            </div>
          </div>
        </div>

        {/* Best streak banner */}
        {stats.bestWinStreak >= 3 && (
          <div className="bg-accent rounded-xl p-3 text-center">
            <p className="text-sm font-display font-semibold text-primary">
              Best streak: {stats.bestWinStreak} games in a row!
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
