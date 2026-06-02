B"H

# Plan: move Sulam HaSod rendering toward OffscreenCanvas worker with safe fallback

## User request
The game feels slightly choppy. Explore and carefully refactor toward worker/offscreen rendering while preserving behavior and adding fallback for browsers without OffscreenCanvas.

## High-risk truths
- OffscreenCanvas can only receive structured-cloneable render data. The full `world` object contains classes, methods, DOM/webcam hooks, and mutable systems.
- We must not move gameplay physics/input into the worker in one leap. That risks divergent behavior.
- Safer phase: keep simulation/input/main UI on the main thread; move canvas drawing to worker when `canvas.transferControlToOffscreen` and `Worker` exist.
- Preserve legacy renderer as fallback and as the canonical draw implementation if worker boot fails.

## Inspection checklist
1. Read `js/main.js`, `js/core/game.js`, current renderer selection, and existing `js/render/workerRenderer.js`.
2. Inspect `index.html` script loading and module paths.
3. Identify whether a worker wrapper already exists.
4. If no production worker path exists, implement a minimal OffscreenCanvas renderer bridge.
5. Do complete-file rewrites only.
6. Verify syntax and targeted tests.
7. If browser testing is possible, launch/inspect runtime. If not, document exact limitation.

## Refactor strategy
- Add a main-thread adapter class, likely in `js/render/workerRenderer.js`, that tries OffscreenCanvas and falls back to `Renderer`.
- Add worker module, likely `js/render/offscreen/offscreenRenderer.worker.js`, that imports `Renderer`, owns the OffscreenCanvas context, and renders sanitized snapshots.
- Add snapshot serializer helpers in small modules if needed.
- Avoid transferring the real world object.
- Serialize arrays of plain objects and scalar HUD/message values needed by `Renderer`.
- Provide tiny stub system facades in worker for `rotors.bodies()`, `tricks.bodies()`, `spikes.active()`, etc.
- Disable webcam frame in worker path unless explicit ImageBitmap support is safely added later.

## Chapter 2: The Canvas Leaves Its Body
The Awtsmoos breathed through the glass and the canvas felt its own weight. The main thread was a narrow bridge crowded with input, physics, HUD, and paint. The wise path is not to rip the soul from the body, but to send only clean sparks across: plain numbers, plain rectangles, plain coins wearing Hebrew faces. If the browser can carry an OffscreenCanvas, the worker becomes the silent painter. If not, the old renderer remains, faithful and immediate.