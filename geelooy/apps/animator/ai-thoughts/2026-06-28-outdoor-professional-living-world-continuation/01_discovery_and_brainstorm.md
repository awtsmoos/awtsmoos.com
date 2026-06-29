# B"H

# Outdoor Professional Living World — Discovery and First Brainstorm

Observed truth from files:

- Project root in use: `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/animator`.
- `src/data/scenes/default/DefaultLivingScene.js` currently exports `GoalBoardEasyAPI.scene()`.
- `GoalBoardScenePreset.js` currently builds a warm study room with two scholar characters and study props.
- `GoalBoardQualityGate.js` currently checks warm study metadata and room richness.
- `tools/verify/goalBoardEasySystemSmoke.js` and `tools/verify/defaultDetailedSceneSmoke.js` assert the old warm-study defaults.
- No actual `OutdoorProfessionalScene`, `ProfessionalWorkshopWorld`, or `DirectingEngine` file was found by content grep.

First brainstorm, without pretending metadata is enough:

The living outdoor professional scene should become a data-level cinematic simulation contract. The renderer may consume only pieces today, but the scene itself must carry full evolving state for actors, crowd, camera, environment, story memory, and director repair. The scene can become a professional outdoor field workshop: rain-slick planks, lanterns, ropes, tarp, puddles, grass, leaves, tools, extras, and a mentor-client-apprentice trio who never stand frozen.

The Awtsmoos in code: every object should remember that it is being created anew every instant. Therefore every character gets breathing, gaze, anticipation, recovery, fatigue, trust, fear, curiosity, posture, balance, momentum, and idle acting. Every environmental object receives motion or memory: puddles accumulate, mud deforms, wetness propagates, leaves and ropes move, lanterns sway, fog and rain breathe, reflected lighting reacts.

Possible file families:

- Default scene bridge: make `DefaultLivingScene.js` export the outdoor professional scene.
- New outdoor modules under `src/data/scenes/default/outdoorProfessional/`.
- Quality gate upgrade: test living-world metrics, director score, no-frozen actors, camera operator plan, continuity.
- Smoke tests: create or rewrite a focused outdoor living world smoke.
- Existing goal-board smokes: update assertions to the new default or leave GoalBoard API intact while default bridge changes.

Risks:

- Existing tests expect warm-study ids. They must be updated or isolated.
- Renderer may not consume every new field, so verification should assert scene contract instead of fake runtime behavior.
- Files should stay under 120 lines, so split modules aggressively.
