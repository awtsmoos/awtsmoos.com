# B"H

Boruch Hashem

Blessed is He

## Transition Design

The Awtsmoos reveals continuity without turning Awtsmoos.com into theatrical motion.

## States

- `idle`: no navigation work.
- `loading`: destination fetch is active; current content remains readable.
- `leaving`: optional short opacity/translate preparation after valid destination exists.
- `entering`: new outlet is installed and settling.
- `failed`: state clears immediately before native fallback.

## Rules

- No full-screen travel.
- No animation begins before destination validation.
- `prefers-reduced-motion: reduce` removes transforms and durations.
- View Transitions API may wrap the atomic swap when available; CSS classes remain the fallback.
- `aria-busy` belongs to the route outlet during loading and is always cleared.
- The shell, Context Ribbon vessel, and dock do not leave the document.
- Focus moves only after content exists.
