B"H

# User Intent

The user rejected a small patch mindset. The work must become systemic: easier to author, easier to verify, easier to preview, better defaults, better orchestration, and better visual outputs without hand-editing scattered internals.

# System-Wide Goal

Build an easy cinematic authoring layer over the current engine:

1. A single preset API that can create the entire warm scholar room scene from one simple call.
2. A goal-board quality gate that measures room richness, shot coverage, props, characters, and mobile safety.
3. A storyboard compiler that turns simple beats into fully typed scene data.
4. A preview manifest/exporter so users can inspect what the system believes it created.
5. Tests that prove this is systemic, not a one-off patch.

# First Pass Files to Inspect

- package.json
- src/data/scenes/default/index.js
- src/data/scenes/default/DefaultLivingScene.js
- src/director/dialogue/DialogueBeatCompiler.js
- src/core/renderer/pipeline/phases/ScenePhase.js
- tools/verify/*

# Rule

Every touched file is fully rewritten. New modules should stay small. Existing giant modules should not be partially inserted into.
