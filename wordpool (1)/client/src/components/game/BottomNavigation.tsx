/**
 * BottomNavigation — simple two-tab bottom bar (Play / Settings)
 */

import { Gamepad2, Settings } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "play" | "settings";
  onTabChange: (tab: "play" | "settings") => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-[env(safe-area-inset-bottom,0px)] z-40">
      <div className="flex items-center justify-around py-1.5 max-w-md mx-auto">
        {/* Play Tab */}
        <button
          onClick={() => onTabChange("play")}
          className={`
            flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl
            transition-colors duration-200
            ${activeTab === "play" ? "bg-accent" : ""}
          `}
        >
          <Gamepad2
            size={22}
            className={activeTab === "play" ? "text-primary" : "text-muted-foreground"}
          />
          <span
            className={`text-[11px] font-display font-semibold ${
              activeTab === "play" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Play
          </span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => onTabChange("settings")}
          className={`
            flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl
            transition-colors duration-200
            ${activeTab === "settings" ? "bg-accent" : ""}
          `}
        >
          <Settings
            size={22}
            className={activeTab === "settings" ? "text-primary" : "text-muted-foreground"}
          />
          <span
            className={`text-[11px] font-display font-semibold ${
              activeTab === "settings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Settings
          </span>
        </button>
      </div>
    </div>
  );
}
