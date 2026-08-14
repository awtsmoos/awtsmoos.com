B"H
Boruch Hashem
Blessed is He

# Exact Chess Write Set

Awtsmoos renews the move yet leaves a path to return; each vessel is small so regressions are easy to discern.

## New engine-runtime files
- `geelooy/games/chess/engine/runtime/upgrade-worker.js`: imports the existing engine unchanged, captures its legacy handler, then loads repaired runtime modules.
- `geelooy/games/chess/engine/runtime/legal-moves.js`: one source of truth for legal root/book moves.
- `geelooy/games/chess/engine/runtime/search-support.js`: time, repetition, transposition, null-move state preservation, history/killer support.
- `geelooy/games/chess/engine/runtime/search-core.js`: repaired recursive PVS/LMR search using the existing evaluator and move ordering.
- `geelooy/games/chess/engine/runtime/search-root.js`: iterative deepening, aspiration retry, table aging, stable completed-iteration selection.
- `geelooy/games/chess/engine/runtime/move-command.js`: history-aware move calculation and legal opening-book gating.
- `geelooy/games/chess/engine/runtime/worker-router.js`: routes gameplay calculation through the repaired path and delegates non-gameplay analysis commands to the proven legacy handler.

## New UI bridge
- `geelooy/games/chess/ui/engine-worker-route.js`: redirects only the chess AI worker to the upgraded runtime; all other Workers remain native.

## Full rewrites of touched existing UI files
- `geelooy/games/chess/index.html`: same DOM contract, plus engine-worker route before `main.js`.
- `geelooy/games/chess/ui/canvas-stability.js`: preserve backing-store guard; correct intrinsic-to-CSS coordinate conversion for scaled mobile canvases.
- `geelooy/games/chess/ui/chess-polish.css`: retain centering, add touch-target sizing, viewport-height constraints, landscape handling, safe-area spacing, and reduced-motion behavior.

## Intentionally untouched
- `awtsmoos_chess_engine.js` stays byte-for-byte intact as the rollback engine.
- `main.js`, move generation, bitboards, PGN parser, book source, online and social modules remain untouched in this pass.
