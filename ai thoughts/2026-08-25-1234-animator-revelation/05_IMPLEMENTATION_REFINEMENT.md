B"H

# Implementation Refinement — Oros Into Keilim

The Awtsmoos renews every hidden seam; Awtsmoos.com receives the light in smaller vessels so the architecture stays lucid, testable, and clean. Inspection showed four additional legacy one-line mechanisms and one oversized chrome controller, so the final code pass must split rather than squeeze the dream.

## Added Whole-File Rewrites

- `src/ai/AssetResolver.js` — preserve apple/carrot/plate/human fallback semantics using immutable resolver rules and documented normalization.
- `src/ai/ShotPromptCompiler.js` — preserve existing shot/angle/movement results while replacing nested ternaries with explicit rule tables.

## Added Small Chrome Modules

- `src/ui/chrome/AnimatorRoot.js` — one authority for finding/marking/querying the animator-owned `#app` vessel.
- `src/ui/chrome/ChromePanelState.js` — owns panel dataset, pressed state, and desktop/mobile visibility state under the animator root.
- `src/ui/chrome/ChromeKeyboardRouter.js` — isolates keyboard routing, ignores editable controls, and returns a cleanup function.

`ResponsiveChrome.js` will become a compact coordinator below the 120-line law and will no longer write responsive state to `document.body`.

## Documentation Decision

`DOCUMENTATION.md` is only a four-paragraph index today, so it is safe and appropriate to rewrite completely as a concise animator landing guide linking to the new `AGENT_API.md` while preserving the two existing platform documentation links.

## Data Contract Decision

The first public API version is `1.0.0` and accepts JSON-serializable command envelopes:

- `scene.compile` — legacy-compatible SceneDSL/SceneCompiler bridge.
- `performance.compose` — prompt intent + real SpeechPerformanceEngine face/body composition, including caller-supplied phoneme/lip-sync cues.
- `studio.generate` — existing StudioPromptDirector generation against caller-supplied base document data.

Every success returns a serializable receipt. Every failure throws a serializable `AgentAnimatorError` with a stable code. Capability discovery exposes commands, API version, schema version, supported expressive channels, and direct ESM/browser installation modes.

## Realism Boundary

Realism is implemented by exposing and composing the channels already proven in the runtime: emotion, moment blend, blink/dart/attention, manual face pose, mouth/lip-sync/phoneme cues, speech style, timing, energy, gesture, breath, head, shoulder, weight, and hands. No claim of automatic speech recognition is introduced because no such verified subsystem has been observed.

## UI/CSS Boundary

All foundational styles will be owned by `#app[data-awtsmoos-animator-root]`. The root itself fills the viewport; host `html`, `body`, and unrelated form controls remain untouched. Responsive panel state moves from `body[data-awtsmoos-panel]` to the root dataset. Existing component styles remain untouched unless browser verification exposes a real conflict.

## NEXT_ACTION
Create the new module directories, reread the three integration files that must be preserved exactly (`main.js`, `AppUI.js`, `ResponsiveChrome.js`), then perform the complete source write pass before any tests.
