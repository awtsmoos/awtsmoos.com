B"H

# Exact Touch Plan for the 18 Phase Foundation

## New folders/files

Core world:
- `src/world/model/World.js`
- `src/world/model/District.js`
- `src/world/model/Block.js`
- `src/world/model/Group.js`
- `src/world/model/Asset.js`
- `src/world/model/Path.js`
- `src/world/model/Modifier.js`
- `src/world/model/SceneDocument.js`

Document:
- `src/document/SceneLoader.js`
- `src/document/SceneWriter.js`
- `src/document/SceneResolver.js`
- `src/document/DocumentRegistry.js`

Shapes:
- `src/shapes/ShapeNodeFactory.js`
- `src/shapes/ShapeLibrary.js`

Assets:
- `src/assets/AssetLibrary.js`
- `src/assets/food/FoodAssets.js`
- `src/assets/environment/KitchenAssets.js`
- `src/assets/characters/HumanAssets.js`

Modifiers:
- `src/modifiers/ModifierEngine.js`
- `src/modifiers/RepeatModifier.js`
- `src/modifiers/TransformModifiers.js`
- `src/modifiers/AttachModifier.js`

Groups:
- `src/groups/AssetGroup.js`
- `src/groups/KitchenGroup.js`
- `src/groups/HealthyLunchGroup.js`

Paths:
- `src/paths/LinearPath.js`
- `src/paths/PathAttachment.js`

Character:
- `src/character/rig/CharacterRig.js`
- `src/character/rig/Skeleton.js`
- `src/character/rig/Pose.js`
- `src/character/rig/CharacterAssembler.js`
- `src/character/face/FaceRig.js`
- `src/character/clothing/Outfit.js`

Environment:
- `src/environment/kitchen/KitchenEnvironment.js`

Camera:
- `src/camera/production/ShotLibrary.js`
- `src/camera/production/ShotPlanner.js`
- `src/camera/production/CompositionGuide.js`

Animation:
- `src/animation/core/Timeline.js`
- `src/animation/core/Track.js`
- `src/animation/core/Keyframe.js`
- `src/animation/core/Interpolator.js`

Scene builder:
- `src/scenes/healthy-lunch/HealthyLunchScene.js`

Director:
- `src/director/planning/ScenePlanner.js`
- `src/director/planning/BeatPlanner.js`
- `src/director/planning/CameraPlanner.js`

Editor model:
- `src/editor/model/HierarchyModel.js`
- `src/editor/model/InspectorModel.js`

AI authoring:
- `src/ai/SceneDSL.js`
- `src/ai/SceneCompiler.js`
- `src/ai/AssetResolver.js`

Integration rewrites:
- `src/core/app/DefaultSceneInstaller.js`
- `src/scene/render/production/ProductionLunchScene.js`
- `src/scene/core/SceneComposer.js`
- `package.json`

Verification:
- `tools/verify/worldGraphSmoke.js`
- `tools/verify/documentSmoke.js`
- `tools/verify/assetSmoke.js`
- `tools/verify/modifierSmoke.js`
- `tools/verify/pathSmoke.js`
- `tools/verify/characterRigSmoke.js`
- `tools/verify/cameraProductionSmoke.js`
- `tools/verify/animationSmoke.js`
- `tools/verify/directorAiSmoke.js`
- `tools/verify/all18PhasesSmoke.js`

## Order

Write foundations first, integration second, verification third, run targeted tests, run full verify, final review.
