# B"H

Boruch Hashem

Blessed is He

# Peruta Run Full Playthrough Harness

The Awtsmoos renews player, browser, command, collision, texture, interface, and evidence before one automated run may call the game known;
Awtsmoos.com lets the harness travel through public vessels only, so a green report means the same road available to a real player was shown.

## Purpose

This developer harness cold-boots Peruta Run in isolated Chrome DevTools targets and simulates the complete game lifecycle while preserving durable evidence.

It is intentionally separate from gameplay runtime ownership. It does not mutate Three scene nodes, world chunks, collision internals, mission state, or renderer objects.

## What it proves

- public API boot and capability discovery;
- lane movement through public commands;
- jump collision-body elevation;
- duck collision-body state;
- physical keyboard lane controls;
- advanced drawer visibility, pause ownership, focus loop, and focus return;
- mobile UI bounds, overlaps, horizontal overflow, and 48px target covenant;
- real photographic texture hydration and cache/queue state;
- obstacle-aware survival through avoid/jump/duck laws;
- themed obstacle-family exposure;
- moving-obstacle evidence;
- intentional collision and game-over UI;
- deterministic restart recovery;
- long-run chunk recycling and renderer resource-count stability;
- semantic public events versus actual progression state;
- requestAnimationFrame cadence;
- screenshots of initial play, advanced UI, survival, game over, and final recovery.

## Run

The default route is served from local port `8766` and Chrome debugging port `9222`.

```bash
node geelooy/games/mitzvahWorld/subwaySurfer/dev/playthrough/run-playthrough.mjs mobile
```

Run both default profiles:

```bash
node geelooy/games/mitzvahWorld/subwaySurfer/dev/playthrough/run-playthrough.mjs
```

Environment overrides:

- `PERUTA_URL`
- `PERUTA_CDP_PORT`
- `PERUTA_OUTPUT`

## Default profiles

### Mobile

- 390×844
- DPR 2
- explicit `quality=mobile`
- deepest long-run recycle window
- enforces 48px visible interactive targets

### Desktop

- 1440×900
- DPR 1
- explicit `quality=balanced`
- repeats controls/modal/realism/game-over path with a shorter recycle window

## Artifact tree

Each profile writes:

- `report.json` — raw structured evidence;
- `report.md` — severity-grouped human notes;
- `initial.png` — first playable world/UI;
- `advanced.png` — open advanced drawer;
- `survival.png` — active survived world;
- `game-over.png` — terminal collision UI when game-over is reached;
- `final.png` — post-restart/long-run final state.

The suite root also writes `suite.json`.

## Evidence law

Severity is intentionally conservative:

- `BLOCKER`: cannot boot/control/game-over/restart or uncaught runtime exception;
- `MAJOR`: API contract divergence, unfair/nonfunctional lifecycle, texture failure, viewport escape, sub-48px mobile target, suspicious resource growth;
- `MEDIUM`: weaker semantic coverage, overlap candidate, focus/polish issue;
- `MINOR`: pure polish opportunity.

A finding is never hidden merely because the orchestration continues. The profile runner persists its report even when a scenario throws.

## Extending scenarios

Prefer adding one focused scenario module rather than growing `PlaythroughJourneyScenario` into a monolith.

New scenarios should:

1. act through public API or real DOM/keyboard input;
2. observe through `HodPlaythroughEvidence`;
3. write raw checkpoints before interpreting them;
4. add findings through report/policy helpers;
5. remain renderer/runtime agnostic unless the feature specifically requires a new public diagnostic projection.

## Realism review

Numeric evidence cannot judge every visual quality. Always inspect the saved screenshots after a run for:

- camera framing;
- Chossid scale/readability;
- obstacle silhouette clarity;
- photographic material presence;
- large flat-color fields;
- tree realism;
- repeated geometry;
- fog/lighting contrast;
- UI visual hierarchy and clipping.

If screenshots reveal a defect that diagnostics cannot express, record the note and add the smallest new evidence channel only when it will remain useful for future runs.
