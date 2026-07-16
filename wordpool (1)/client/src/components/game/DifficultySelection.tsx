/**
 * DifficultySelection — simple, single-palette difficulty picker
 *
 * Previously each difficulty had its own hue (green/brown/purple/red),
 * which made the screen busy. Now every card shares the same neutral
 * surface and the same single accent color; difficulty is
 * communicated through the letter count badge and label text only.
 */

import type { DifficultyId } from "@/lib/dictionary";
import { DIFFICULTIES } from "@/lib/dictionary";

interface DifficultySelectionProps {
  onSelect: (difficulty: DifficultyId) => void;
}

const DESCRIPTIONS: Record<DifficultyId, string> = {
  easy: "4 Letters",
  normal: "5 Letters",
  hard: "6 Letters",
  expert: "7 Letters",
  master: "8 Letters",
};

export function DifficultySelection({ onSelect }: DifficultySelectionProps) {
  return (
    <div className="flex flex-col w-full px-4 pt-10 pb-4">
      {/* Logo / Title */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-1 mb-3">
          <div className="flex gap-0.5">
            {["W", "O", "R", "D"].map((letter, i) => (
              <div
                key={i}
                className="w-9 h-10 rounded-lg flex items-center justify-center font-display font-bold text-primary-foreground text-lg bg-primary"
                style={{
                  opacity: 1 - i * 0.12,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight text-foreground">
          WordPool
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find the hidden word in 5 attempts
        </p>
      </div>

      {/* Difficulty Cards — one consistent card style, one accent color */}
      <div className="w-full flex flex-col gap-2.5 max-w-sm mx-auto">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff.id}
            onClick={() => onSelect(diff.id)}
            className="w-full flex items-center justify-between p-3.5 bg-card hover:bg-accent
              rounded-2xl active:scale-[0.98] transition-all duration-150
              border border-border outline-none"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-primary-foreground bg-primary shrink-0"
                aria-hidden="true"
              >
                {diff.length}
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-[15px] text-foreground">
                  {diff.label}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {DESCRIPTIONS[diff.id]}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-[11px] text-muted-foreground/80 mt-5 text-center">
        23,544 words across 23 categories
      </p>
    </div>
  );
}
