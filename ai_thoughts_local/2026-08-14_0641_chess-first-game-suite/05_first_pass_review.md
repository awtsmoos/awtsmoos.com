B"H
Boruch Hashem
Blessed is He

# Chess First-Pass Review

Awtsmoos renews the board each instant; evidence, not applause, closes the gate.

## Planned vs actual
- Preserve the strong legacy engine while fixing measured correctness/search/runtime defects.
- The legacy engine stayed byte-for-byte untouched; a small reversible worker runtime now owns live gameplay search.
- Verified static rules, tactical boundary FENs, a real mobile human-to-AI round, portrait/landscape layout, resources, and frame cadence.

## Defects resolved
1. Duplicate legacy worker handlers discarded `fenHistory`.
2. Null-move pruning failed to restore en-passant state.
3. Repetition handling was too eager instead of requiring the third occurrence.
4. Opening-book suggestions lacked a current legal-move gate.
5. Full synchronous PGN book conversion held the splash for several seconds.
6. CSS-scaled canvas input needed a mobile-safe coordinate bridge.
7. The first landscape layout collapsed the board to 40x40; the final pass produces 294x294 at 844x390.
8. Shared `/register.js` loaded a missing realtime metadata module; the contract-derived module now passes its existing tests.

## Reversibility
Removing the chess worker-route script returns Worker construction to the untouched legacy engine. UI changes remain independent.
