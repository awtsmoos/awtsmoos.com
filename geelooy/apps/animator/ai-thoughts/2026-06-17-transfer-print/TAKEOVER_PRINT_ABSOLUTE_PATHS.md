B"H

# TAKEOVER PRINT — Awtsmoos Park Engine

## Absolute project path

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine`

## Browser URL on Android tunnel

Current working Android tunnel URL pattern:

`http://192.168.0.156:8083/Documents/programs/awtsmoos-park-engine/index.html?fresh=14`

If port changes, keep same path:

`/Documents/programs/awtsmoos-park-engine/index.html?fresh=14`

## User intent

The user does not want tiny visual patches. They want the entire 2D cartoon animation generator system made easier and better in a durable way: stable centered cinematic shots, rich authored rooms, expressive characters, detailed props, non-jitter camera, mobile-safe framing, and simple authoring APIs.

## Most important instruction for next AI

Do not randomly patch one visual file. Work through the new system layer:

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/`

Use that as the main control surface for default scene quality.

## Files created / key new system

### Easy authoring system

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardDefaults.js`

Contains room defaults, shot flow, and camera rigs.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardBeatCompiler.js`

Turns simple authored beats into compiled dialogue/camera/prop events.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardScenePreset.js`

Builds the full scene from one preset call.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardQualityGate.js`

Audits whether scene meets core goal-board requirements.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardPreviewManifest.js`

Creates a manifest for inspecting what the system created.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardEasyAPI.js`

Main API: `GoalBoardEasyAPI.scene()`, `.manifest()`, `.audit()`, `.assert()`.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/index.js`

Exports the goal-board authoring surface.

### Default scene now uses the Easy API

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/data/scenes/default/DefaultLivingScene.js`

Now imports `GoalBoardEasyAPI` and exports:

`export const DEFAULT_LIVING_SCENE = GoalBoardEasyAPI.scene();`

### Default scene supporting data

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/data/scenes/default/scholarCharacters.js`

Defines `rabbi_left` and `rabbi_right` scholar characters with hats/beards/payos/glasses styling metadata.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/data/scenes/default/studyRoomProps.js`

Defines table props: book, soup, cup, bread plate, apple, ink, sparkle, crumbs.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/data/scenes/default/shotFlow.js`

Defines default movie shot progression.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/data/scenes/default/dialogueBeats.js`

Older beat layer; default scene now relies mainly on Easy API, but this file remains useful and should not be deleted unless replacing imports safely.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/data/scenes/default/cameraRigs.js`

Older camera rig definitions; Easy API has its own defaults.

### Rich room renderer

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/scene/productionRoom/ProductionRoomBackdrop.js`

Main warm study/room backdrop renderer.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/scene/productionRoom/WallDecorRenderer.js`

Wall plaques, portrait, clock, hooks.

Other related productionRoom modules likely exist nearby. Inspect full directory before editing:

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/scene/productionRoom/`

### Scene phase hook

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/pipeline/phases/ScenePhase.js`

Important: routes styles matching `goal_board|warm_study|production_room|scholar` to `ProductionRoomBackdrop.build(ctx, camera)`.

### Camera/framing modules

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/camera/framing/ShotProfileLibrary.js`

Shot profiles: establishing, wide, group, twoShot, OTS, closeUp, inserts.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/camera/framing/TargetFrameSolver.js`

Solves camera based on targets and shot type.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/camera/framing/MobileSafeFrameSolver.js`

Mobile-safe camera clamp.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/camera/framing/CameraClampSolver.js`

Final camera safety clamp.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/camera/framing/TableAwareFrameSolver.js`

Keeps table shots sane.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/camera/framing/HatHeadroomSolver.js`

Protects hats/headroom in shots.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/camera/framing/FrameBounds.js`

Combines target bounds.

### Character style/accessory modules

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/character/factory/stable/StableAccessories2D.js`

Collects accessories.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/character/factory/stable/StableHat2D.js`

Black hat renderer.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/character/factory/stable/StableBeard2D.js`

