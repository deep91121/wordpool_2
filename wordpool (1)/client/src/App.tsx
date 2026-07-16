/**
 * WordPool — Main Application
 *
 * Material Design 3 themed word puzzle game.
 * Layout: Top Bar → Category → Grid → Keyboard → Bottom Nav
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BottomNavigation } from "@/components/game/BottomNavigation";
import { DifficultySelection } from "@/components/game/DifficultySelection";
import { GameTopBar } from "@/components/game/GameTopBar";
import { WordGrid } from "@/components/game/WordGrid";
import { VirtualKeyboard } from "@/components/game/VirtualKeyboard";
import { EndGameOverlay } from "@/components/game/EndGameOverlay";
import { StatisticsView } from "@/components/game/StatisticsView";
import { SettingsPage } from "@/components/game/SettingsPage";
import { useWordPoolGame, MAX_ATTEMPTS } from "@/hooks/useWordPoolGame";
import { DIFFICULTIES, type DifficultyId, dictionary } from "@/lib/dictionary";
import { loadStats, type GameStats } from "@/lib/stats";

type Tab = "play" | "settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("play");
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<GameStats>(() => loadStats());
  const [showDifficultySelection, setShowDifficultySelection] = useState(true);

  // Track current difficulty for back navigation
  const currentDifficultyRef = useRef<DifficultyId>("normal");

  const {
    gameState,
    timer,
    formatTime,
    startGame,
    handleLetter,
    handleDelete,
    handleSubmit,
  } = useWordPoolGame();

  const dictionaryLoaded = dictionary.length > 0;

  // Reload stats when returning from settings
  const handleReloadStats = useCallback(() => {
    setStats(loadStats());
  }, []);

  // Refresh stats after game ends
  useEffect(() => {
    if (gameState.phase === "finished") {
      setStats(loadStats());
    }
  }, [gameState.phase]);

  const handleSelectDifficulty = useCallback(async (difficulty: DifficultyId) => {
    currentDifficultyRef.current = difficulty;
    setShowDifficultySelection(false);
    await startGame(difficulty);
  }, [startGame]);

  const handleBackToSelection = useCallback(() => {
    setShowDifficultySelection(true);
  }, []);

  const handleNewGame = useCallback(() => {
    setShowStats(false);
    setShowDifficultySelection(true);
  }, []);

  const getDifficultyLabel = (): string => {
    if (gameState.phase === "playing" || gameState.phase === "finished") {
      const entry = DIFFICULTIES.find(
        (d) => d.id === gameState.targetWord.difficulty.toLowerCase()
      );
      return entry?.label || gameState.targetWord.difficulty;
    }
    return "";
  };

  if (!dictionaryLoaded) {
    return (
      <div className="game-container bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-bold text-2xl text-primary animate-pulse">
            WordPool
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading dictionary...
          </p>
        </div>
      </div>
    );
  }

  // Settings Tab (full-screen overlay)
  if (activeTab === "settings") {
    return (
      <>
        <SettingsPage
          stats={stats}
          onClose={() => {
            setActiveTab("play");
            handleReloadStats();
          }}
        />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </>
    );
  }

  // Difficulty Selection
  if (showDifficultySelection) {
    return (
      <div className="game-container bg-background">
        <DifficultySelection onSelect={handleSelectDifficulty} />
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Playing or Finished state
  const isPlaying = gameState.phase === "playing";
  const isFinished = gameState.phase === "finished";
  const target = isPlaying || isFinished ? gameState.targetWord : null;

  return (
    <div className="game-container bg-background relative">
      {/* Top Bar */}
      <GameTopBar
        difficultyLabel={getDifficultyLabel()}
        timeFormatted={formatTime(timer)}
        onBack={handleBackToSelection}
        onShowStats={() => setShowStats(true)}
      />

      {/* Game Area — a fixed-height column: category (auto), grid (fills
          remaining space, min-h-0 so it can never grow past its box),
          attempts indicator (auto). This guarantees the grid can never
          bleed into the category label or the keyboard below it. */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pt-3 pb-2">
        {/* Category Label */}
        {target && (
          <div className="shrink-0 flex flex-col items-center mb-2">
            <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-xs font-display font-semibold max-w-full">
              <span className="shrink-0">Category:</span>
              <span className="font-bold truncate">{target.category}</span>
            </span>
          </div>
        )}

        {/* Word Grid — takes all remaining space, never more */}
        <div className="flex-1 min-h-0 w-full max-w-[420px] mx-auto">
          {(isPlaying || isFinished) && (
            <WordGrid
              rows={gameState.rows}
              wordLength={gameState.targetWord.length}
            />
          )}
        </div>

        {/* Attempts indicator */}
        {isPlaying && (
          <div className="shrink-0 flex items-center justify-center mt-1">
            <span className="text-[11px] text-muted-foreground font-medium">
              {gameState.currentRow + 1} / {MAX_ATTEMPTS} attempts
            </span>
          </div>
        )}
      </div>

      {/* Keyboard - with spacing from bottom nav */}
      <div className="shrink-0 px-2 pb-16 pt-1">
        <VirtualKeyboard
          onKey={handleLetter}
          onEnter={handleSubmit}
          onDelete={handleDelete}
          keyboardStates={isPlaying ? gameState.keyboardStates : {}}
          disabled={isFinished || (isPlaying && gameState.isGameOver)}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* End Game Overlay */}
      {isFinished && (
        <EndGameOverlay
          gameWon={gameState.gameWon}
          targetWord={gameState.targetWord}
          stats={stats}
          attemptsUsed={gameState.attemptsUsed}
          onNewGame={handleNewGame}
        />
      )}

      {/* Statistics Modal */}
      {showStats && (
        <StatisticsView
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}

      <Toaster />
    </div>
  );
}
