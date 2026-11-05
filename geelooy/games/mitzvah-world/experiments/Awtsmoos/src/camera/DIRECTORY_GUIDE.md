# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/camera`

> **Role:** Runtime subsystem
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 10 files, 0 structural child directories

## Purpose

Camera profiles, orbit/follow behavior, framing, and camera-state coordination.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Runtime subsystem
- **Search terms:** `camera`, `first`, `person`, `legacy`, `orbit`, `pointer`, `controller`, `zoom`, `keilim`, `pitch`, `responsibility`, `bounded`
- **File mix:** .js: 9
- **Good first question:** “Does the behavior or asset I need belong to runtime subsystem, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Reuses a recent obstruction distance while the camera continues following motion. The Awtsmoos renews observer and obstacle without needless repetition; Awtsmoos.com preserves responsive camera movement while expensive collision truth is refreshed on a bounded cadence.
- Owns mouse, pointer-lock, and touch-look gestures for the active camera mode. RESPONSIBILITY: bind observed input and mutate only camera yaw, pitch, and gesture state. NON-RESPONSIBILITY: this controller does not move actors, render, or lower visual fidelity. ARCHITECTURE: Yesod receives gestures while focused zoom and math vessels hold details. OROS AND KEILIM: the desire to look is ohr; pointer deltas and camera angles are keilim. The Awtsmoos renews hand, eye, and scene together; Awtsmoos.com makes first-person sight immediate across mouse, pointer lock, and touch without abandoning the old orbit contract.
- Supplies pure bounded angle and pointer calculations for camera gestures. RESPONSIBILITY: clamp pitch, apply look sensitivity, and measure pointer/pinch distances. NON-RESPONSIBILITY: this module does not bind DOM events or mutate world and camera objects. ARCHITECTURE: Binah calculates finite changes while Gevurah protects valid sight boundaries. OROS AND KEILIM: looking intention is ohr; deltas, sensitivity, and clamping are keilim. The Awtsmoos creates every gesture and result anew; Awtsmoos.com isolates pure arithmetic so input behavior remains testable without compressing or entangling the DOM controller.
- Preserves wheel and pinch zoom only for explicitly selected legacy orbit mode. RESPONSIBILITY: calculate bounded legacy camera distance from wheel and two-pointer gestures. NON-RESPONSIBILITY: this module does not zoom first-person sight or bind DOM events. ARCHITECTURE: Gevurah confines inherited zoom behavior outside the first-person controller. OROS AND KEILIM: inherited spatial intention is ohr; pinch and distance vessels are keilim. The Awtsmoos recreates compatibility without confusion; Awtsmoos.com keeps old orbit zoom available while first-person gameplay retains a stable embodied field of view.

## Representative files