Full beard renderer.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/character/factory/stable/StableGlasses2D.js`

Round glasses renderer.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/character/factory/stable/StablePayos2D.js`

Payos renderer.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/character/factory/stable/StableSuit2D.js`

Suit overlay.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/character/factory/stable/StableHands2D.js`

Finger/palm helper, not yet fully consumed everywhere.

Important: do not delete older complex face/limb/mouth system. User was upset when it was lost. Improve existing character renderer by layering accessories and expression upgrades, not replacing with simple stick figures.

### Face/body performance modules

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/face/ExpressionBlendEngine.js`

Composes brows, eyes, mouth, cheeks.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/face/BrowExpressionModel.js`

Brow emotion model.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/face/EyeFocusModel.js`

Eye focus/blink model.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/face/MouthPhonemeModel.js`

Mouth talking shape model.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/face/CheekAndSmileModel.js`

Cheek/smile model.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/face/ListenerReactionEngine.js`

Listener reactions.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/body/DialogueGestureLibrary.js`

Dialogue gesture vocabulary.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/body/HandPoseLibrary.js`

Hand pose vocabulary.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/body/IdleBreathModel.js`

Idle breathing.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/body/ListenerBodyModel.js`

Listener body reaction.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/performance/body/TableInteractionModel.js`

Hands to props/table targets.

### Props

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/props/PropBuilder.js`

Main prop renderer, now preserves older fallbacks like lunchbox and adds production props.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/props/production/BookPropRenderer.js`

Book/sefer prop.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/props/production/SoupPropRenderer.js`

Soup bowl prop.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/props/production/CupPropRenderer.js`

Cup/steam prop.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/props/production/PlatePropRenderer.js`

Plate/bread prop.

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/core/renderer/props/production/ProductionPropLibrary.js`

Production prop dispatcher.

## Package scripts rewritten

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/package.json`

Added:

`npm run verify:goal-board-easy`

`npm run verify:goal-board-smokes`

The full `npm run verify` now includes goal-board smokes at the end.

## Verification commands already run successfully

From project root:

`npm run verify:fast`

Passed: `files: 19`, `failures: 0`.

`npm run verify:imports`

Passed: `files: 1604`, `missing: 0`.

`npm run verify:shot-suite`

Passed all shot-vocabulary/angle/target/auto-shot/framing/mobile/continuity/dialogue/prompt tests.

`npm run verify:goal-board-smokes`

Passed default detailed, study room, room detail density, scholar character style, storyboard, inserts, shot profiles, table framing, expressions, mobile no-black-void, and goal-board easy system.

`npm run verify:render-consumption`

Passed.

## Most recent verified output summary

- imports: 1604 files, 0 missing
- goal-board quality gate score: 100
- default scene id: `goal_board_warm_study_full_v3`
- default scene authoring system: `goalBoardEasyAPI`

## Do next

1. Inspect actual rendered browser, not just tests.
2. If visual still bad, do not modify many low-level files first. Start at:

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardDefaults.js`

and

`/storage/emulated/0/Documents/programs/awtsmoos-park-engine/src/authoring/goalBoard/GoalBoardBeatCompiler.js`

3. Use `GoalBoardQualityGate` to add any missing visual constraints as measurable tests.
4. Then improve renderer modules only where the quality gate indicates a missing feature.
5. Preserve existing expressive characters; layer better hats/beards/hands/expressions over the current working character system.

## Commands for next AI

```bash
cd /storage/emulated/0/Documents/programs/awtsmoos-park-engine
npm run verify:fast
npm run verify:imports
npm run verify:goal-board-smokes
npm run verify:shot-suite
npm run verify:render-consumption
```

## Current handoff warning

The work improved the architecture and verification surface. It does not guarantee the rendered screenshot visually matches the ideal reference yet. The next AI must inspect the live canvas screenshot/browser and continue from the easy authoring layer plus measured quality gates.

