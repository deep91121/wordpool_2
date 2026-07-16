/**
 * GameTopBar — Minimal top navigation bar
 *
 * Uses the shared theme tokens (card/accent/primary) instead of
 * one-off hex colors, so the whole app stays on a single palette.
 */

import { ArrowLeft, BarChart3 } from "lucide-react";

interface GameTopBarProps {
  difficultyLabel: string;
  timeFormatted: string;
  onBack: () => void;
  onShowStats: () => void;
}

export function GameTopBar({
  difficultyLabel,
  timeFormatted,
  onBack,
  onShowStats,
}: GameTopBarProps) {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border"
      style={{
        paddingTop: "max(12px, env(safe-area-inset-top, 12px))",
      }}
    >
      {/* Back Arrow */}
      <button
        onClick={onBack}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-accent transition-colors active:scale-95"
        aria-label="Go back to difficulty selection"
      >
        <ArrowLeft size={22} className="text-primary" />
      </button>

      {/* Center: Difficulty Label + Timer */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-display font-bold text-base text-primary truncate">
          {difficultyLabel}
        </span>
        <div className="flex items-center gap-1.5 bg-background/70 rounded-full px-3 py-1 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/60">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-xs font-mono font-medium text-primary/80">
            {timeFormatted}
          </span>
        </div>
      </div>

      {/* Statistics Button */}
      <button
        onClick={onShowStats}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-accent transition-colors active:scale-95"
        aria-label="View statistics"
      >
        <BarChart3 size={22} className="text-primary" />
      </button>
    </div>
  );
}
