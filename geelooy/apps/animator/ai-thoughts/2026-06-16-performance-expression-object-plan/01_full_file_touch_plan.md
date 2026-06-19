B"H

# Full File Touch Plan — Real Facial Expressions, Movement, Object Generation, Natural 2D Realism

## Mission

Upgrade the existing engine without destroying what already works: keep the complex character renderer, blinking, mouth, limbs, speech, camera, and director pipeline; add a real performance layer on top. The goal is not to replace characters with new fake markers. The goal is to make the existing characters feel alive: expressive faces, eye attention, speech acting, breathing, weight shifts, natural gestures, object attention, object generation, and stronger interactions.

## Prime rule

Do not touch the stable character renderer until the data/performance layer proves itself. Preserve all existing visual function. Add fields and processors that feed the renderer rather than replacing it.

---

# Phase 1 — Audit and Evidence

## Files to read first

1. `src/core/renderer/pipeline/phases/EntityPhase.js`
   - Understand how characters/props reach graph renderer.

2. `src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js`
   - Learn exactly which character fields are consumed.

3. `src/character/factory/stable/StableCharacterRenderAdapter.js`
   - Find safe expressive input fields.

4. `src/character/factory/stable/*`
   - Read all stable body/face render modules.

5. `src/core/app/director/logic/SpeechProcessor.js`
   - Where talking/mouth state is set.

6. `src/core/app/director/logic/CharacterProcessor.js`
   - Where gestures/emotions/position updates happen.

7. `src/core/app/director/logic/PropProcessor.js`
   - Where food/object motion happens.

8. `src/director/dialogue/DialogueBeatCompiler.js`
   - Where story beats become runtime events.

9. `src/data/scenes/healthyLunch/*.js`
   - Scene data, actors, cameras, props, beats.

10. `src/core/renderer/pipeline/layers/StageLayerComposer.js`
   - Camera/world/background alignment.

---

# Phase 2 — Facial Performance System

## New files to create

11. `src/performance/face/FacePerformanceEngine.js`
   - Main compositor for face pose.
   - Inputs: emotion, speech, attention, personality, time.
   - Output: brows, eyes, pupils, lids, mouth, cheeks, jaw.

12. `src/performance/face/FacePose.js`
   - Data object for final face values.

13. `src/performance/face/EmotionBlend.js`
   - Blends base mood + momentary emotion.

14. `src/performance/face/EmotionLibrary.js`
   - Defines happy, curious, surprised, thinking, worried, confident, warm, excited.

15. `src/performance/face/MouthPerformance.js`
   - Converts speech energy + phoneme-ish rhythm to mouth open/smile/jaw.

16. `src/performance/face/BrowPerformance.js`
   - Inner brow raise, outer brow raise, squeeze, asymmetry.

17. `src/performance/face/EyePerformance.js`
   - Eye openness, squint, blink, pupil target, eye darts.

18. `src/performance/face/CheekPerformance.js`
   - Smile cheek lift, blush/softness if supported.

19. `src/performance/face/ExpressionPersonality.js`
   - Character-specific expression bias: child, teacher, shy, bold.

## Existing files to rewrite

20. `src/core/app/director/logic/SpeechProcessor.js`
   - Add face performance inputs while preserving existing mouth fields.

21. `src/core/app/director/logic/CharacterProcessor.js`
   - Merge face performance events without deleting renderer fields.

22. `src/character/factory/stable/StableCharacterRenderAdapter.js`
   - Only if inspection proves it can safely pass new face pose fields.

23. `src/core/renderer/pipeline/phases/CharacterRenderDataHydrator.js`
   - Only if required to hydrate new face fields.

---

# Phase 3 — Eye Attention System

## New files

24. `src/performance/attention/AttentionEngine.js`
   - Decides what each character looks at.

25. `src/performance/attention/AttentionTarget.js`
   - Target descriptor: actor, prop, point, camera.

26. `src/performance/attention/GazePlanner.js`
   - Plans gaze transitions and look-away moments.

