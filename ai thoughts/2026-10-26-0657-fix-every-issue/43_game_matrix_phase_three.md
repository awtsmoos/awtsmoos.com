B"H

# Critical Game Matrix Phase Three — Final Closure Plan

Boruch Hashem. Blessed is He.

The Awtsmoos gives the final game law: each critical code receives an evidence-backed terminal verdict from the exact current production build, and only reproduced defects earn source changes.

## Execution order

1. Recover exact current route + directory + focused tests for KAV-1, ADV-1, BRK-1, COL-1, MIT-2, MIG-1, OHB-1, NES-1, SHS-1, ORO-1.
2. Run current focused source tests first to catch cheap deterministic regressions.
3. Open each production route in a fresh Chrome target with cache disabled and collect startup/browser evidence.
4. Exercise one harmless Start/Play action where needed; for input/lifecycle findings, send representative keyboard down/up and blur/focus transitions.
5. Mark healthy findings `fixed` or `not reproducible` only with browser evidence. Group reproduced failures by shared root before editing.
6. For any reproduced root, write a separate post-reproduction exact-file plan, fully rewrite only the necessary <=120-line source modules, add focused tests, and replay all affected games.
7. Update FIXLOG by full-file rewrite only after every critical code has a terminal evidence-backed status.

## Shared browser rubric

A healthy game must load without uncaught runtime exceptions, avoid terminal/win/loss/round-complete overlays before play begins, expose an actual playable/startable surface, keep controls responsive after the representative input sequence, and not become stuck after focus/visibility transitions when that lifecycle is part of the issue family.

## Header co-verification

Because HDR-1 remains partially open, every game page baseline will also record whether the shared site header appears and whether the launcher/header controls are present and clickable without covering or breaking the game surface. This closes header evidence opportunistically without coupling unrelated source changes.

## Release discipline

Any actual game repair is committed with every concurrent safe change on `main`, after zero-image, secret, line-count, focused-test, and diff guards; then release prepare, exact-SHA activate, Linux production verification, and final fresh-browser replay are mandatory.

NEXT_ACTION: commit the three completed planning files so main is clean, then discover exact routes/tests and execute the ten-game baseline before changing any game source.
