B'H
# Gevurah plan: Ohr HaGnuz click-walk and crunchy CSS

Root seen: `/storage/emulated/0/Documents/git/awtsmoos.com`.
Target: `geelooy/games/ohr-hagnuz`.
Visible project: game has `index.html`, `src/atzmus`, `src/binah`, `src/asiyah`, `src/chochmah`, `src/data`, and many modular map/dialogue/entity files.

## Exact error from screenshot
`Uncaught ReferenceError: __camSmooth is not defined` at `Projector.js:43`, called from `Projector.cam`, `Projector.drawWorld`, and `Projector.project`.

## Grounded work plan
1. Read the exact rendering, input, pathfinding, movement, engine, CSS, and boot files.
2. Reproduce with syntax/runtime checks if possible.
3. Fix only by complete-file rewrites, never partial patches.
4. Make click-to-walk pathfinding robust: pointer-to-tile projection, path request, player movement stepping, blocked tile checks, and diagnostic test.
5. Improve mobile/desktop CSS in the actual shell: responsive canvas layout, crisp-but-not-crunchy scaling, touch-action correctness, readable UI.
6. Verify with real commands: grep for broken references, node syntax/import checks, and isolated path behavior if browser unavailable.

## Safety
No secret files. No destructive commands. No partial edits. Every modified file is rewritten fully.