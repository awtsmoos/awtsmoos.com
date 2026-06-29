# B"H

# Phase One Discovery Plan

The user wants the default animator scene to become professional 2D cartoon quality without using the word Pixar in file names or APIs.

Observed truth from real files:

- `src/data/scenes/default/DefaultLivingScene.js` exports `GoalBoardEasyAPI.scene()`.
- `GoalBoardScenePreset.js` currently builds a warm scholar room.
- `scholarCharacters.js` only gives two scholar characters.
- `studyRoomProps.js` gives table props.
- `GoalBoardQualityGate.js` checks mostly warm-room and count-based metrics.
- Renderer already has scene world systems, production room backdrop, vivid park world, camera rig registry, face and eye subsystems.

Phase one idea:

Create a new self-contained default scene package with a neutral professional name:

- `src/data/scenes/default/professional2d/ProfessionalDefaultScene.js`
- `src/data/scenes/default/professional2d/ProfessionalCharacters.js`
- `src/data/scenes/default/professional2d/ProfessionalProps.js`
- `src/data/scenes/default/professional2d/ProfessionalBeats.js`
- `src/data/scenes/default/professional2d/ProfessionalCameras.js`
- `src/data/scenes/default/professional2d/ProfessionalWorld.js`
- `src/data/scenes/default/professional2d/ProfessionalQualityGate.js`
- `src/data/scenes/default/professional2d/index.js`

Touch the default export:

- `src/data/scenes/default/DefaultLivingScene.js`
- `src/data/scenes/default/index.js`

Touch renderer only where necessary:

- `src/core/renderer/scene/Manager.js`
- `src/core/renderer/scene/worlds/ProfessionalWorkshopWorld.js`

Touch authoring audit surface:

- `src/authoring/goalBoard/GoalBoardEasyAPI.js`
- `src/authoring/goalBoard/GoalBoardQualityGate.js`
- `src/authoring/goalBoard/index.js`

Verification:

- Node import default scene.
- Run quality audit.
- Confirm no file name contains forbidden brand term.
- Confirm scene has 4 characters, rich props, cameras, events, face/acting metadata, and professional world style.
