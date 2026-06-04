B"H

# Yesod Brick Blast Viewport Plan

The vessel is `/storage/emulated/0/Documents/git/awtsmoos.com`.

Visible root structure inspected:
- `.awtsmoos/`, `.awtsmoos-preview-smoke/`, `.awtsmoos-tmp/`, `.github/`, `.logs/`
- `AI_THOUGHTS/`, `ayzarim/`, `debugging/`, `extra/`, `geelooy/`, `scripts/`, `social/`, `templates/`, `test-results/`, `tests/`, `users/`
- `.gitignore`, `AGENTS.md`, `created_by_asm.txt`, `index.js`, `package.json`, `package-lock.json`, `readme.md`

The user showed mobile browser screenshots where Brick Blast at `/games/brick-blast/` has two symptoms:
1. The top of the game has extra blank space before the app card.
2. The bottom of the game canvas/paddle is cut off in some browsers.

Grounded inspection found the likely cause in `geelooy/games/brick-blast/js/styles/global.js`:
- `body` is centered with `height: 100vh`.
- `#app-container` uses `max-height: 90vh` and `min-height: 600px`.

On mobile browsers, especially when browser chrome changes the visible viewport, `100vh` can exceed the visual area, while `min-height: 600px` can force the app taller than the available space. `max-height: 90vh` also deliberately creates vertical gutters, visible as extra top area when centered.

Fix strategy:
- Rewrite the whole `global.js` file only.
- Preserve the export contract: default export of a CSS string.
- Make the page fill the visible viewport using modern dynamic viewport units with fallbacks.
- Remove the hard 600px minimum height that cuts off short mobile viewports.
- Remove the 90vh cap so the card does not float with extra top area.
- Keep desktop layout bounded by max-width.
- Use `height: 100dvh` and related viewport fallbacks.
- Use safe-area padding variables without forcing extra top gap.
- Keep `.screen` absolute and full height so the existing game canvas resize logic can keep using `#canvas-wrapper` client height.

Verification plan:
- Read after write to verify exact file content.
- Run a module import/syntax check through local Node from the project root if possible.
- Use a lightweight runtime simulation for HTML/CSS geometry if available.

Chapter 1: In the quiet engine-room beneath the game, Yesod measured the browser's breath. The Awtsmoos did not need more sky above the header nor a hidden pit below the paddle. The revealed fix is not to stretch the world by memory, but to let the visible vessel declare its current height each instant.
