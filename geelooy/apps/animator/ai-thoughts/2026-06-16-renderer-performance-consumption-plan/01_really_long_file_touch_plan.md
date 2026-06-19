B"H

# Really Long File Touch Plan — Make `facePose` + `performancePose` Actually Draw

## Mission

The previous pass created the performance state: `facePose`, `performancePose`, `attentionTarget`, `eyeDart`, `blinkNow`, `breathMotion`, `weightShift`, `headTilt`, `headNod`, `handPerformance`, object lifecycle, object contact, and interaction events.

The next pass must make those fields visibly affect the existing stable character renderer and object renderer without replacing them.

The goal is: keep the complex characters, but make them act.

No fake people. No static markers. No deleting mouth/blink/limbs. No replacing the character system. This is a renderer-consumption pass.

---

# Phase 0 — Inspection Files, Read First

These must be read before writing because the exact render contracts decide the safest touch points.

1. `src/core/renderer/pipeline/phases/EntityPhase.js`
   - Confirms how character nodes and prop nodes enter the graph.
   - Need to verify ordering and data passed to character renderer.

2. `src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js`
   - Likely best place to map performance fields into render-ready fields.
   - Must avoid deleting existing mouth/gesture/locomotion fields.

3. `src/character/factory/stable/StableCharacterRenderAdapter.js`
   - Main adapter for stable character render data.
   - High-impact target for `facePose` / `performancePose` mapping.

4. `src/character/factory/stable/StableMouthPlan.js`
   - Mouth shape system; must accept `facePose.mouth` while preserving speech mouth.

5. `src/character/factory/stable/StableHeadPlan.js`
   - Head tilt/nod, brow/eye placement may pass through here.

6. `src/character/factory/stable/StableEyePlan.js`
   - Eye openness, squint, blink, gaze, pupil target.

7. `src/character/factory/stable/StableBrowPlan.js`
   - Brow raise/squeeze/asymmetry if it exists.

8. `src/character/factory/stable/StableLimbPlan.js`
   - Arm and hand gestures from `performancePose.hand`.

9. `src/character/factory/stable/StableTorsoPlan.js`
   - Breathing, shoulder motion, weight shift.

10. `src/character/factory/stable/StablePosePlan.js`
    - Where final pose may be composed.

11. `src/character/factory/stable/StableCharacterParts.js`
    - Which graph nodes are emitted for head/body/arms/legs.

12. `src/character/factory/stable/StableCharacterGeometry.js`
    - Where shape geometry can be slightly adjusted.

13. `src/character/factory/stable/StableCharacterColors.js`
    - Style detail / cheeks / clothing detail color hooks.

14. `src/character/factory/stable/StableCharacterRenderer.js`
    - If present, final graph assembly.

15. `src/character/anatomy/mouth/SpeechKinetics.js`
    - Existing mouth motion. Integrate, do not replace.

16. `src/character/performance/CinematicFaceSignal.js`
    - Existing performance signal system. Determine whether to merge or bridge.

17. `src/core/animation/systems/VocalSystem.js`
    - Existing vocal/mouth behavior.

18. `src/core/app/director/logic/SpeechProcessor.js`
    - Already writes performance fields; confirm output shape.

19. `src/core/app/director/logic/CharacterProcessor.js`
    - Already writes body performance fields; confirm no overwrite.

20. `src/core/app/director/logic/PropProcessor.js`
    - Already lifecycle-based; inspect for render field output.

21. `src/core/renderer/props/PropBuilder.js`
    - Existing graph prop renderer; add contact shadows, bite marks, squash/stretch.

22. `src/world/entities/PropManager.js`
    - Canvas fallback prop renderer; keep parity with graph PropBuilder if still used.

23. `src/data/scenes/healthyLunch/*.js`
    - Scene data must provide strong expression/attention/object directives.

---

# Phase 1 — Performance Render Bridge

## New files to create

24. `src/character/performance/render/FacePoseRenderBridge.js`
   - Converts generic `facePose` into renderer-friendly values.
   - Inputs:
     - `facePose.brows.innerRaise`
     - `facePose.brows.outerRaise`
     - `facePose.brows.squeeze`
     - `facePose.eyes.openness`
     - `facePose.eyes.blink`
     - `facePose.eyes.dartX`
     - `facePose.eyes.dartY`
     - `facePose.mouth.open`
     - `facePose.mouth.smile`
     - `facePose.mouth.frown`
     - `facePose.cheeks.raise`
   - Outputs renderer fields like:
     - `eyeOpenAmount`
     - `blinkAmount`
     - `pupilOffsetX`
     - `pupilOffsetY`
     - `browLeftY`
     - `browRightY`
     - `mouthOpenAmount`
     - `mouthSmileAmount`
     - `cheekRaiseAmount`

