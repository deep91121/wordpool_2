/**
 * EndGameOverlay — bottom sheet shown when a game ends
 *
 * Uses one accent color (primary) plus neutral surfaces and a single
 * destructive red reserved only for losses/errors — not a rainbow of
 * one-off accent hues.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy, TrendingUp, Flame } from "lucide-react";
import type { DictionaryEntry } from "@/lib/dictionary";
import type { GameStats } from "@/lib/stats";

interface EndGameOverlayProps {
  gameWon: boolean;
  targetWord: DictionaryEntry;
  stats: GameStats;
  attemptsUsed: number;
  onNewGame: () => void;
}

export function EndGameOverlay({
  gameWon,
  targetWord,
  stats,
  attemptsUsed,
  onNewGame,
}: EndGameOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const overlay = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onNewGame}
      />

      {/* Bottom Sheet */}
      <div
        className={`relative w-full max-w-md bg-background rounded-t-3xl transition-transform duration-300 ${
          mounted ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-primary/30 rounded-full" />
        </div>

        <div className="px-6 pb-6">
          {/* Win/Loss Header */}
          <div className="text-center mb-5">
            {gameWon ? (
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy size={24} className="text-primary" />
                <span className="font-display font-bold text-xl text-primary">
                  You Won!
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-display font-bold text-xl text-destructive">
                  Game Over
                </span>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {gameWon
                ? `Solved in ${attemptsUsed} attempt${attemptsUsed > 1 ? "s" : ""}`
                : "Better luck next time!"}
            </p>
          </div>

          {/* Target Word Card */}
          <div className="bg-card rounded-2xl p-5 mb-4">
            {/* Word tiles */}
            <div className="flex items-center justify-center gap-1 mb-3 flex-wrap">
              {targetWord.word.split("").map((letter, i) => (
                <div
                  key={i}
                  className={`w-9 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
                    gameWon ? "bg-primary text-primary-foreground" : "bg-tile-absent text-white/90"
                  }`}
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Category & Difficulty */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-display font-semibold">
                {targetWord.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {targetWord.difficulty}
              </span>
            </div>

            {/* Definition */}
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {targetWord.definition}
            </p>
          </div>

          {/* Statistics Summary */}
          <div className="bg-accent/50 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <span className="font-display font-semibold text-sm text-primary">
                Your Statistics
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-foreground">
                  {stats.gamesPlayed}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Played
                </div>
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-primary">
                  {stats.winPercentage}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Win Rate
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame size={14} className="text-primary" />
                  <span className="font-display font-bold text-2xl text-foreground">
                    {stats.currentWinStreak}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Streak
                </div>
              </div>
            </div>

            {/* Win progress bar */}
            <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${stats.winPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">{stats.wins} wins</span>
              <span className="text-[10px] text-muted-foreground">{stats.losses} losses</span>
            </div>
          </div>

          {/* Play Again Button */}
          <button
            onClick={onNewGame}
            className="w-full h-13 bg-primary text-primary-foreground rounded-full font-display font-bold text-base
              active:scale-[0.97] transition-transform duration-150"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );

  // Render via portal to escape the overflow:hidden game-container
  return createPortal(overlay, document.body);
}
