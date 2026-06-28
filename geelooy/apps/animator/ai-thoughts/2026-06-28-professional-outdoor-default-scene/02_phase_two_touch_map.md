# B"H

# Phase Two Full File Touch Map

## Goal

Create the next default scene as an intense outdoor professional 2D scene while preserving the current professional package shape and keeping the implementation discoverable.

## Actual files to create

All paths are absolute.

- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorProfessionalScene.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorCharacters.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorExpressions.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorProps.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorWeather.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorWorld.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorCameras.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorBeats.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/OutdoorQualityGate.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/outdoor/index.js`

## Existing files to rewrite fully

- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/DefaultLivingScene.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/data/scenes/default/professional2d/index.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/core/renderer/scene/worlds/ProfessionalWorkshopWorld.js`

## Existing files to inspect before deciding whether to rewrite

- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/core/renderer/scene/Manager.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/authoring/goalBoard/GoalBoardEasyAPI.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/authoring/goalBoard/GoalBoardQualityGate.js`
- `/storage/emulated/0/Documents/git/awtsmoos.com/geelooy/apps/animator/src/authoring/goalBoard/index.js`

## Renderer dependency decision

If `Manager.js` already routes `professional_2d_workshop` to `ProfessionalWorkshopWorld`, keep the same style key for compatibility but enrich the renderer to understand optional `scene.environment`, `scene.weather`, and `scene.lightBeats` data. If it routes by exact world style and a new style is safe, introduce `professional_2d_outdoor_plaza` and rewrite all dependent registration files fully.
