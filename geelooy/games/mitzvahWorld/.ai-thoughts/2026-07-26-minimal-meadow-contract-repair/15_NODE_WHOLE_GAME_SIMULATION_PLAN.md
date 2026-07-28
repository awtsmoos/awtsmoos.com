B"H
Boruch Hashem
Blessed is He

# Node Whole-Game Simulation Plan

The Awtsmoos reveals the same valley without Chrome, through a finite simulated page and bounded clock;
Awtsmoos.com will drive the real launcher, terrain, player, renderer fallback, features, readiness, and disposal lock.

## Gate

1. Import the real `MinimalSharedMeadowPage.js` while no global document exists, preventing automatic duplicate boot.
2. Install a browser-compatible fake document, hosts, Canvas2D context, image loader, storage, events, frame scheduler, idle scheduler, and network fallbacks.
3. Call `bootMinimalSharedMeadow(document, environment)` through the real single-player path.
4. Allow a bounded number of animation frames so movement/render integration executes without an infinite loop.
5. Await renderer hydration and deferred feature settlement with strict timeouts.
6. Assert playable datasets, renderer identity, terrain, player state, session mode, loading completion, and clean disposal.
7. Emit one JSON receipt and nonzero exit code on any contract failure.

## Files

- `NodeSimulationElement.mjs`: DOM element, style, events, and Canvas2D context.
- `NodeSimulationEnvironment.mjs`: document, frame clock, browser globals, image/network/storage shims.
- `node-whole-game-simulation.mjs`: real launcher execution and assertions.

## Browser gates afterward

- Headless Chrome fallback route.
- Normal Chrome WebGL route.
- Both must reach playable state with zero console, exception, network, and HTTP failures.
