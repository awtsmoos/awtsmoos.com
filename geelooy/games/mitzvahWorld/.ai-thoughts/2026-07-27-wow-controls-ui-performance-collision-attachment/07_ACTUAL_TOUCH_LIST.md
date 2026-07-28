B"H

# Actual Production Touch List

## Desktop controls and camera

- add `src/camera/CameraMouseChordState.js`
- rewrite `src/camera/CameraGestureController.js`
- rewrite `src/app/MinimalMeadowCameraRig.js`
- rewrite `src/app/MinimalMeadowInput.js`
- rewrite `src/app/BootstrapMovementController.js`

## Frame-time and HUD

- add `src/app/MinimalMeadowLoopCadence.js`
- add `src/app/MinimalMeadowFrameScheduler.js`
- rewrite `src/app/MinimalMeadowLoop.js`
- add `src/ui/MinimalMeadowUiRepairStyles.js`
- rewrite `src/ui/MobileHudCompositionController.js`
- rewrite `src/ui/MinimalMeadowMenu.js`
- rewrite `src/ui/GameplayUiController.js`

## House collision

- add `src/app/MinimalMeadowHouseFloorSupport.js`
- add `src/app/MinimalMeadowHouseSupportResolver.js`
- add `src/app/MinimalMeadowHouseMaintenance.js`
- rewrite `src/app/MinimalMeadowHouseAssembly.js`
- rewrite `src/app/MinimalMeadowHousePopulation.js`
- rewrite `src/app/MinimalMeadowGroundSupport.js`
- rewrite `src/app/MinimalMeadowJumpState.js`
- rewrite `src/app/MinimalMeadowMovementRuntime.js`

## Attachment ownership

- add `src/app/MinimalMeadowAttachmentRegistry.js`
- rewrite `src/app/MinimalMeadowWeaponAnchor.js`
- rewrite `src/app/MinimalMeadowWeaponAttachment.js`
- rewrite `src/app/MinimalMeadowEquipmentRuntime.js`
- rewrite `src/app/MinimalMeadowEquipmentRuntimeState.js`

## Tests after all production writes

- desktop mouse chord and A/D recovery
- movement/facing semantics
- HUD viewport and cadence
- house story-floor support and underground recovery
- attachment generation, duplicate cleanup, hydration rebinding
- current regression cluster
- Node world and browser simulation

No commit or push.