27. `src/performance/attention/BlinkScheduler.js`
   - Natural blink timing, blink on cuts, blink on emphasis.

28. `src/performance/attention/EyeDartPlanner.js`
   - Micro eye motion during thinking/listening.

## Existing files

29. `src/core/app/director/logic/SpeechProcessor.js`
   - Speaker looks at listener/prop/camera depending beat.

30. `src/core/app/director/logic/CharacterProcessor.js`
   - Listener reacts with gaze and blink.

31. `src/data/scenes/healthyLunch/beats.js`
   - Add explicit attention targets for food, guide, kid.

---

# Phase 4 — Body Acting System

## New files

32. `src/performance/body/BodyPerformanceEngine.js`
   - Main body motion compositor.

33. `src/performance/body/BreathingMotion.js`
   - Subtle chest/shoulder breathing.

34. `src/performance/body/WeightShiftMotion.js`
   - Feet/pelvis/shoulder weight shifts.

35. `src/performance/body/HeadMotion.js`
   - Head tilt, nod, drift, anticipation.

36. `src/performance/body/ShoulderMotion.js`
   - Shoulder rise/fall with speech/emotion.

37. `src/performance/body/HandGesturePlanner.js`
   - Explain, point, show, react, celebrate gestures.

38. `src/performance/body/IdleMotionLibrary.js`
   - Idle loops for child/teacher/food presenter.

39. `src/performance/body/ActingPose.js`
   - Final body pose data structure.

## Existing files

40. `src/core/app/director/logic/SpeechProcessor.js`
   - Speech sets talk energy, nods, hand emphasis.

41. `src/core/app/director/logic/CharacterProcessor.js`
   - Merges acting pose with explicit gestures.

42. `src/core/renderer/pipeline/phases/CinematicCharacterStaging.js`
   - Avoids over-scaling while allowing body motion.

43. `src/character/factory/stable/StableCharacterRenderAdapter.js`
   - Only if pose fields need adapter mapping.

---

# Phase 5 — Object Generation / Object Life System

## New files

44. `src/objects/ObjectLifecycleEngine.js`
   - Object states: hidden, introduced, held, placed, moving, reacting, consumed.

45. `src/objects/ObjectSpawnPlanner.js`
   - Natural entrances: slide in, hand-off, reveal, pull-from-bag, build-on-table.

46. `src/objects/ObjectAttachmentSystem.js`
   - Attach prop to hand, plate, table, mouth, counter.

47. `src/objects/ObjectAttentionBridge.js`
   - When object moves, characters look at it.

48. `src/objects/ObjectContactSolver.js`
   - Prevent props from colliding with faces or floating too high.

49. `src/objects/ObjectMotionPresets.js`
   - Hop, roll, slide, bounce, reveal, bite, chew, sparkle.

50. `src/objects/ObjectState.js`
   - Object runtime data shape.

51. `src/objects/FoodObjectGrammar.js`
   - Apple, carrot, sandwich behavior vocabulary.

## Existing files

52. `src/core/app/director/logic/PropProcessor.js`
   - Replace raw throw arcs with lifecycle/object motion.

53. `src/director/dialogue/DialogueBeatCompiler.js`
   - Compile object actions into object lifecycle events.

54. `src/core/renderer/props/PropBuilder.js`
   - Improve food prop shapes carefully.

55. `src/world/entities/PropManager.js`
   - If current canvas prop renderer needs object state support.

56. `src/data/scenes/healthyLunch/props.js`
   - Define object states/anchors.

57. `src/data/scenes/healthyLunch/beats.js`
   - Use object verbs instead of raw prop throws.

---

# Phase 6 — Interaction System

## New files

58. `src/interactions/InteractionEngine.js`
   - Coordinates actor-object and actor-actor interaction.

59. `src/interactions/InteractionPlan.js`
   - Data contract for interactions.

60. `src/interactions/HandOffInteraction.js`
   - Guide hands apple to kid.

