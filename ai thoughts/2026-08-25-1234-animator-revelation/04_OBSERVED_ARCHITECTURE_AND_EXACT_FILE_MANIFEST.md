B"H

# Observed Architecture and Exact First Implementation Manifest

The Awtsmoos renews the fact before the plan may wear a crown; Awtsmoos.com is already an immense animator, so this pass refuses to build a duplicate town. We strengthen the narrow bridges actually missing: agent orchestration, explicit expressive data, and one locally-owned responsive root where styles come down.

## Observed Facts

- The app already contains mature camera, staging, character, dialogue, NLE, export, Studio, performance, and verification systems.
- `SpeechPerformanceEngine` already composes face and body output from a shared input.
- `StudioPromptDirector` already emits editable characters, environments, cameras, dialogue clips, gaze, emotion blends, gesture intensity, and secondary motion.
- `SceneDSL`, `SceneCompiler`, and `PerformancePromptCompiler` are tiny one-line legacy AI surfaces with almost no documentation.
- `SceneDSL`/`SceneCompiler` are referenced by only `tools/verify/all18PhasesSmoke.js`; production Studio generation uses `StudioPromptDirector` through `StudioPromptWorkflow`.
- There is no coherent stable public agent API discovered under `src/`.
- `AppUI` owns `#app`, while `ResponsiveChrome` currently installs chrome and responsive state onto `document.body`.
- Styles are impressively modular through `src/index.css`, but `base/reset.css`, `base/tokens.css`, and `mobile/responsive.css` still contain document-global selectors/state.
- The prior stored baseline passed lip-sync but recorded body/garment failures; these will be treated as pre-existing evidence until current verification is run after code.

## First Implementation Slice — Exact Files

### New AI Agent API Modules

1. `src/ai/api/AgentAnimatorError.js`
	- Structured error family with code, details, serializable JSON.
2. `src/ai/api/AgentCommand.js`
	- Abstract command vessel defining validate/execute contract.
3. `src/ai/api/AgentCommandRegistry.js`
	- Data-driven command registration, supported-command discovery, dispatch.
4. `src/ai/api/AgentReceipt.js`
	- Serializable success receipt with version, command, result, warnings.
5. `src/ai/api/AgentSceneCommand.js`
	- Command for compiling SceneDSL scene/entity declarations compatibly.
6. `src/ai/api/AgentPerformanceCommand.js`
	- Command that composes prompt intent and real `SpeechPerformanceEngine` face/body performance.
7. `src/ai/api/AgentStudioCommand.js`
	- Command that invokes existing `StudioPromptDirector` against a supplied base Studio document.
8. `src/ai/api/AgentAnimatorApi.js`
	- Small facade: `capabilities()`, `commands()`, `execute(envelope)`, `scene()`, `performance()`, `studio()`.
9. `src/ai/api/AgentApiInstaller.js`
	- Installs one stable versioned browser global on the animator-owned application root/runtime while retaining direct ESM import use.
10. `src/ai/api/index.js`
	- Public ESM barrel containing only supported agent API exports.

### Existing AI Files Rewritten Completely

11. `src/ai/SceneDSL.js`
	- Preserve `commands` and `add(type, options)` while adding validation-friendly data normalization, fluent semantic helpers, cloning/export, rich JSDoc.
12. `src/ai/SceneCompiler.js`
	- Preserve legacy compile semantics while validating input shape, cloning options, and returning deterministic data.
13. `src/ai/PerformancePromptCompiler.js`
	- Replace ternary one-liner with rule tables and structured expressive intent: emotion, intensity, gesture, gaze cue, delivery energy, blink/breath/secondary-motion hints, and existing camera prompt output.

### Runtime / UI Ownership Rewrites

14. `src/core/app/AppUI.js`
	- Mark `#app` as the owned animator root before shell render; preserve all existing setup/mount behavior.
15. `src/ui/chrome/ResponsiveChrome.js`
	- Own chrome, panel dataset, selection queries, active/pressed state, and cleanup within `#app`; preserve keyboard behavior while preventing body-global UI state.
16. `src/main.js`
	- Install `AgentApiInstaller` as a safe extension without inflating business logic; retain existing public app globals.

### CSS Rewrites

17. `src/styles/base/tokens.css`
	- Move all custom properties from `:root` to `#app[data-awtsmoos-animator-root]`.
18. `src/styles/base/reset.css`
	- Remove global universal/html/body/raw-control rules; scope box sizing, base typography, color, overflow, and form inheritance under the owned animator root.
19. `src/styles/mobile/responsive.css`
	- Replace body selectors/dataset selectors with animator-root selectors; preserve safe-area drawers, local z-index, reduced-motion behavior.
20. `src/styles/components/agent-api.css`
	- Optional only if an agent status affordance is actually rendered during implementation; otherwise do not create decorative dead CSS.
21. `src/index.css`
	- Rewrite only if a new stylesheet is actually imported. If no visible agent panel is added in this slice, preserve it untouched.

### Verification and Documentation

22. `tools/verify/agentAnimatorApiSmoke.js`
	- New direct Node smoke: capabilities, legacy SceneDSL compatibility, rich performance composition, invalid envelope errors, Studio prompt generation, serializable receipts.
23. `tools/verify/localStyleScopeSmoke.js`
	- New static smoke asserting animator-owned styles contain no `:root`, raw `body/html`, or top-level universal reset in the audited foundational files.
24. `AGENT_API.md`
	- New focused human/AI guide: zero-build ESM import, browser global, versioned envelope, minimal recipes, expressive performance recipe, full Studio generation, error contract, capability discovery.
25. `DOCUMENTATION.md`
	- Rewrite only after reading its complete shape. Add concise link/section to the new Agent API without replacing existing operational documentation.

## Explicit Non-Goals for This First Slice

- Do not replace renderer, NLE, face engine, body engine, Studio document model, or export engine already present.
- Do not promise automatic audio phoneme recognition unless existing code proves it; the API will expose real composed performance and deterministic prompt intent.
- Do not change character art geometry merely because a stale baseline recorded body/garment failures; those are a separate verified fix node after current tests.
- Do not add a new visual panel unless inspection proves there is a coherent insertion point and it improves the stage-first workflow.

## NEXT_ACTION
Read the small dependencies needed to implement the command handlers (`ShotPromptCompiler`, `AssetResolver`, face/body input behavior, `StudioPromptWorkflow` or Studio document factory) and the current documentation heading structure. Then write all implementation files completely in one code-first pass before running tests.
