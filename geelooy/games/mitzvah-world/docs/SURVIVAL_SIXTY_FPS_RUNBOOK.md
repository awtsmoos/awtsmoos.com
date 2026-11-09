// B"H
// Boruch Hashem
// Blessed is He

# Survival 60 FPS Runbook — Mitzvah World Chapter 4, Task 1

> **Status: UNMEASURED — needs real hardware.** Nothing in this runbook has been
> measured yet. The cloud browser has no WebGL and the MacBook Air is offline
> (last seen 211 hours ago), so no frame time in this repo is a real measurement.
> The profile and the recorder below are built and unit-tested; the numbers can
> only come from the 5-minute run on the MacBook Air or the Pixel.

## What this certifies

One survival run — one spawn chunk, the canonical Chossid, camera / movement /
collision, one directional light, essential HUD only — held at 60 FPS for
5 minutes of real movement. The acceptance bar:

| Check | Bar |
|---|---|
| p95 frame time | ≤ 16.7 ms |
| Frames inside 16.7 ms | ≥ 95% |
| Frames over 33.3 ms | < 1% |
| Frames over 50 ms | no recurring frame (at most 1) |
| Generation / upload slice | no slice over 4 ms |
| Render counts + heap | stable after travelling away and returning to spawn |

## 1. Open the game

Use the build that includes the Chapter 4 survival work (the build worker folds
the readable sources into the compact bundle — confirm the build is newer than
this runbook before running). Open one of these URLs:

**MacBook Air (2015) — DPR cap 1.0:**

```text
https://awtsmoos.com/games/mitzvah-world/?quality=survival&deviceClass=macbook-air-2015&survival60=1
```

**Pixel 6 Pro — DPR cap ~1.25:**

```text
https://awtsmoos.com/games/mitzvah-world/?quality=survival&deviceClass=pixel-6-pro&survival60=1
```

What the flags do:

- `quality=survival` — selects the survival profile (already flowed from the URL
  through the route handlers into the quality resolver before this task).
- `deviceClass=macbook-air-2015` / `pixel-6-pro` — named device-class DPR cap
  (1.0 / 1.25). Without it, survival defaults to DPR 1.0 on every device.
- `survival60=1` — starts the 5-minute recorder when the world loads. Without
  it, the game plays normally and nothing is recorded.

If you open the page locally instead of on awtsmoos.com, use the same query
string on your local game URL.

## 2. Wait for the world, then move for 5 minutes

1. Wait until the Chossid is visible and you can walk. The recorder starts
   automatically once the runtime is up; it runs for exactly 5 minutes.
2. **Move the whole time — standing still proves nothing.** Follow this pattern:
   - **0:00–2:00** — walk forward (W / up / joystick) away from spawn, turning
     gently. Cover ground; cross into the next stretch of the field.
   - **2:00–4:00** — turn around and walk back toward where you started.
   - **4:00–5:00** — stand at the spawn point and look around slowly. This last
     stretch is what the stability check compares against the start: counts and
     heap at spawn at the end must match counts and heap at spawn at the start.
3. Do not open menus, do not switch tabs, do not let the screen sleep. A hidden
   tab pauses animation frames and invalidates the run.
4. The recorder stops itself at 5:00. Do not close the page early — an early
   close loses the report.

## 3. Where the report appears

When the run ends, the frozen report is published at:

```js
window.AwtsmoosSurvivalSixtyFpsReport
```

In DevTools console, run:

```js
copy(window.AwtsmoosSurvivalSixtyFpsReport)
```

(`copy()` puts the JSON on the clipboard in Chrome.) Or print the short
paste-back block — if the recorder handle is present, this prints it:

```js
window.AwtsmoosSurvivalSixtyFpsRecorder.report
```

If `window.AwtsmoosSurvivalSixtyFpsReport` is `undefined`, the run did not
start: check that the URL has all three flags, that the build includes the
Chapter 4 work, and that the world actually loaded (`quality=survival` must
have taken effect — the world should look sparse: one field, no particles,
no water, no wildlife, no grass blades).

## 4. What to paste back

Paste the **short summary** first (it is the numbers that matter), then the
full JSON if asked for it. The summary looks like this (values are examples):