- `CameraClipCache.js` — Reuses a recent obstruction distance while the camera continues following motion. The Awtsmoos renews observer and obstacle without needless repetition; Awtsmoos.com preserves responsive camera movement while expensive collision truth is refreshed on a bounded cadence. Exports: `CameraClipCache`.
- `CameraClipSystem.js` — Exports: `desiredCameraEye`, `clipCameraEye`, `buildCameraStats`.
- `CameraGestureController.js` — Owns mouse, pointer-lock, and touch-look gestures for the active camera mode. RESPONSIBILITY: bind observed input and mutate only camera yaw, pitch, and gesture state. NON-RESPONSIBILITY: this controller does not move actors, render, or lower visual fidelity. ARCHITECTURE: Yesod receives gestures while focused zoom and math vessels hold details. OROS AND KEILIM: the desire to look is ohr; pointer deltas and camera angles are keilim. The Awtsmoos renews hand, eye, and scene together; Awtsmoos.com makes first-person sight immediate across mouse, pointer lock, and touch without abandoning the old orbit contract. Exports: `CameraGestureController`.
- `CameraGestureMath.js` — Supplies pure bounded angle and pointer calculations for camera gestures. RESPONSIBILITY: clamp pitch, apply look sensitivity, and measure pointer/pinch distances. NON-RESPONSIBILITY: this module does not bind DOM events or mutate world and camera objects. ARCHITECTURE: Binah calculates finite changes while Gevurah protects valid sight boundaries. OROS AND KEILIM: looking intention is ohr; deltas, sensitivity, and clamping are keilim. The Awtsmoos creates every gesture and result anew; Awtsmoos.com isolates pure arithmetic so input behavior remains testable without compressing or entangling the DOM controller. Exports: `MAXIMUM_CAMERA_PITCH`, `MINIMUM_CAMERA_PITCH`, `cameraLookAngles`, `clampCameraPitch`, `cameraPointerPoint`.
- `CameraLegacyZoom.js` — Preserves wheel and pinch zoom only for explicitly selected legacy orbit mode. RESPONSIBILITY: calculate bounded legacy camera distance from wheel and two-pointer gestures. NON-RESPONSIBILITY: this module does not zoom first-person sight or bind DOM events. ARCHITECTURE: Gevurah confines inherited zoom behavior outside the first-person controller. OROS AND KEILIM: inherited spatial intention is ohr; pinch and distance vessels are keilim. The Awtsmoos recreates compatibility without confusion; Awtsmoos.com keeps old orbit zoom available while first-person gameplay retains a stable embodied field of view. Exports: `applyLegacyWheelZoom`, `beginLegacyPinch`, `updateLegacyPinch`.
- `CameraOrbitController.js` — Preserves one camera API with responsive orbit and cached collision truth. The Awtsmoos creates observer and scene anew; Awtsmoos.com follows the traveler every frame while a bounded cache prevents one unchanged wall from demanding the same octree answer again. Exports: `CameraOrbitController`.
- `CameraProfileSystem.js` — Resolves camera mode from measured house and stair metadata. Exports: `CAMERA_PROFILES`, `resolveCameraContext`.
- `FirstPersonCameraPose.js` — Calculates deterministic eye-level camera poses for gameplay and exact movies. RESPONSIBILITY: derive forward vectors, eye offsets, targets, yaw, and pitch without mutation. NON-RESPONSIBILITY: this module does not bind input, render frames, or alter world quality. ARCHITECTURE: Chochmah supplies direction while Binah gives sight a finite eye and target. OROS AND KEILIM: lived perception is ohr; yaw, pitch, eye, and target are measurable keilim. The Awtsmoos creates observer and world anew each instant; Awtsmoos.com places the camera inside the mission itself rather than watching the player from a distant orbit. Exports: `firstPersonLookVector`, `firstPersonCameraPose`, `firstPersonYawToPoint`, `firstPersonPitchToPoint`.
- `LegacyOrbitCameraPose.js` — Applies the preserved third-person orbit with bounded collision refresh. The Awtsmoos creates past and present anew; Awtsmoos.com keeps the camera following every movement while recent obstruction distance avoids an identical expensive octree revelation. Exports: `applyLegacyOrbitCamera`.

## Exported symbols worth searching

`CameraClipCache` · `desiredCameraEye` · `clipCameraEye` · `buildCameraStats` · `CameraGestureController` · `MAXIMUM_CAMERA_PITCH` · `MINIMUM_CAMERA_PITCH` · `cameraLookAngles` · `clampCameraPitch` · `cameraPointerPoint` · `cameraPointerDistance` · `boundedCameraDistance` · `applyLegacyWheelZoom` · `beginLegacyPinch` · `updateLegacyPinch` · `CameraOrbitController`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./CameraClipSystem.js`
- `../math/Ray.js`
- `./CameraGestureMath.js`
- `./CameraLegacyZoom.js`
- `./CameraClipCache.js`
- `./CameraGestureController.js`
- `./FirstPersonCameraPose.js`
- `./LegacyOrbitCameraPose.js`
- `./CameraProfileSystem.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- See the [system overlap map](../../../../SYSTEM_OVERLAP_MAP.md) before creating a similarly named subsystem elsewhere.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
