/**
 * VirtualKeyboard — On-screen keyboard
 *
 * Layout: Enter (left), letter keys (center), Delete (right).
 * Key colors use the same --tile-* variables as the grid tiles, so a
 * "correct" key is always the exact same color as a "correct" tile
 * (previously these were two different hardcoded grays/greens).
 */

import { useState } from "react";
import { Delete } from "lucide-react";
import type { KeyState } from "@/hooks/useWordPoolGame";

interface VirtualKeyboardProps {
  onKey: (key: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  keyboardStates: Record<string, KeyState>;
  disabled: boolean;
}

const KEY_ROWS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

function getKeyColor(state: KeyState): string {
  switch (state) {
    case "correct":
      return "bg-tile-correct text-white border-tile-correct-border";
    case "present":
      return "bg-tile-present text-white border-tile-present-border";
    case "absent":
      return "bg-tile-absent text-white/80 border-tile-absent-border";
    case "default":
      return "bg-card text-foreground border-border";
  }
}

export function VirtualKeyboard({
  onKey,
  onEnter,
  onDelete,
  keyboardStates,
  disabled,
}: VirtualKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handlePress = (key: string) => {
    if (disabled) return;
    setPressedKey(key);

    if (key === "ENTER") {
      onEnter();
    } else if (key === "DEL") {
      onDelete();
    } else {
      onKey(key);
    }

    setTimeout(() => setPressedKey(null), 100);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto pb-1 bg-background rounded-t-2xl">
      <div className="flex flex-col gap-1.5">
        {KEY_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-1">
            {row.map((key) => {
              const isActionKey = key === "ENTER" || key === "DEL";
              const keyState = !isActionKey
                ? (keyboardStates[key] || "default")
                : "default";
              const colorClass = getKeyColor(keyState);
              const isPressed = pressedKey === key;

              return (
                <button
                  key={key}
                  onClick={() => handlePress(key)}
                  className={`
                    ${colorClass}
                    border
                    rounded-lg font-display font-semibold
                    flex items-center justify-center
                    transition-all duration-100
                    active:scale-95
                    ${isPressed ? "scale-95" : ""}
                    ${disabled ? "opacity-40" : ""}
                    ${isActionKey ? "text-[11px] h-12 px-2" : "text-sm h-12 w-9 sm:w-10"}
                  `}
                  style={{
                    flex: isActionKey ? "1.5" : "1",
                    maxWidth: isActionKey ? "72px" : undefined,
                    minWidth: isActionKey ? "48px" : undefined,
                  }}
                  disabled={disabled}
                  aria-label={
                    key === "ENTER"
                      ? "Submit guess"
                      : key === "DEL"
                      ? "Delete"
                      : key
                  }
                >
                  {key === "ENTER" ? (
                    <span className="text-[10px] font-bold">ENTER</span>
                  ) : key === "DEL" ? (
                    <Delete size={18} />
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