```text
SURVIVAL 60 FPS — 5-minute run
device class: pixel-6-pro / maxDpr: 1.25
frames: 17982 | p50: 12 ms | p95: 16 ms | worst: 41 ms
inside 16.7ms: 96.2% | over 33.3ms: 12 (0.1%) | over 50ms: 0
generation/upload slice max: 2 ms (chunkRuntime.diagnostics().lastProcess.longestTaskMilliseconds)
draws: 42 -> 43 | triangles: 9000 -> 9050 | meshes: 3 -> 3 | chunks: 1 -> 1 | textures: 1 -> 1 | heap: 104857600 -> 106000000
stable after return: YES
CERTIFIED: YES
unmeasured: none
```

Paste back, exactly:

1. The whole short summary block.
2. Whether the run was on the **MacBook Air or the Pixel** (and which browser).
3. Anything odd you noticed while moving (stutter you felt, a hitch when
   turning, the world popping in).

## 5. How to read the result

- **CERTIFIED: YES** — the survival profile holds 60 FPS on that device.
  Done for that device; run the other device next.
- **CERTIFIED: NO** — read the `failures:` line; it names the exact breach
  (`FRAME_P95_OVER_16_7_MS`, `FRAMES_INSIDE_16_7_BELOW_95_PERCENT`,
  `LONG_FRAME_RATE_AT_OR_ABOVE_1_PERCENT`, `REPEATED_FRAME_OVER_50_MS`,
  `GENERATION_SLICE_OVER_4_MS`, `RENDER_COUNTS_UNSTABLE_AFTER_RETURN`).
- **Pixel p95 fails but MacBook passes** — the Pixel ran at DPR 1.25; re-run
  the Pixel with `deviceClass=macbook-air-2015` (DPR 1.0) to confirm the DPR
  lever fixes it. That tells us the Pixel cap should be 1.0, not 1.25.
- **`GENERATION_SLICE_UNSUPPORTED` in failures** — expected on the current
  build: the live boot path does not wire the chunk runtime, so no
  generation/upload slice source exists yet. The frame verdict is still real;
  the 4 ms slice check stays unproven until chunk streaming (Chapter 4,
  Task 3) wires a slice source. Do not treat this line as a frame failure.
- **`STABILITY_UNMEASURED` / heap `n/a`** — expected on Safari/Firefox:
  `performance.memory` is Chrome-only, so heap is unmeasurable there. The
  counts (draws/triangles/meshes/chunks/textures) still judge stability.
  If `draws`/`triangles` are also `n/a`, the renderer exposed no counters —
  paste that back as-is; it is a real finding, not a bad run.
- **`uploads` in the report** — the custom renderer exposes no per-frame GPU
  upload counter, so the report records chunk-queue uploads (`uploadsPending`,
  `uploadsDeferred`) and GPU texture/geometry counts instead, and says so
  plainly. A null there means "no source", never "zero uploads".

## 6. Files behind this run

- Profile: `geelooy/games/mitzvah-world/experiments/Awtsmoos/src/performance/SurvivalSixtyFpsProfile.js`
- Recorder: `geelooy/games/mitzvah-world/experiments/Awtsmoos/src/performance/SurvivalFrameRecorder.js`
- Policy (gates + DPR caps): `geelooy/games/mitzvah-world/experiments/Awtsmoos/src/performance/SurvivalQualityPolicy.js`
- DPR resolution: `geelooy/games/mitzvah-world/experiments/Awtsmoos/src/performance/WorldQualityProfile.js`
- Survival scene (`survival-spawn`): `geelooy/games/mitzvah-world/experiments/Awtsmoos/src/performance/RuntimeAcceptanceScenes.js`
- Boot wiring (auto-start on `?survival60=1`): `geelooy/games/mitzvah-world/experiments/Awtsmoos/src/app/EretzStagedRuntime.js`,
  `geelooy/games/mitzvah-world/experiments/Awtsmoos/src/app/MinimalMeadowRuntimeCore.js`
- Tests: `SurvivalQualityPolicy.test.js`, `SurvivalSixtyFpsProfile.test.js`,
  `SurvivalFrameRecorder.test.js` — 32 tests, all passing in the VM
  (`node --test` on those four files incl. the release-probe metrics test).
