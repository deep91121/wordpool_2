/**
 * LoadingScreen — Shown while dictionary loads
 * 
 * Simple spinner with the WordPool logo.
 */

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
      {/* Logo tiles */}
      <div className="flex gap-0.5 mb-4">
        {["W", "O", "R", "D"].map((letter, i) => (
          <div
            key={i}
            className="w-10 h-11 rounded-xl flex items-center justify-center font-display font-bold text-white text-base animate-pulse"
            style={{
              backgroundColor: "var(--primary)",
              opacity: 1 - i * 0.15,
              animationDelay: `${i * 100}ms`,
            }}
          >
            {letter}
          </div>
        ))}
      </div>
      <p className="font-display font-semibold text-muted-foreground text-sm">
        Loading dictionary...
      </p>
    </div>
  );
}
