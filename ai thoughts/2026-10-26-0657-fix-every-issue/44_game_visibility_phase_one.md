B"H

# Game Visibility Phase One — Reproduced Shared Root

Boruch Hashem. Blessed is He.

The Awtsmoos has reduced four distinct critical game codes to one current production contract failure: runtime state is transitioning correctly, but terminal/pause/result surfaces remain visible because authored CSS defeats hidden semantics.

## Live reproduced failures

- NES-1: `resultOverlay.hidden = true` during `startRun()`, yet Game Over remains visibly rendered after Try Again.
- ORO-1: `RoundOverlayView` adds `.hidden` during construction/reset, yet ROUND COMPLETE remains visible before and after Enter Asiyah.
- MIG-1: `game-over-screen` receives `.hidden` in the view constructor, yet `#game-over-screen { display:flex }` wins and The Gate Fell appears immediately.
- SHS-1: Resume calls `togglePause(false)` and sets `ss-overlay.hidden = true`, yet Paused remains visibly rendered.

## CSS evidence

- Neshama author CSS gives `.resultOverlay` a display layout that overrides native `[hidden]` behavior.
- Oros defines `.hidden { display:none }` in an earlier cascade layer, while later overlay layer rules restore display.
- Migdol defines generic `.hidden`, but the later/id-specific game-over selector has stronger display precedence.
- Shema uses native `hidden` state but current browser behavior proves authored layout keeps the pause surface visible.

## Shared vessel

All four affected pages load `/games/css/awtsmoos-game-base.css`. Their body elements do not consistently carry `.awt-game`, so the authoritative hidden-state rule cannot be scoped only beneath `.awt-game`.

NEXT_ACTION: prove a global hidden semantic inside the shared games-only stylesheet is safe, then add one cross-game regression rather than four simulation patches.