61. `src/interactions/BiteInteraction.js`
   - Kid bites apple with mouth, hand, object, expression sync.

62. `src/interactions/LookReactInteraction.js`
   - Characters notice an object and react.

63. `src/interactions/TableInteraction.js`
   - Place/pick up food from table plane.

64. `src/interactions/InteractionCompiler.js`
   - Converts high-level scene beats into interaction events.

## Existing files

65. `src/director/actions/InteractionCompiler.js`
   - Merge/replace with stronger interaction compiler.

66. `src/director/actions/FoodActionPresets.js`
   - Add hand-off, bite, chew, show, plate-reveal.

67. `src/director/actions/HeldPropMapper.js`
   - Upgrade to object attachment system.

68. `src/core/app/director/logic/EventProcessor.js`
   - Add interaction event routing if missing.

---

# Phase 7 — Camera + Background Cohesion

## New files

69. `src/camera/production/CameraWorldSync.js`
   - Ensures background, props, and actors share the same world camera.

70. `src/camera/production/ShotContinuityPlanner.js`
   - Avoids jumpy framing between shots.

71. `src/camera/production/FramingSolver.js`
   - Frames actors with less dead wall.

72. `src/camera/production/SubjectBounds.js`
   - Computes approximate actor bounds.

73. `src/camera/production/CameraEmotionRules.js`
   - Camera closer on emotion, wider on object action.

## Existing files

74. `src/core/renderer/pipeline/layers/StageLayerComposer.js`
   - Already moved background into camera world; keep/verify.

75. `src/scene/render/production/ProductionLunchScene.js`
   - Keep world-coordinate set.

76. `src/data/scenes/healthyLunch/cameras.js`
   - Improve shot grammar.

77. `src/core/app/director/logic/CameraProcessor.js`
   - Add shot continuity if necessary.

78. `src/core/renderer/pipeline/phases/CinematicCharacterStaging.js`
   - Balance staging scale with camera.

---

# Phase 8 — Character Art Detail Improvements

## New files

79. `src/character/style/CharacterStyleProfile.js`
   - Style parameters: line weight, cheek, eyelid, hair detail, clothing detail.

80. `src/character/style/ClothingDetailSystem.js`
   - Buttons, folds, collars, cuffs, shoes.

81. `src/character/style/HairDetailSystem.js`
   - Hair strands/clumps without replacing head renderer.

82. `src/character/style/SkinToneDetailSystem.js`
   - Soft nose/cheek/shadow accents.

83. `src/character/style/LineWeightSystem.js`
   - Thicker silhouette, thinner inner detail.

## Existing files

84. `src/character/factory/stable/StableCharacterRenderAdapter.js`
   - Only map style profiles if safe.

85. `src/data/scenes/healthyLunch/characters.js`
   - Add style profiles per character.

---

# Phase 9 — Better Food / Object Art

## New files

86. `src/objects/art/FoodShapeLibrary.js`
   - Apple, carrot, sandwich, plate shapes.

87. `src/objects/art/ObjectDetailSystem.js`
   - Highlights, shadows, contact shadows.

88. `src/objects/art/ContactShadowSystem.js`
   - Every object on table gets a shadow.

89. `src/objects/art/BiteMarkSystem.js`
   - Apple/sandwich bite marks.

90. `src/objects/art/ObjectSquashStretch.js`
   - Hop/roll squash without physics chaos.

## Existing files

91. `src/core/renderer/props/PropBuilder.js`
   - Replace simple food geometry with FoodShapeLibrary.

92. `src/world/entities/PropManager.js`
   - Canvas path support if needed.

---

# Phase 10 — Scene Authoring Data Upgrade

## Existing scene files

93. `src/data/scenes/healthyLunch/metadata.js`
   - Add stage/counter/actor lane metadata.

94. `src/data/scenes/healthyLunch/characters.js`
   - Add expression personality, acting personality, style profile.