25. `src/character/performance/render/BodyPoseRenderBridge.js`
   - Converts `performancePose` into body render offsets.
   - Outputs:
     - `torsoBreathScale`
     - `shoulderOffsetY`
     - `headRotation`
     - `headOffsetY`
     - `hipOffsetX`
     - `weightShiftAmount`
     - `handPose`

26. `src/character/performance/render/AttentionRenderBridge.js`
   - Converts `attentionTarget`, `eyeDart`, and `lookAt` into eye/pupil offsets.
   - Does not need perfect inverse kinematics yet.
   - Start with simple actor/prop target bias.

27. `src/character/performance/render/StyleRenderBridge.js`
   - Maps `styleProfile`, `expressionProfile`, and scale into:
     - line weights
     - cheek visibility
     - clothing detail flags
     - hair detail flags

28. `src/character/performance/render/PerformanceRenderBridge.js`
   - One facade combining face, body, attention, and style.
   - Called by hydrator/adapter.

## Existing files to rewrite

29. `src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js`
   - Add `renderPerformance` object while preserving all old fields.
   - Should not decide drawing; only hydrate data.
   - Must pass original `facePose`, `performancePose`, and bridge output.

30. `src/character/factory/stable/StableCharacterRenderAdapter.js`
   - Consume `renderPerformance` and map to stable renderer plans.
   - Must keep compatibility if `renderPerformance` missing.

---

# Phase 2 — Face Drawing Consumption

## Existing files likely touched

31. `src/character/factory/stable/StableMouthPlan.js`
   - Add mouth open amount from `renderPerformance.face.mouthOpenAmount`.
   - Smile/frown modifies corners.
   - Jaw amount modifies vertical mouth shape.
   - Preserve existing speech mouth behavior.

32. `src/character/anatomy/mouth/SpeechKinetics.js`
   - If needed, add helper to blend speech mouth and `facePose.mouth`.
   - Avoid breaking existing phoneme-ish motion.

33. `src/character/factory/stable/StableEyePlan.js`
   - Apply `eyeOpenAmount`, `blinkAmount`, `squintAmount`.
   - Apply `pupilOffsetX/Y` from attention bridge.
   - Eye darts should be subtle.

34. `src/character/factory/stable/StableBrowPlan.js`
   - Apply inner/outer raise and squeeze.
   - Add asymmetry if supported.

35. `src/character/factory/stable/StableHeadPlan.js`
   - Apply `headRotation`, `headOffsetY` from performance.
   - Must keep head attached to neck.

36. `src/character/factory/stable/StableFacePlan.js`
   - If this exists, compose mouth/eyes/brows/cheeks here.
   - Add cheek raise/tint.

37. `src/character/factory/stable/StableCheekPlan.js`
   - If absent, create it.
   - Draw cheek ovals/tints when smile or warmth is high.

## New fallback files if exact stable plans do not exist

38. `src/character/factory/stable/performance/StableFacePerformanceApplier.js`
   - Safely mutates/augments whatever plan objects exist.

39. `src/character/factory/stable/performance/StableEyePerformanceApplier.js`

40. `src/character/factory/stable/performance/StableMouthPerformanceApplier.js`

41. `src/character/factory/stable/performance/StableBrowPerformanceApplier.js`

---

# Phase 3 — Body Drawing Consumption

## Existing files likely touched

42. `src/character/factory/stable/StableTorsoPlan.js`
   - Breathing scales torso slightly.
   - Shoulder offset moves jacket/upper chest.

43. `src/character/factory/stable/StableLimbPlan.js`
   - `handPerformance` changes arm pose:
     - `open_explain`
     - `point`
     - `raise`
     - `receive`
     - `bite`
     - `rest`

44. `src/character/factory/stable/StableArmPlan.js`
   - If separate arm plan exists, map gesture to elbow/wrist targets.

45. `src/character/factory/stable/StableHandPlan.js`
   - If separate hand plan exists, open palm / pointing / holding shapes.

46. `src/character/factory/stable/StableLegPlan.js`
   - Weight shift nudges hips/knees subtly in idle.

47. `src/character/factory/stable/StableFootPlan.js`
   - Weight shift may compress one side slightly.

48. `src/character/factory/stable/StablePosePlan.js`
   - Merge performance pose with existing locomotion/gesture pose.

## New fallback files

49. `src/character/factory/stable/performance/StableBodyPerformanceApplier.js`

50. `src/character/factory/stable/performance/StableHandPerformanceApplier.js`

51. `src/character/factory/stable/performance/StableWeightShiftApplier.js`

---

# Phase 4 — Object Renderer Consumption

## Existing files to rewrite

