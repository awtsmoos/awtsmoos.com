B"H

# Canonical API and Root Convergence

The Awtsmoos is one beyond division, and Awtsmoos.com should not force an agent to choose between two nearly identical gates. Live inspection revealed a newer, stronger canonical `src/ai/agent` layer bound to the shared NLE store, plus a Creator Dock and expression/motion vocabularies. Therefore the parallel `src/ai/api` draft becomes technical debt and must be retired after proving it is unreferenced.

## Canonical Agent Contract

Keep and deepen `src/ai/agent`:

- `project.snapshot`
- `project.previewPrompt`
- `project.applyPreview`
- `project.discardPreview`
- `scene.compile`
- `performance.compile`
- `performance.compose`
- `animation.planPasses`

`performance.compose` must invoke the real `SpeechPerformanceEngine`, accepting caller-supplied `speech`/`text`, progress/time/duration, emotion, moment, energy, speech style, gesture, gaze-related face data, manual face/mouth data, `lipSyncCues`, and `phonemeCues`. Prompt-derived intent may fill defaults but never overwrite explicit caller precision.

`scene.compile` must use the legacy-compatible `SceneDSL` and `SceneCompiler` so agents can create deterministic entity data without touching DOM or editor internals.

Capabilities must advertise actual expression names, motion names, speech styles, cue formats, API version, protocol, command schemas, and the preview-before-mutation covenant.

## Root Ownership

Create `src/ui/chrome/AnimatorRoot.js` as the single authority for `#app[data-awtsmoos-animator-root]`.

Create small chrome helpers:

- `ChromePanelState.js` — root-scoped panel state and button pressed/active synchronization.
- `ChromeKeyboardRouter.js` — keyboard handling with editable-target protection and cleanup.
- `ChromePlaybackView.js` — root-scoped play/pause affordance synchronization.

Rewrite `ResponsiveChrome.js` as a compact coordinator only.

`AppUI.setup()` marks the root before generating shell content.

`CreatorDock.mount()` appends beneath the animator root, never `document.body`.

## CSS Isolation

Rewrite `tokens.css`, `reset.css`, and `responsive.css` so every selector is rooted beneath `#app[data-awtsmoos-animator-root]`. The animator root itself becomes a fixed viewport vessel, eliminating the need to style host `html` or `body`.

Also prefix all Creator Dock style modules with the animator root so even their unique data attribute cannot leak into a host page.

## Technical Debt Closure

After canonical files are written, search for references to `src/ai/api`. If none exist, delete the entire duplicate directory rather than keeping two public philosophies alive.

## NEXT_ACTION
Write the canonical agent API upgrades and root/chrome modules completely, then rewrite integration and scoped CSS, then documentation, then begin tests and browser verification.