95. `src/data/scenes/healthyLunch/props.js`
   - Add anchors and lifecycle states.

96. `src/data/scenes/healthyLunch/cameras.js`
   - Add shot purpose, continuity, subject priority.

97. `src/data/scenes/healthyLunch/beats.js`
   - Add facial, attention, gesture, object interaction directives.

98. `src/data/scenes/healthyLunch/index.js`
   - Assemble with new compilers.

---

# Phase 11 — Runtime Event Routing

## Existing files

99. `src/core/app/director/logic/EventProcessor.js`
   - Route new performance/object/interaction event types.

100. `src/core/app/director/logic/SpeechProcessor.js`
   - Already target for speech acting.

101. `src/core/app/director/logic/CharacterProcessor.js`
   - Merge performance pose.

102. `src/core/app/director/logic/PropProcessor.js`
   - Merge object lifecycle.

103. `src/core/app/director/logic/CameraProcessor.js`
   - Merge camera continuity.

---

# Phase 12 — Editor Support Later

## New files

104. `src/editor/panels/PerformancePanel.js`
   - Sliders for face/body acting.

105. `src/editor/panels/ObjectLifecyclePanel.js`
   - Object spawn/hold/reveal editor.

106. `src/editor/panels/AttentionPanel.js`
   - Gaze/attention authoring.

107. `src/editor/panels/ShotContinuityPanel.js`
   - Camera shot tuning.

108. `src/editor/model/PerformanceInspectorModel.js`
   - Data for panel.

109. `src/editor/model/ObjectInspectorModel.js`
   - Data for object lifecycle.

---

# Phase 13 — AI Authoring Layer

## Existing/new files

110. `src/ai/SceneDSL.js`
   - Extend DSL with facial acting, object lifecycle, attention, shot purpose.

111. `src/ai/SceneCompiler.js`
   - Compile high-level instructions into performance/object events.

112. `src/ai/AssetResolver.js`
   - Resolve objects/characters safely.

113. `src/ai/PerformancePromptCompiler.js`
   - New: turn natural language acting notes into structured directives.

114. `src/ai/ObjectPromptCompiler.js`
   - New: object generation/interaction prompts.

---

# Phase 14 — Verification

## New verify files

115. `tools/verify/facePerformanceSmoke.js`
116. `tools/verify/eyeAttentionSmoke.js`
117. `tools/verify/bodyActingSmoke.js`
118. `tools/verify/objectLifecycleSmoke.js`
119. `tools/verify/interactionPerformanceSmoke.js`
120. `tools/verify/cameraContinuitySmoke.js`
121. `tools/verify/characterStyleSmoke.js`
122. `tools/verify/objectArtSmoke.js`
123. `tools/verify/healthyLunchPerformanceSmoke.js`

## Existing file

124. `package.json`
   - Add all verify scripts.

---

# Implementation Order

1. Read all character renderer/hydrator/processor files.
2. Add face performance data modules.
3. Add attention system.
4. Add body performance modules.
5. Add object lifecycle modules.
6. Add interaction compiler upgrades.
7. Wire SpeechProcessor and CharacterProcessor carefully.
8. Wire PropProcessor carefully.
9. Improve camera/background continuity and camera data.
10. Improve scene data.
11. Add verification.
12. Run targeted tests.
13. Run full verify.
14. Browser test with fresh query.
15. Tune visuals from screenshots.

---

# What NOT to do

- Do not replace the complex character renderer.
- Do not draw fake static people in the background.
- Do not remove mouth/blink/limb systems.
- Do not make objects huge just because the camera changes.
- Do not return to procedural skyline/city.
- Do not make the proof banner again.

## Desired visual result

The kid and guide should feel alive even standing still:

- soft breathing
- eye focus
- blink timing
- head tilts
- speech nods
- expressive brows
- mouth shapes that reflect energy
- hand gestures during important words
- attention shifts to apple/carrot/sandwich
- props enter naturally and stay grounded on table/counter plane
- camera/background move together

