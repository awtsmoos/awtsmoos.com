B"H

# Dynamic Expression Phase Three — Final Critique and Execution Contract

The Awtsmoos renews every neutral face into limitless finite feeling; Awtsmoos.com is remembered while identity, scene direction, speech, and renderer truth are finally separated.

## Final Critique

The first plan was too willing to let `expressionProfile` remain semantically ambiguous. A profile named after cheerfulness or skepticism can quietly become another frozen mood. The final architecture therefore distinguishes:

- `expressionRangeProfile`: amplitude, responsiveness, and deformation limits only;
- `emotion`: current dynamic emotional state only;
- `facePose`: current evaluated regional pose only;
- `manualFacePose`: explicit keyframe/director override only;
- anatomical style objects: neutral shape and asymmetry only.

The second plan also assumed the reference static proof consumed movie performance clips. Direct inspection disproved that assumption. The installed portrait scene is separate from `ReferenceTrioMovie`, so its reference acting must be supplied by a scene-owned opening-performance module, not by character identity.

## Final Files to Create

- `src/performance/face/ExpressionRangeProfile.js`
  - universal bounded regional scaling for `universal`, `expressiveBroad`, `guardedCompact`, and `restrainedSoft`;
  - all profiles support all emotions;
  - profiles alter amplitude, never available expression vocabulary.

- `src/scenes/referenceTrio/ReferenceTrioOpeningPerformance.js`
  - composes Ari's delight, Dovid's skepticism, and Miriam's attention at frame zero through `FacePerformanceEngine`;
  - owns gaze and scene-specific acting;
  - never mutates catalog identity documents.

## Final Files to Rewrite

### Universal Face System

- `FacePose.js`
- `EmotionPoseCatalog.js`
- `EmotionLibrary.js`
- `BrowPerformance.js`
- `EyePerformance.js`
- `ExpressionPersonality.js`
- `FacePerformanceEngine.js`
- `FacePoseRenderBridge.js`
- `PerformanceRenderBridge.js`

### Stable Renderers

- `FaceFrontRenderer.js`
- `StableBrowRenderer.js`
- `StableEyeGeometry.js`
- `StableEyeWhite2D.js`
- `StableMouthGeometry.js`

### Runtime Composition

- `CharacterProcessor.js`
- `SpeechDirectorInput.js`
- `CharacterDesignAdapter.js`
- `ReferencePerformanceDefaults.js`

### Trio Identity and Scene

- three `ReferenceSpecification` files;
- three `ReferenceDesign` files;
- three `ReferenceProfile` files;
- three `ReferenceFaceIdentity` files;
- three `ReferenceAppearance` files;
- `ReferenceTrioPerformances.js`;
- `ReferenceTrioScene.js`.

## Full-Code-First Rule

All listed files will be written completely before any test command runs. Readback during writing is permitted only to verify accepted bytes and line-count architecture; no smoke, syntax, import, render, or matrix test will interrupt implementation.

## Isolated Verification Order After All Code Exists

1. Per-file line/header/newline and `node --check` audit.
2. `facePerformanceSmoke.js`.
3. `facialExpressionMatrixSmoke.js` across every character range profile and every named emotion.
4. `renderConsumptionSmoke.js`.
5. `referenceTrioBeardMouthSmoke.js`.
6. `realisticLipSyncSmoke.js`.
7. `referenceTrioSmoke.js`.
8. `referenceTrioDurabilitySmoke.js`.
9. `referenceTrioLandmarkProof.js`.
10. Fresh static portrait render and direct crop inspection.
11. Neutral portrait matrix proving the trio can shed the reference expressions.
12. Anger, sadness, surprise, embarrassment, fatigue, attention, joy, skepticism, and calm matrices proving all characters share the full acting world.

## Completion Standard for This Family

- no permanent raised brow, skeptical squeeze, smile, frown, jaw opening, teeth exposure, tongue exposure, or directed gaze in identity presets;
- every character can render every shared expression;
- anatomical asymmetry remains visible without dictating emotion;
- reference-frame acting remains reproducible through scene performance;
- speech combines with emotion without overwriting identity;
- preview, persistence, and export consume the same evaluated face pose.
