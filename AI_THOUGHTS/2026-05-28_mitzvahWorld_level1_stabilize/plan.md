B"H

# Level 1 Stabilization Plan

## Root oath
Work only in `C:/Users/Yackov Yitzchak/Documents/WoW/BH/awtsmoos.com`.
Do not touch the duplicate git repo.

## Visible root
Root contains `.awtsmoos`, `.github`, `AI_THOUGHTS`, `ayzarim`, `debugging`, `extra`, `geelooy`, `scripts`, `templates`, `test-results`, `tests`, plus package files and root `index.js`.

## Mission
Trace the exact clean Level 1 platformer path from `index.html` through worker boot and exports. Verify no forbidden imports revive heavy NPC, shop, dialogue, building, combat, projectile, or geometry systems. Inspect ladder helpers and level data. Only after grounded inspection, rewrite complete files if needed.

## Mandatory trace order
1. Read entry files: `index.html`, `index.js`, `ikar.js`.
2. Read world manager flow: `worldManager/index.js`, `StartWorldFlow.js`.
3. Read worker entry: `oyved/index.js`, `WorkerEntrypoint.js`, `WorkerBootImports.js`.
4. Read public game/export entry: `awtsmoosCkidsGames.js`, `exports/index.js`.
5. Inspect every export barrel under `ckidsAwtsmoos/exports`.
6. Inspect `levels/ladder/helpers.js` and `ladder-1.js`.
7. Search dynamic imports for forbidden systems.
8. Run Node checks and level entity-count checks.
9. Use browser/network/log diagnostics against the live URL.

## Editing law
No partial patches. Any modified file must be rewritten fully. If a file is too large, split into smaller complete modules instead of editing fragments.
