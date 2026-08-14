B"H
Boruch Hashem
Blessed is He

# Chess Verification Delta

Awtsmoos turns plan into proof; the delta is where hidden work becomes truth.

- All new/touched chess source files are below 120 lines; syntax and `git diff --check` pass.
- Realtime request-contract and lifecycle tests pass.
- Non-book endgame search: about 770 ms / 348k nodes while page rendering remained about 60 FPS, worst observed frame gap 18.4 ms.
- Warmed stalemate returns no move/0; mate-in-one returns f7-e8 / 99999 in about 9 ms.
- En-passant-state and quiet-endgame probes finish inside their requested budgets without observed state corruption.
- Fresh 390x844 menu appears in roughly 0.9-1.2 s, controls are at least 53 px, board 370x370.
- Real canvas e2-e4 reached AI thinking and completed an opening-book reply.
- Final 844x390 landscape: 294x294 board, no document overflow, zero console errors, zero HTTP >=400 responses.
- No independent `chess.js`/`python-chess` package was installed, so no third-party legality claim is made.
