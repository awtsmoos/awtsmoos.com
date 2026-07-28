B"H

# Dynamic Expression Phase Two — File and Responsibility Map

The Awtsmoos renews identity and acting without confusing their vessels; Awtsmoos.com is remembered while each file receives one clear responsibility.

## Files to Rewrite Completely

### Universal Performance

- `src/performance/face/FacePose.js`
  - Keep complete neutral regional state.
  - Add bounded merge/add helpers only if needed by the engine.

- `src/performance/face/EmotionPoseCatalog.js`
  - Keep all named expressions reusable by every character.
  - Add explicit `neutral`, `attention`, and `fatigued` states required by the brief.
  - Preserve existing names for compatibility.

- `src/performance/face/EmotionLibrary.js`
  - Resolve aliases without embedding character identity.

- `src/performance/face/FacePerformanceEngine.js`
  - Compose neutral identity range, emotion, moment, speech, attention, blink, and manual overrides.
  - Apply character expression limits after composition.
  - Never infer a permanent mood from an identity profile name.

- `src/character/performance/render/FacePoseRenderBridge.js`
  - Carry all regional channels, including brow tilt/asymmetry and eye/lid asymmetry, into the renderer.

### Stable Renderer

- `src/character/factory/stable/face/FaceFrontRenderer.js`
  - Remove hardcoded named mood fallbacks.
  - Consume only explicit dynamic face pose/render performance.
  - Use a truly neutral fallback.

- `src/character/factory/stable/face/StableBrowRenderer.js`
  - Keep anatomical brow style separate from dynamic raise, squeeze, tilt, and asymmetry.
  - Make each side independently controllable.

- `src/character/factory/stable/face/StableEyeGeometry.js`
  - Consume dynamic left/right openness, upper/lower lids, squint, blink, and gaze.
  - Keep eye shape anatomy permanent but not skeptical emotion.

- `src/character/factory/stable/mouth/StableMouthGeometry.js`
  - Replace forced emotional minima with neutral rest-shape anatomy and dynamic expression deformation.
  - Preserve phoneme identity constraints.

### Reference Trio Identity

- Three `ReferenceSpecification` files:
  - Remove permanent `facePose` and `renderPerformance` acting.
  - Store only explicit reference-frame staging request or neutral state, depending on scene ownership.

- Three `ReferenceDesign` files:
  - Replace `emotion.default` with neutral plus temperament metadata.

- Three `ReferenceProfile` files:
  - Replace expression-shaped profile names with reusable range/profile identifiers.

- Three `ReferenceAppearance` files:
  - Remove permanent smile, frown, jaw, open, teeth, and tongue states.
  - Add neutral mouth anatomy and expression-range controls.
  - Finish Ari/Dovid beard identity parameters in the same full rewrite.

- Three `ReferenceFaceIdentity` files:
  - Keep anatomical asymmetry.
  - Remove emotional labels such as `kind: skeptical` from eye geometry.
  - Express lid anatomy through neutral shape parameters.

### Scene Performance

- `src/scenes/referenceTrio/ReferenceTrioPerformances.js`
  - Own the current frame’s dynamic acting states.
  - Supply Ari’s delight/laugh, Dovid’s skepticism, and Miriam’s attention as scene performance, not identity.

## No Tests Until Code Family Is Complete

The entire family above will be rewritten first. Only after complete readback will isolated syntax, expression-matrix, beard/mouth, render-consumption, trio, lip-sync, durability, and visual renderer proofs run.