52. `src/core/renderer/props/PropBuilder.js`
   - Add:
     - contact shadows under every food prop
     - bite mark rendering for consumed/bitten apple/sandwich
     - squash/stretch transform for hop/bounce
     - highlight and rim detail from `ObjectDetailSystem`
   - Keep old `box`, `ball`, `book`, `frisbee` support.

53. `src/world/entities/PropManager.js`
   - Mirror important object art improvements for canvas fallback.
   - Add contact shadow, squash/stretch, bite mark if possible.

54. `src/objects/art/FoodShapeLibrary.js`
   - Make richer shape descriptors:
     - apple stem/leaf/highlight/bite mark
     - carrot leaf cluster/ridges
     - sandwich bread/lettuce/cheese/layering
     - plate rim/shadow

55. `src/objects/art/ObjectDetailSystem.js`
   - Convert prop state into rendering flags.

56. `src/objects/art/ContactShadowSystem.js`
   - Return graph-compatible shadow node specs.

57. `src/objects/art/BiteMarkSystem.js`
   - Return bite mark geometry.

58. `src/objects/art/ObjectSquashStretch.js`
   - Return graph transform values.

---

# Phase 5 — True Object Attachment

## New files

59. `src/objects/attachment/HandAnchorResolver.js`
   - Resolves approximate hand anchors from character render data.

60. `src/objects/attachment/MouthAnchorResolver.js`
   - Approximate mouth anchor for bite interaction.

61. `src/objects/attachment/TableAnchorResolver.js`
   - Stable table plane anchors.

62. `src/objects/attachment/ObjectAttachmentRendererBridge.js`
   - Converts heldBy/anchor into final prop transform.

63. `src/objects/attachment/AttachmentDebugProbe.js`
   - Test-only helper to confirm anchor math.

## Existing files

64. `src/core/app/director/logic/PropProcessor.js`
   - If `heldBy` or `anchor` is present, keep it in output.

65. `src/core/renderer/props/PropBuilder.js`
   - Apply attachment bridge before drawing.

66. `src/world/entities/PropManager.js`
   - Same for canvas fallback.

67. `src/director/actions/HeldPropMapper.js`
   - Replace or delegate to `ObjectAttachmentRendererBridge`.

---

# Phase 6 — Scene Beat Upgrade for Visible Acting

## Existing files

68. `src/data/scenes/healthyLunch/beats.js`
   - Rewrite every beat with:
     - `emotion`
     - `moment`
     - `speechEnergy`
     - `attentionTarget`
     - `listenerMoment`
     - `reaction`
     - `interaction`
     - `prop.lifecycle`
     - `shotPurpose`
   - Example:
     - guide speaks warmly, kid looks at guide
     - apple slides in, both look at apple
     - kid curious face, brow raise
     - carrot rolls, kid surprised
     - bite interaction, guide proud, kid happy

69. `src/data/scenes/healthyLunch/characters.js`
   - Add stronger profiles:
     - `expressionProfile`
     - `actingPersonality`
     - `styleProfile`
     - `eyeBehavior`
     - `gestureBias`
     - `breathEnergy`

70. `src/data/scenes/healthyLunch/props.js`
   - Add anchors/lifecycle:
     - apple introduced -> held -> consumed
     - carrot placed -> rolled
     - sandwich placed

71. `src/data/scenes/healthyLunch/cameras.js`
   - Add shot purpose and subject priority.

72. `src/data/scenes/healthyLunch/metadata.js`
   - Add performance tuning defaults.

73. `src/data/scenes/healthyLunch/index.js`
   - Assemble with upgraded compilers.

---

# Phase 7 — Runtime Compiler/Event Routing

## Existing files

74. `src/director/dialogue/DialogueBeatCompiler.js`
   - Already expanded; next step compile explicit performance events if useful.
   - Add event types:
     - `performance`
     - `attention`
     - `object`
     - `interaction`

75. `src/core/app/director/logic/EventProcessor.js`
   - Route new event types cleanly.

76. `src/core/app/director/logic/SpeechProcessor.js`
   - Already creates face/body performance; refine if new render bridge needs different fields.

77. `src/core/app/director/logic/CharacterProcessor.js`
   - Ensure performance events do not overwrite locomotion.

78. `src/core/app/director/logic/PropProcessor.js`
   - Ensure object events preserve lifecycle/attachment.

---

# Phase 8 — Camera / Performance Coupling

## Existing/new files

79. `src/camera/production/FramingSolver.js`
   - Use actor bounds and prop/action context.

80. `src/camera/production/SubjectBounds.js`
   - Use character scale and performance pose for approximate bounds.

81. `src/camera/production/CameraEmotionRules.js`
   - Move closer for emotional beats, wider for object actions.

82. `src/camera/production/ShotContinuityPlanner.js`
   - Smooth between consecutive shot plans.

83. `src/core/app/director/logic/CameraProcessor.js`
   - Use camera continuity helper if safe.

