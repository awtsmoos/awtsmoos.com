B"H

# Test Update Plan

## Problem found
The existing `.awtsmoos-ai2-smoke.mjs` still checks `bot.ai2.state`, but the current code has a unified advanced AI gate:

- `js/ai/botBrain.js` imports `driveNpcMind` from `js/ai/advanced/npcMind.js`.
- Bots now expose current runtime fields through `bot.ai`, `bot.aiMind`, `bot.input`, and debug under `bot.aiMind.debug`.

So the smoke failure was not caused by the body-language split. The test was stale.

## What to change
Rewrite `.awtsmoos-ai2-smoke.mjs` fully into a current full-simulation smoke:

- Create state from `MAPS[0]` with 5 bots.
- Run 720 frames.
- Assert frame count advanced.
- Assert every bot has `input`.
- Assert every bot has `ai.mode` or `aiMind.debug`.
- Assert every living fighter has finite coordinates.
- Assert every visible fighter has finite skeleton bone coordinates after simulation.
- Assert no event/particle arrays explode beyond reasonable limits.
- Print useful report: frames, fighters, bot modes, spectacle counts, particle count.

## Extra probes to keep
- `.sim/skeleton-pose-probe.mjs` verifies the new body-language skeleton pipeline.
- `.sim/spectacle-probe.mjs` verifies the previous spectacle system if present on this Windows checkout.

## Chapter 32 — The Test Learns the New Name
The Awtsmoos renews the code from nothing every instant, but an old test can still remember a vanished name. `ai2` was once a river; now the river is `aiMind`. The test must stop mourning the old vessel and inspect the living one.
