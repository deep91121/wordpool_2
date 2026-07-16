/**
 * WordPool Core Game Hook
 * 
 * Manages the entire game state: target word, guesses, tile states,
 * keyboard states, timer, and game flow.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  type DictionaryEntry,
  type DifficultyId,
  DIFFICULTIES,
  selectTargetWord,
  validateGuess,
} from "@/lib/dictionary";
import {
  playTileClick,
  playSubmitClick,
  playInvalidShake,
  playWinChime,
  playLossTone,
  initializeAudio,
} from "@/lib/audio";
import { recordGameResult } from "@/lib/stats";

export const MAX_ATTEMPTS = 5;

export type TileState = "empty" | "typing" | "absent" | "present" | "correct";
export type KeyState = "default" | "absent" | "present" | "correct";

export interface Tile {
  letter: string;
  state: TileState;
}

export interface Row {
  tiles: Tile[];
  submitted: boolean;
  evaluated: boolean;
}

export interface GamePhase {
  phase: "selecting";
}

export interface GamePlaying {
  phase: "playing";
  targetWord: DictionaryEntry;
  rows: Row[];
  currentRow: number;
  currentInput: string[];
  keyboardStates: Record<string, KeyState>;
  isGameOver: boolean;
  gameWon: boolean;
}

export interface GameFinished {
  phase: "finished";
  targetWord: DictionaryEntry;
  rows: Row[];
  gameWon: boolean;
  attemptsUsed: number;
}

export type GameState = GamePhase | GamePlaying | GameFinished;

function isPlaying(g: GameState): g is GamePlaying {
  return g.phase === "playing";
}

export function useWordPoolGame() {
  const [gameState, setGameState] = useState<GameState>({ phase: "selecting" });
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer
  const startTimer = useCallback(() => {
    setTimer(0);
    setTimerActive(true);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    setTimerActive(false);
  }, []);

  // Timer tick
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  // Format timer as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  // Start a new game with a difficulty
  const startGame = useCallback(async (difficulty: DifficultyId) => {
    initializeAudio();
    
    const target = selectTargetWord(difficulty);
    const wordLength = DIFFICULTIES.find((d) => d.id === difficulty)!.length;
    
    const rows: Row[] = Array.from({ length: MAX_ATTEMPTS }, () => ({
      tiles: Array.from({ length: wordLength }, () => ({
        letter: "",
        state: "empty" as TileState,
      })),
      submitted: false,
      evaluated: false,
    }));

    setGameState({
      phase: "playing",
      targetWord: target,
      rows,
      currentRow: 0,
      currentInput: [],
      keyboardStates: {},
      isGameOver: false,
      gameWon: false,
    });
    
    startTimer();
  }, [startTimer]);

  // Handle letter input
  const handleLetter = useCallback((letter: string) => {
    setGameState((prev) => {
      if (prev.phase !== "playing" || prev.isGameOver) return prev;
      if (prev.currentInput.length >= prev.targetWord.length) return prev;
      
      playTileClick();
      
      const newInput = [...prev.currentInput, letter.toUpperCase()];
      const newRows = [...prev.rows];
      const rowIdx = prev.currentRow;
      
      newRows[rowIdx] = {
        ...newRows[rowIdx],
        tiles: newRows[rowIdx].tiles.map((tile: Tile, i: number) =>
          i === newInput.length - 1
            ? { ...tile, letter: newInput[newInput.length - 1], state: "typing" as TileState }
            : tile
        ),
      };

      return {
        ...prev,
        currentInput: newInput,
        rows: newRows,
      };
    });
  }, []);

  // Handle delete
  const handleDelete = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== "playing" || prev.isGameOver) return prev;
      if (prev.currentInput.length === 0) return prev;

      const newInput = prev.currentInput.slice(0, -1);
      const newRows = [...prev.rows];
      const rowIdx = prev.currentRow;
      
      newRows[rowIdx] = {
        ...newRows[rowIdx],
        tiles: newRows[rowIdx].tiles.map((tile: Tile, i: number) =>
          i === prev.currentInput.length - 1
            ? { ...tile, letter: "", state: "empty" as TileState }
            : tile
        ),
      };

      return {
        ...prev,
        currentInput: newInput,
        rows: newRows,
      };
    });
  }, []);

  // Submit flag — prevents double-submit
  const submittingRef = useRef(false);
  // Snapshot ref for accessing state inside async context
  const gameStateRef = useRef<GameState>(gameState);
  
  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    
    const state = gameStateRef.current;
    
    if (state.phase !== "playing" || state.isGameOver) {
      return;
    }
    if (state.currentInput.length !== state.targetWord.length) {
      toast.info("Not enough letters");
      return;
    }
    
    submittingRef.current = true;

    const guess = state.currentInput.join("");
    const target = state.targetWord.word;
    const rowIdx = state.currentRow;
    const wordLength = state.targetWord.length;

    playSubmitClick();

    // Validate with online API
    const isValid = await validateGuess(guess);

    if (!isValid) {
      // Invalid word — don't consume attempt, unlock
      playInvalidShake();
      toast.error("Not a valid English word", {
        duration: 2000,
      });
      submittingRef.current = false;
      return;
    }

    // Valid guess — evaluate and flip tiles
    const targetLetters = target.split("");
    const guessLetters = guess.split("");
    const remainingTarget = [...targetLetters];
    const tileStates: TileState[] = Array(wordLength).fill("absent" as TileState);

    // First pass: correct positions
    for (let i = 0; i < wordLength; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        tileStates[i] = "correct";
        remainingTarget[i] = null as unknown as string;
      }
    }

    // Second pass: present (wrong position)
    for (let i = 0; i < wordLength; i++) {
      if (tileStates[i] !== "correct") {
        const idx = remainingTarget.indexOf(guessLetters[i]);
        if (idx !== -1) {
          tileStates[i] = "present";
          remainingTarget[idx] = null as unknown as string;
        }
      }
    }

    // Build new rows
    const newRows = [...state.rows];
    newRows[rowIdx] = {
      ...newRows[rowIdx],
      submitted: true,
      evaluated: true,
      tiles: newRows[rowIdx].tiles.map((tile: Tile, i: number) => ({
        ...tile,
        state: tileStates[i],
      })),
    };

    // Update keyboard states (green overrides yellow, yellow overrides gray)
    const newKeyboard: Record<string, KeyState> = { ...state.keyboardStates };
    for (let i = 0; i < wordLength; i++) {
      const letter = guessLetters[i];
      const currentState = newKeyboard[letter] || "default";
      const newState = tileStates[i];
      
      if (currentState === "correct") continue; // Green overrides everything
      
      if (newState === "correct") {
        newKeyboard[letter] = "correct";
      } else if (newState === "present" && (currentState === "default" || currentState === "absent")) {
        newKeyboard[letter] = "present";
      } else if (newState === "absent" && currentState === "default") {
        newKeyboard[letter] = "absent";
      }
    }

    // Check win/loss
    const isWin = tileStates.every((s) => s === "correct");
    const attemptsUsed = rowIdx + 1;
    const isLoss = !isWin && attemptsUsed >= MAX_ATTEMPTS;
    const isGameOver = isWin || isLoss;

    if (isGameOver) {
      stopTimer();
      
      if (isWin) {
        playWinChime();
      } else {
        playLossTone();
      }
      
      recordGameResult({
        won: isWin,
        attemptsUsed,
        wordLength,
      });
    }

    submittingRef.current = false;

    // Apply the updated state
    if (isGameOver) {
      setGameState({
        phase: "finished",
        targetWord: state.targetWord,
        rows: newRows,
        gameWon: isWin,
        attemptsUsed,
      });
    } else {
      setGameState({
        phase: "playing",
        targetWord: state.targetWord,
        rows: newRows,
        currentRow: rowIdx + 1,
        currentInput: [],
        keyboardStates: newKeyboard,
        isGameOver: false,
        gameWon: isWin,
      });
    }
  }, [stopTimer]);

  // Handle keyboard input (physical keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.phase !== "playing" || gameState.isGameOver) return;
      
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleLetter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleSubmit, handleDelete, handleLetter]);

  return {
    gameState,
    timer,
    formatTime,
    startGame,
    handleLetter,
    handleDelete,
    handleSubmit,
    stopTimer,
  };
}