84. `src/core/renderer/pipeline/phases/CinematicCharacterStaging.js`
   - Keep stable scale; avoid hiding expressive body during closeups.

---

# Phase 9 — Editor / Inspector Visibility

## Existing files to create or connect

85. `src/editor/model/PerformanceInspectorModel.js`
   - Already created; add fields from render bridge.

86. `src/editor/model/ObjectInspectorModel.js`
   - Already created; add attachment/lifecycle fields.

87. `src/editor/panels/PerformancePanel.js`
   - Add real panel rendering if editor has panel registry.

88. `src/editor/panels/ObjectLifecyclePanel.js`

89. `src/editor/panels/AttentionPanel.js`

90. `src/editor/panels/ShotContinuityPanel.js`

91. `src/ui/components/panels/*`
   - Only after reading editor UI registry.

---

# Phase 10 — AI Authoring Visibility

## Files

92. `src/ai/PerformancePromptCompiler.js`
   - Expand to output face/body/attention directives.

93. `src/ai/ObjectPromptCompiler.js`
   - Expand to output lifecycle/interaction events.

94. `src/ai/SceneCompiler.js`
   - Compile prompt directives into beat fields.

95. `src/ai/SceneDSL.js`
   - Add fluent methods:
     - `.emotion()`
     - `.lookAt()`
     - `.gesture()`
     - `.objectAction()`
     - `.interaction()`

---

# Phase 11 — Verification Files

## New verify files

96. `tools/verify/renderBridgeSmoke.js`
   - Confirms `facePose` and `performancePose` become `renderPerformance`.

97. `tools/verify/stableFaceConsumptionSmoke.js`
   - Confirms stable adapter/mouth/eyes/brows receive mapped values.

98. `tools/verify/stableBodyConsumptionSmoke.js`
   - Confirms breathing/head/hand/weight fields reach body plans.

99. `tools/verify/objectRendererConsumptionSmoke.js`
   - Confirms PropBuilder emits shadows/detail/bite/squash nodes.

100. `tools/verify/objectAttachmentSmoke.js`
   - Confirms held object anchor resolves.

101. `tools/verify/healthyLunchVisiblePerformanceSmoke.js`
   - Confirms scene beats contain visible performance fields.

102. `tools/verify/cameraPerformanceCouplingSmoke.js`
   - Confirms camera rules respond to emotional/object beats.

103. `tools/verify/editorPerformanceModelSmoke.js`
   - Confirms editor models expose new fields.

104. `tools/verify/aiPerformanceCompilerSmoke.js`
   - Confirms AI compiler emits performance/object directives.

## Existing file

105. `package.json`
   - Add all verify scripts to `npm run verify`.

---

# Step-by-step Implementation Order

1. Read stable renderer files listed in Phase 0.
2. Identify exact stable plan files that exist.
3. Create render bridge files.
4. Rewrite `CharacterRenderDataHydrator.js` to add `renderPerformance`.
5. Rewrite `StableCharacterRenderAdapter.js` to pass bridge outputs down.
6. Rewrite actual stable mouth/eye/brow/head plan files found by inspection.
7. Rewrite actual stable torso/limb/hand plan files found by inspection.
8. Upgrade PropBuilder with object art consumption.
9. Upgrade PropManager fallback if still active.
10. Add object attachment files.
11. Upgrade healthy lunch scene data for visible acting.
12. Add compiler/event route refinements.
13. Add camera performance coupling.
14. Add editor/AI model enhancements.
15. Add verification files.
16. Run targeted verification.
17. Run full `npm run verify`.
18. Browser reload with cache bust.
19. Compare screenshots.
20. Tune exact numeric values from screenshots.

---

# Files I will probably NOT touch unless inspection proves necessary

- `src/engine/graph/VirtualGraph.js`
  - Core graph should remain stable.

- `src/engine/renderer/CanvasTerminal.js`
  - Avoid unless graph nodes cannot express needed shapes.

- `src/core/renderer/pipeline/RenderPipeline.js`
  - Camera/background already fixed.

- `src/core/renderer/pipeline/layers/StageLayerComposer.js`
  - Already moved scene into camera world.

- `src/main.js`
  - Boot currently works; avoid churn.

---

# Desired Visible Outcome

After this pass the screenshots should show:

- brows visibly raising/squeezing when curious/surprised
- eyes blinking and refocusing
- pupils looking toward speaker/food
- mouth opening/smiling with speech energy
- cheeks lifting on smiles
- head nodding and tilting during speech
- torso breathing subtly
- shoulders moving with speech emphasis
- hands changing between rest/explain/point/raise/receive/bite
- apple/carrot/sandwich with contact shadows and squash/stretch
- bite mark after bite interaction
- held objects tracking hands/mouth roughly
- camera changes moving background and characters together

