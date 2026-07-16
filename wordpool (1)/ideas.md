# WordPool — Game Design Brainstorm

## Three Stylistic Approaches

### 1. Material Playground
- **Theme Name:** Material Playground
- **Very Brief Intro:** A vibrant, card-based Material Design 3 interface that feels like a native Android game — rounded surfaces, tonal color palettes, and playful elevation.
- **Probability:** 0.72

### 2. Dark Neon Arcade
- **Theme Name:** Dark Neon Arcade
- **Very Brief Intro:** A dark-mode word game with neon glow accents, reminiscent of classic arcade cabinets — high contrast tiles with electric green/yellow/gray feedback.
- **Probability:** 0.12

### 3. Paper Craft Minimal
- **Theme Name:** Paper Craft Minimal
- **Very Brief Intro:** A warm, paper-textured interface with handwritten typography and subtle crease shadows — like solving a crossword in a leather notebook.
- **Probability:** 0.06

---

## Chosen Approach: Material Playground

### Design Movement
**Material Design 3 (Material You)** — Google's latest design system with dynamic color, tonal palettes, and expressive surfaces. The game will feel like a first-party Google app — polished, modern, and tactile.

### Core Principles
1. **Tonal Surfaces:** Use Material 3's tonal color system (primary, secondary, tertiary containers) for depth without traditional shadows.
2. **Tactile Feedback:** Every interaction should feel physical — tile flips, key presses, and shakes all use smooth spring physics.
3. **Compact Density:** Material 3's compact density for game interfaces — maximize screen real estate for the grid and keyboard.
4. **Dynamic Harmony:** All colors derive from a single seed (WordPool's signature teal-green) to create a cohesive, harmonious palette.

### Color Philosophy
The palette is built around **Material 3 tonal elevation** with a teal-green seed color:
- **Primary:** Deep teal-green (`#006D4C`) — used for correct tiles, primary buttons
- **Secondary:** Warm amber (`#7B5A00`) — used for in-position tiles
- **Tertiary:** Muted stone (`#B8B8B8`) — used for absent tiles
- **Surface:** Light warm gray (`#F5F3F0`) — the game board background
- **Container:** Soft teal (`#E8F5EE`) — difficulty cards, category labels

### Layout Paradigm
**Vertical Stack with Fixed Bottom Navigation:** A single-column layout optimized for mobile. Top bar (navigation + timer), game area (category + grid), keyboard (fixed bottom). The layout uses CSS Grid for the word grid and flexbox for the keyboard rows.

### Signature Elements
1. **Tonal Tile System:** Tiles use Material 3's tonal palette — green-500 for correct, amber-400 for in-position, stone-300 for absent, with matching text colors from the M3 palette.
2. **Spring-Animated Tile Flips:** 3D tile flip animation using CSS `transform: rotateX()` with spring easing, mimicking the physical feel of flipping a card.
3. **Rounded Container Cards:** All UI elements use `border-radius: 16px` (M3 medium container) creating a soft, approachable feel.

### Interaction Philosophy
Every interaction is **immediate and physical**:
- Tile placement: instant scale-down feedback
- Submit: row-level flip animation with 50ms stagger
- Invalid guess: CSS shake animation on the entire row
- Keyboard: active state with ripple-like scale effect

### Animation
- **Tile flip:** `rotateX(0deg → 90deg → 0deg)` over 150ms per tile, staggered 50ms
- **Row shake:** `translateX(-8px → 8px → -4px → 4px → 0)` over 400ms
- **Keyboard press:** `scale(0.97)` on active, `scale(1)` on release, 100ms
- **Bottom sheet entrance:** `translateY(100% → 0)` with `cubic-bezier(0.23, 1, 0.32, 1)` over 300ms
- **Difficulty selection:** `scale(0.95 → 1)` with opacity transition

### Typography System
- **Display:** Google Sans-inspired — `system-ui` with `font-weight: 700` for headings
- **Body:** `system-ui` with `font-weight: 500` for game text
- **Tile letters:** Monospace-style `font-weight: 600`, large size for readability
- **Hierarchy:** Timer and category use `font-size: 0.875rem`, difficulty label uses `1rem bold`

### Brand Essence
**WordPool** — A clean, tactile word puzzle for casual gamers who want a quick, satisfying brain workout on their phone.
**Personality:** Crisp, playful, trustworthy.

### Brand Voice
- Headlines: Short, action-oriented. "Find the hidden word."
- CTAs: Clear and direct. "Start Playing" / "Choose Difficulty"
- Microcopy: Friendly but minimal. "5 attempts remaining" / "Great guess!"

### Wordmark & Logo
A stylized "W" formed by 5 stacked letter tiles in green-to-amber gradient, representing the core gameplay mechanic of letter placement.

### Signature Brand Color
**Teal Green** `#006D4C` — used for the app icon, correct tiles, and primary accents. This color is unique and memorable, distinguishing WordPool from the typical blue-dominated puzzle games.
## Style Decisions (from review)

- **WordPool logo**: Use tile-built "W" identity as primary mark; brand name should never appear as plain default text.
- **Difficulty visuals**: Use consistent Material-style icon or tile motif in the WordPool tonal palette; avoid platform emojis as primary brand imagery.
- **Surfaces**: Favor Material 3 tonal containers derived from the teal-green seed (#006D4C), with shadows used subtly and never as the main source of hierarchy.
- **Brand presence**: Increase hierarchy and app-like presence — hero, difficulty choices, and key stats should have confident scale/rhythm.
- **Teal-green seed color**: Lead the whole experience with the signature teal and its tonal variants across headers, badges, containers, and key emphasis.
