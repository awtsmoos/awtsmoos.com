B"H
Boruch Hashem
Blessed is He

# Chess-First Discovery Map

Awtsmoos renews the board from square to square; this note keeps the work grounded, measured, and fair.

## User outcome
- Improve chess strength without casually destroying a currently-good engine.
- Improve chess UI/UX, especially mobile interaction and perceived smoothness.
- Verify real play, errors, responsiveness, and regression risk.
- Only after chess is proven, continue through the rest of the games suite.

## Observed project surface
- Chess root: `geelooy/games/chess/`.
- Engine entry: `awtsmoos_chess_engine.js`.
- Supporting chess logic: `bitboard-helpers.js`, `helpers.js`, `grandmaster_library.js`, `punishment_library.js`, `teachings.js`.
- UI/runtime entry: `index.html`, `main.js`, `style.css`, plus `ui/`, `online/`, `social/`, and `debug/`.
- Root game suite contains many additional games; they remain downstream until chess passes its completion gate.

## Evidence rules
- Preserve current public imports/exports and existing user-visible behavior unless the requested improvement requires a change.
- Read call sites before engine changes.
- Measure baseline behavior before judging strength or performance.
- Prefer reversible, modular changes over one large engine rewrite.
- Keep search correctness separate from presentation changes.

## Completion evidence for chess
- Syntax/static checks pass on every touched source file.
- Existing tests and chess-specific tests pass.
- Engine returns legal moves under normal and tactical positions.
- Browser path loads without console errors.
- Mobile viewport is usable without overflow or tiny controls.
- Human-vs-engine play can progress through a representative game flow.
- Performance instrumentation shows responsive interaction and no obvious loading stalls.

## Remaining work
1. Inspect chess source, subdirectories, call graph, tests, and git state.
2. Establish engine baseline and identify concrete tactical/search weaknesses.
3. Research relevant engine techniques and clarify the user’s likely reference to strong real/master games.
4. Implement the smallest high-value engine improvements in new focused modules where needed.
5. Improve mobile-first board/control UX without coupling it to engine logic.
6. Run static, engine, browser, and play-flow verification.
7. Re-read all touched files and compare planned vs actual.
8. Only then inventory and improve the remaining games.
