/**
 * WordPool Dictionary System
 * 
 * Imports the local dictionary JSON directly (bundled at build time).
 * Manages word selection, tracking used words per difficulty,
 * and provides the hybrid validation system (local for target,
 * online API for guess validation).
 */

import { toast } from "sonner";

// Import the dictionary directly — Vite will handle JSON imports
import rawDictionary from "@/data/dictionary.json";

export interface DictionaryEntry {
  word: string;
  length: number;
  category: string;
  definition: string;
  difficulty: string;
}

export const dictionary: DictionaryEntry[] = rawDictionary as DictionaryEntry[];

// Difficulty configuration
export const DIFFICULTIES = [
  { label: "Easy", length: 4, id: "easy" },
  { label: "Normal", length: 5, id: "normal" },
  { label: "Hard", length: 6, id: "hard" },
  { label: "Expert", length: 7, id: "expert" },
  { label: "Master", length: 8, id: "master" },
] as const;

export type DifficultyId = (typeof DIFFICULTIES)[number]["id"];

// Type for the used words tracking in localStorage
interface UsedWordsStore {
  easy: string[];
  normal: string[];
  hard: string[];
  expert: string[];
  master: string[];
}

const STORAGE_KEY = "wordpool_dictionary";

/**
 * Get words filtered by length (difficulty).
 * Synchronous — data is already loaded.
 */
export function getWordsForDifficulty(
  difficulty: DifficultyId
): DictionaryEntry[] {
  const entry = DIFFICULTIES.find((d) => d.id === difficulty)!;
  return dictionary.filter((w) => w.length === entry.length);
}

/**
 * Get a random unused target word for the given difficulty.
 * Tracks used words in localStorage to avoid repetition.
 */
export function selectTargetWord(
  difficulty: DifficultyId
): DictionaryEntry {
  const words = getWordsForDifficulty(difficulty);
  const store = getUsedWordsStore();
  const used = new Set(store[difficulty]);

  // Filter out used words
  const available = words.filter((w) => !used.has(w.word));

  let word: DictionaryEntry;
  if (available.length === 0) {
    // All words exhausted — reset used words for this difficulty
    store[difficulty] = [];
    saveUsedWordsStore(store);
    word = words[Math.floor(Math.random() * words.length)];
  } else {
    word = available[Math.floor(Math.random() * available.length)];
  }

  // Mark as used
  store[difficulty].push(word.word);
  // Keep at most last 1000 used per difficulty to bound localStorage
  if (store[difficulty].length > 1000) {
    store[difficulty] = store[difficulty].slice(-1000);
  }
  saveUsedWordsStore(store);

  return word;
}

/**
 * Load the used words tracking store from localStorage.
 */
export function getUsedWordsStore(): UsedWordsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UsedWordsStore;
    }
  } catch {
    // ignore
  }
  return { easy: [], normal: [], hard: [], expert: [], master: [] };
}

/**
 * Save the used words tracking store to localStorage.
 */
function saveUsedWordsStore(store: UsedWordsStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full — silently fail
  }
}

/**
 * Clear used words history (for Settings reset).
 */
export function clearUsedWordsStore() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Validate a guess using the Free Dictionary API.
 * Returns true if the word is valid, false otherwise.
 */
export async function validateGuess(word: string): Promise<boolean> {
  // First check against our local dictionary (source of truth with 23,544 words)
  const localMatch = dictionary.find((w) => w.word === word);
  if (localMatch) return true;

  // Fall back to the Free Dictionary API for words not in our local set.
  // A hard timeout keeps a slow/unreachable connection from hanging the
  // submit button forever on mobile networks.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal: controller.signal }
    );
    if (!response.ok) return false;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return false;
    return true;
  } catch {
    // If the API is unreachable or times out, only trust the local dictionary
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch definition for a word from the Free Dictionary API.
 * Used in end-game overlay as fallback if local definition is missing.
 */
export async function fetchDefinition(word: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!response.ok) return "";
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      if (entry.meanings && entry.meanings.length > 0) {
        const def = entry.meanings[0]?.definitions?.[0]?.definition;
        if (def) return def;
      }
    }
  } catch {
    // ignore
  }
  return "";
}
