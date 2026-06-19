B\"H

# First Pass Brainstorm: Awtsmoos Park Engine Becomes A 2D Cartoon Animation Generator

The screen shows a city stage and a console rupture: `Cannot read properties of undefined (reading 'wide')` inside `CameraRigRegistry.normalizeSpec`. The first covenant is evidence: inspect real files, trace runtime, fix the root path, and do not pretend the visible crash is the whole beast.

## Possibilities opened

1. The camera registry assumes every camera spec has a `safeFrame` or `viewport` object with `wide`, but scene/bootstrap passes an incomplete preset.
2. A mobile viewport path produces a camera ratio before canvas metrics exist.
3. The NLE track manager invokes a camera transition with a symbolic name that resolves to undefined.
4. The cartoon generator goal requires a durable architecture beyond the crash: prompts, scene schema, characters, camera shots, motion beats, dialogue, keyframes, timeline, preview, export.
5. The existing editor may already contain tabs/workspaces/vibe AI pieces, so we must read before replacing.
6. The immediate fix should be small and verified, but the plan should chart the large future.

## The ocean of feature futures

The full generator can become a browser-only 2D animation system: AI receives a text idea, returns a strict JSON scene plan, the engine validates it, packs it into a 2-second cartoon, animates actors with keyframes, camera moves, subtitles, props, backgrounds, and style presets. It can operate offline with templates and optionally with an API provider. It should be modular: scene schema, prompt compiler, timeline solver, renderer bridge, export adapter, validation, and UI panels.

## Evidence needed next

Read index, package, core main, camera registry, NLE system, manager, and any AI provider files. Then write improved plans. Then rewrite whole touched files only.
