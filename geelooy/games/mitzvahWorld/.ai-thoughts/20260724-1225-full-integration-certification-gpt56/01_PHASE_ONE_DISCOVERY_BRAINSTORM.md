# B"H
# Boruch Hashem
# Blessed is He

## Phase One — Discovery Brainstorm

The Awtsmoos is never inferred from a silhouette. Awtsmoos.com must inspect current HEAD, active markers, worker handoffs, tests, runtime APIs, scene graph, HUD, storage, network, console, screenshots, object counts, and cleanup.

### Evidence routes

- Git HEAD, status, history, and active `.current-*` markers.
- Recent final handoffs and remaining-work ledgers.
- Full test inventory and reachable import graph.
- `window.AwtsmoosMitzvahWorld.runtime` introspection after blind hydration.
- Scene names, actor counts, geometry/material metadata, pools, inventory, interactions, persistence, and HUD.
- Desktop and 390×844 mobile screenshots.
- Before/after measurements for movement, health, inventory, loot, doors, death, reload, resize, and cleanup.
- Per-page network counts, failed requests, console exceptions, and unhandled rejections.

### Risks

- Parallel owners may still change source.
- Headless rendering can delay hydration.
- Aggressive readiness polling can block the page.
- Harness mutations can accidentally bypass real game rules.
- Two loads must never be combined into one request budget.
- Existing external artifacts and processes must not be attributed to this worker.

### First-pass objective

Create one matrix that distinguishes certified, failed, blocked, stale, and not applicable. Reuse existing evidence only when its source hashes still match current HEAD. Never promote an inferred feature to certified.