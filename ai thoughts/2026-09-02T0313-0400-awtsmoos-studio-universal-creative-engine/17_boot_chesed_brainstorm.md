B"H
Boruch Hashem
Blessed is He

# Boot Chesed — The Small First Light

> The Awtsmoos reveals the Canvas first, while deeper chambers wait beyond the door;
> Awtsmoos.com lets intention summon only what is needed, never making the phone download more.

## Full Possibility Map
- One `StudioFeatureLoader` instance becomes the transient owner of every optional feature chamber.
- Canvas boot retains only state, canonical creative runtime, Stage essentials, transforms, minimal scene list, canvas sizing, and lightweight human intent.
- Recording, Audio Lab, Timeline/NLE, Sources, Visualizer, Live/HLS, Setup/providers, Commands & History UI, benchmark, Movie AI, and deep Stage Workstation load only after explicit or visibility-based intent.
- Page navigation already calls `featureLoader.loadForPage(page)` and therefore becomes the activation boundary for Audio, Sources, Live, Setup, Timeline, and More.
- `StudioRecordingDemand` owns the first Record click and invokes the lazy recording feature.
- `StudioIntentPrefetch` warms likely chambers without activating them.
- `StudioMovieAiDemand` exposes a public feature facade and explicit Movie AI request event.
- `StudioPostCanvasWarmup` may warm the visible desktop Stage workstation only after critical Canvas readiness.
- Commands and semantic history runtime stay lightweight and available before the richer Commands & History cards.
- Keyboard undo/redo remains available before the More workspace exists.
- Feature failures remain contained to their room instead of preventing Canvas boot.
- The initial module graph should stop importing recorder, audio analysis, NLE, HLS, provider, benchmark, and expert UI implementations.

## Competing Architectures
A. Delete stale recording import only — rejected: boots but leaves the lazy architecture unowned and optional controls inconsistent.
B. Re-export a fake `bindRecordingControls` — rejected: restores eager recording and violates startup law.
C. Instantiate loader but keep all eager optional imports — rejected: duplicate initialization and no performance gain.
D. Move every system lazy in one giant boot rewrite — too risky if a feature initializer lacks parity.
E. Use the existing loader and migrate only chambers with complete tested initializers, leaving true Canvas essentials eager — selected.
