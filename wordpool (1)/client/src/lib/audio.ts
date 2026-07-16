/**
 * WordPool Audio & Haptic Feedback System
 * 
 * Web Audio API synthesized sounds — no external files needed.
 * All sounds are toggleable via Settings.
 * Haptic feedback uses the Navigator Vibration API (mobile only).
 */

export interface AudioSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

// Default settings
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  soundEnabled: true,
  hapticEnabled: true,
};

const SETTINGS_KEY = "wordpool_audio_settings";

let audioCtx: AudioContext | null = null;

/**
 * Get or create the AudioContext (must be created after user interaction).
 */
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Load audio settings from localStorage.
 */
export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as AudioSettings;
  } catch {
    // ignore
  }
  return { ...DEFAULT_AUDIO_SETTINGS };
}

/**
 * Save audio settings to localStorage.
 */
export function saveAudioSettings(settings: AudioSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Trigger a short tile placement "click" sound.
 */
export function playTileClick() {
  const settings = loadAudioSettings();
  if (!settings.soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // ignore audio errors
  }
  
  triggerHaptic(10); // Light tap
}

/**
 * Trigger the row shake / invalid word sound.
 */
export function playInvalidShake() {
  const settings = loadAudioSettings();
  if (!settings.soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // ignore
  }
  
  triggerHaptic([50, 30, 50, 30, 50]); // Medium shake pattern
}

/**
 * Trigger the game win ascending chime.
 */
export function playWinChime() {
  const settings = loadAudioSettings();
  if (!settings.soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch {
    // ignore
  }
  
  triggerHaptic([100, 50, 100, 50, 200]); // Success pattern
}

/**
 * Trigger the game loss descending tone.
 */
export function playLossTone() {
  const settings = loadAudioSettings();
  if (!settings.soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  } catch {
    // ignore
  }
  
  triggerHaptic([200, 50, 300]); // Error pattern
}

/**
 * Trigger the guess submitted sound (submit button press).
 */
export function playSubmitClick() {
  const settings = loadAudioSettings();
  if (!settings.soundEnabled) return;
  
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // ignore
  }
  
  triggerHaptic(15);
}

/**
 * Trigger haptic feedback (mobile only).
 */
function triggerHaptic(pattern: number | number[]) {
  const settings = loadAudioSettings();
  if (!settings.hapticEnabled) return;
  
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

/**
 * Initialize audio on first user interaction (required by browsers).
 */
export function initializeAudio() {
  try {
    getAudioContext();
  } catch {
    // ignore
  }
}
