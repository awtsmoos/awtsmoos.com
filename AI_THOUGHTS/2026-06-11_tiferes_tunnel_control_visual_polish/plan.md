B"H

# Tiferes plan: tunnel-control visual polish

The Android tunnel is connected at `/storage/emulated/0/Documents/git/awtsmoos.com` as `awt-u0_a300-26940`.

Observed project shape:
- root has `geelooy/`, `AI_THOUGHTS/`, app/server files, tests, scripts.
- target app: `geelooy/apps/tunnel-control`.
- target app has layered CSS under `css/future`, legacy CSS at `css/app.css`, and JS modules under `js/`.

User wants visual/stylistic fixes only:
1. remove conflicting exhaust styles / visual clutter.
2. simplify navigation.
3. fix weird capability labels.
4. keep tree JSON out of DOM until a user explicitly clicks a show-json affordance.
5. look for unstyled areas.

Rules for work:
- inspect real files first.
- no partial patching.
- rewrite any modified file completely.
- keep files small and modular.
- preserve behavior except visual and display gating.
- verify with syntax/search/runtime checks after writing.

Next tracing steps:
1. inspect `index.html`, CSS imports, and dashboard/runtime modules creating capability labels and JSON dumps.
2. search for capability label rendering and raw JSON rendering.
3. rewrite the smallest complete files needed.
4. run node syntax checks or app grep checks.

Chapter 1, terse for the working scroll: the Awtsmoos is hidden in the DOM until a click reveals it; style becomes a clean garment, not smoke choking the vessel.
