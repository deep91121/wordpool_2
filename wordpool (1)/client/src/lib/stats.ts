/**
 * WordPool Game Statistics
 * 
 * Tracks lifetime statistics stored in localStorage.
 * Saves on every game completion (win or loss).
 */

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winPercentage: number;
  currentWinStreak: number;
  bestWinStreak: number;
}

export interface GameResult {
  won: boolean;
  attemptsUsed: number;
  wordLength: number;
}

const STATS_KEY = "wordpool_stats";

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  winPercentage: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
};

/**
 * Load game stats from localStorage.
 */
export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameStats;
      // Validate
      if (parsed.gamesPlayed !== undefined) return parsed;
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_STATS };
}

/**
 * Save game stats to localStorage.
 */
export function saveStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

/**
 * Record a game result and return updated stats.
 */
export function recordGameResult(result: GameResult): GameStats {
  const stats = loadStats();
  
  stats.gamesPlayed += 1;
  
  if (result.won) {
    stats.wins += 1;
    stats.currentWinStreak += 1;
    if (stats.currentWinStreak > stats.bestWinStreak) {
      stats.bestWinStreak = stats.currentWinStreak;
    }
  } else {
    stats.losses += 1;
    stats.currentWinStreak = 0;
  }
  
  // Calculate win percentage
  if (stats.gamesPlayed > 0) {
    stats.winPercentage = Math.round((stats.wins / stats.gamesPlayed) * 1000) / 10;
  }
  
  saveStats(stats);
  return stats;
}

/**
 * Reset all statistics.
 */
export function resetStats(): GameStats {
  const fresh = { ...DEFAULT_STATS };
  saveStats(fresh);
  return fresh;
}
