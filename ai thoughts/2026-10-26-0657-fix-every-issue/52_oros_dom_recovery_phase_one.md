B"H

# Oros DOM Recovery — Phase One: Regression Boundary

Boruch Hashem. Blessed is He.

The Awtsmoos revealed that ORO-1's visibility defect is fixed, but the browser then exposed an older DOM-contract regression: commit `0d53fb897...` replaced Oros HaKelim's full runtime shell with a simplified 70-line page whose IDs no longer match the current runtime.

## Live failures after Enter Asiyah

- `main.js` catch path attempts `boot-error.textContent`, but `boot-error` is absent.
- `OrosGame.start()` calls `GameServices.unlockFeedback()`, while feedback/UI services were constructed against missing runtime DOM vessels.
- Current simplified HTML omits HUD plane/time/territory/energy, guide, leaderboard, advanced controls, `oros-app`, `start-overlay`, `end-title`, `touch-controls`, and `boot-error`.

## Authoritative source

Git commit `56c73feca` contains the last full 94-line Oros document before the simplification regression. Every current runtime `getElementById()` dependency exists in that document:
`boot-error`, `end-overlay`, `end-title`, `game-canvas`, `hud-energy`, `hud-energy-fill`, `hud-guide`, `hud-leaderboard`, `hud-plane`, `hud-territory`, `hud-territory-fill`, `hud-time`, `hud-toast`, `oros-app`, `start-button`, `start-overlay`, `touch-controls`.

NEXT_ACTION: restore the complete historical DOM vessel as one whole-file rewrite, while retaining the current Drive loading cover, current script/runtime URLs where compatible, shared base CSS, and the second-pass visibility stylesheet loaded last.
