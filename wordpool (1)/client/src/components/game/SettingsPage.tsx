/**
 * SettingsPage — game settings with sound/haptic toggles and stats reset
 *
 * One accent color (primary) + neutral surfaces, red reserved only
 * for destructive actions.
 */

import { useState, useCallback } from "react";
import { Volume2, VolumeX, Smartphone, X, RotateCcw, Trash2 } from "lucide-react";
import type { GameStats } from "@/lib/stats";
import { loadAudioSettings, saveAudioSettings } from "@/lib/audio";
import { resetStats } from "@/lib/stats";
import { clearUsedWordsStore } from "@/lib/dictionary";
import { toast } from "sonner";

interface SettingsPageProps {
  stats: GameStats;
  onClose: () => void;
}

export function SettingsPage({ stats, onClose }: SettingsPageProps) {
  const settings = loadAudioSettings();
  const [soundOn, setSoundOn] = useState(settings.soundEnabled);
  const [hapticOn, setHapticOn] = useState(settings.hapticEnabled);

  const handleToggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      saveAudioSettings({ soundEnabled: next, hapticEnabled: hapticOn });
      return next;
    });
  }, [hapticOn]);

  const handleToggleHaptic = useCallback(() => {
    setHapticOn((prev) => {
      const next = !prev;
      saveAudioSettings({ soundEnabled: soundOn, hapticEnabled: next });
      return next;
    });
  }, [soundOn]);

  const handleResetStats = useCallback(() => {
    resetStats();
    toast.success("Statistics reset");
  }, []);

  const handleResetDictionary = useCallback(() => {
    clearUsedWordsStore();
    toast.success("Word history cleared");
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3 bg-card"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <div className="w-10" />
        <h2 className="font-display font-bold text-lg text-primary">Settings</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          aria-label="Close settings"
        >
          <X size={22} className="text-primary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto w-full pb-20">
        {/* Sound & Haptic Section */}
        <div className="bg-card rounded-2xl p-4 mb-4">
          <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Feedback
          </h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                {soundOn ? (
                  <Volume2 size={20} className="text-primary" />
                ) : (
                  <VolumeX size={20} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-display font-medium text-sm text-foreground">Sound Effects</div>
                <div className="text-xs text-muted-foreground">
                  Tile flips, win/loss sounds
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" role="switch" aria-checked={soundOn}>
              <input
                type="checkbox"
                checked={soundOn}
                onChange={handleToggleSound}
                className="sr-only"
              />
              <div className={`w-12 h-7 rounded-full transition-colors duration-200 ${soundOn ? "bg-primary" : "bg-accent"}`} />
              <div
                className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                  soundOn ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </label>
          </div>

          {/* Haptic Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Smartphone size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-display font-medium text-sm text-foreground">Haptic Feedback</div>
                <div className="text-xs text-muted-foreground">
                  Vibration on tile placement
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" role="switch" aria-checked={hapticOn}>
              <input
                type="checkbox"
                checked={hapticOn}
                onChange={handleToggleHaptic}
                className="sr-only"
              />
              <div className={`w-12 h-7 rounded-full transition-colors duration-200 ${hapticOn ? "bg-primary" : "bg-accent"}`} />
              <div
                className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${
                  hapticOn ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </label>
          </div>
        </div>

        {/* Reset Section */}
        <div className="bg-card rounded-2xl p-4 mb-4">
          <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Reset
          </h3>

          <button
            onClick={handleResetStats}
            className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-accent transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <RotateCcw size={20} className="text-destructive" />
            </div>
            <div>
              <div className="font-display font-medium text-sm text-foreground">Reset Statistics</div>
              <div className="text-xs text-muted-foreground">
                Clear all lifetime stats
              </div>
            </div>
          </button>

          <div className="h-px bg-border my-1" />

          <button
            onClick={handleResetDictionary}
            className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-accent transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 size={20} className="text-destructive" />
            </div>
            <div>
              <div className="font-display font-medium text-sm text-foreground">Clear Word History</div>
              <div className="text-xs text-muted-foreground">
                Allow previously used words again
              </div>
            </div>
          </button>
        </div>

        {/* About */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {["W", "O", "R", "D"].map((letter, i) => (
              <div
                key={i}
                className="w-6 h-7 rounded-md flex items-center justify-center font-display font-bold text-primary-foreground text-xs bg-primary"
                style={{ opacity: 1 - i * 0.12 }}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="text-xs font-display font-semibold text-foreground">
            WordPool v1.0
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            23,544 words &bull; 23 categories &bull; 5 difficulty levels
          </p>
        </div>
      </div>
    </div>
  );
}
