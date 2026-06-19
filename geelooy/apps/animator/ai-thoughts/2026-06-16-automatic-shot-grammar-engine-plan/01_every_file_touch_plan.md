B"H

# Automatic Shot Grammar Engine — Every File Touch Plan

## Mission

Build a proper automatic cinematic shot system that can receive a list of targets — actors, props, groups, action points, dialogue participants — and choose strong camera shots automatically. It must understand every major movie shot type, framing style, angle in degrees, target priority, emotional intent, safe mobile framing, and continuity between cuts.

The current camera is still too ad hoc. It sometimes cuts too violently, zooms strangely, creates black voids, loses actors, and does not know the difference between a dialogue shot, reaction shot, object insert, group shot, reveal, or power angle. This pass creates a real film grammar system.

The system must not break the existing renderer, character system, scene data, or current camera pipeline. It should sit above them as a director brain and feed stable camera values into the existing runtime.

---

# Core Concepts

## Inputs

A shot request may include:

- `targets`: actors, props, objects, points, groups
- `primaryTarget`: the most important target
- `secondaryTargets`: listeners, reacting actors, object being handled
- `beatType`: dialogue, action, reaction, reveal, emotion, object, group, transition
- `emotion`: calm, warm, excited, surprised, worried, powerful, confused, intimate
- `action`: walk, point, bite, handoff, show, reveal, throw, catch, celebrate
- `speaker`
- `listener`
- `prop`
- `sceneSpace`
- `mobileSafeArea`
- `previousShot`
- `duration`
- `importance`

## Outputs

A resolved camera plan:

- `shotType`
- `framing`
- `angleName`
- `angleDegrees`
- `lens`
- `zoom`
- `x`
- `y`
- `rotation`
- `targetActors`
- `targetProps`
- `safeBounds`
- `movement`
- `transition`
- `renderDetailMode`
- `stagingMode`

---

# Complete Movie Shot Vocabulary To Implement

## Distance / Scale Shots

1. `extremeWideShot`
2. `wideShot`
3. `longShot`
4. `fullShot`
5. `mediumFullShot`
6. `cowboyShot`
7. `mediumShot`
8. `mediumCloseUp`
9. `closeUp`
10. `bigCloseUp`
11. `extremeCloseUp`
12. `insertShot`
13. `detailShot`
14. `macroShot`

## Subject Composition Shots

15. `singleShot`
16. `twoShot`
17. `threeShot`
18. `groupShot`
19. `overTheShoulder`
20. `cleanSingle`
21. `dirtySingle`
22. `reactionShot`
23. `pointOfViewShot`
24. `subjectiveShot`
25. `cutaway`
26. `cutIn`
27. `masterShot`
28. `establishingShot`
29. `reEstablishingShot`

## Action / Movement Shots

30. `trackingShot`
31. `followShot`
32. `pushIn`
33. `pullOut`
34. `dollyIn`
35. `dollyOut`
36. `panShot`
37. `tiltShot`
38. `whipPan`
39. `craneShot`
40. `boomShot`
41. `arcShot`
42. `orbitShot`
43. `revealShot`
44. `walkAndTalk`
45. `matchMove`

## Angle Shots

46. `eyeLevel`
47. `lowAngle`
48. `highAngle`
49. `birdsEye`
50. `wormsEye`
51. `dutchAngle`
52. `profileShot`
53. `frontOnShot`
54. `threeQuarterShot`
55. `backShot`
56. `backThreeQuarterShot`
57. `overheadShot`
58. `underShot`

## Editorial / Story Shots

59. `matchCutShot`
60. `shotReverseShot`
61. `reactionInsert`
62. `objectInsert`
63. `foodInsert`
64. `handsInsert`
65. `eyeInsert`
66. `mouthInsert`
67. `silhouetteShot`
68. `heroShot`
69. `vulnerabilityShot`
70. `chaosShot`
71. `comedyWide`
72. `dramaticPush`

---

# Angle Degrees To Implement

## Horizontal yaw angle names

- `front`: `0°`
- `frontThreeQuarterRight`: `30°`
- `classicThreeQuarterRight`: `45°`
- `rightProfile`: `90°`
- `backThreeQuarterRight`: `135°`
- `back`: `180°`
- `backThreeQuarterLeft`: `225°`
- `leftProfile`: `270°`
- `classicThreeQuarterLeft`: `315°`
- `frontThreeQuarterLeft`: `330°`

## Vertical pitch names

- `eyeLevel`: `0°`
- `slightHigh`: `-8°`
- `highAngle`: `-18°`
- `birdsEye`: `-60°`
- `slightLow`: `8°`
- `lowAngle`: `18°`
- `wormsEye`: `45°`

## Roll / Dutch angle

- `level`: `0°`
- `subtleDutchLeft`: `-4°`
- `dutchLeft`: `-9°`
- `extremeDutchLeft`: `-16°`
- `subtleDutchRight`: `4°`
- `dutchRight`: `9°`
- `extremeDutchRight`: `16°`

---

# Phase 1 — Inspection and Existing Camera Contract

## Files to read first

1. `src/core/app/director/logic/CameraProcessor.js`
   - Determine how camera events currently resolve into state.

2. `src/core/app/director/logic/CinematicCameraEnforcer.js`
   - Current safety and shot enforcement.

3. `src/camera/MobileCameraMercy.js`
   - Mobile clamp behavior.

4. `src/camera/ShotComposer.js`
   - Existing shot composition.

5. `src/camera/ScreenCameraDirector.js`
   - Existing screen camera transform if used.

6. `src/camera/SafeFrameResolver.js`
   - Actor safe bounds and camera safety.

7. `src/camera/ActorGroundAligner.js`
   - Grounding / lower-frame alignment.

8. `src/camera/production/ShotPlanner.js`
   - Existing production shot planning.

9. `src/camera/production/FramingSolver.js`
   - Existing frame solver.

10. `src/camera/production/SubjectBounds.js`
   - Existing subject bounds.

11. `src/camera/production/ShotContinuityPlanner.js`
   - Existing shot continuity.

12. `src/camera/production/CameraEmotionRules.js`
   - Existing emotion-to-camera rules.

13. `src/camera/production/CameraWorldSync.js`
   - Confirm world camera sync remains stable.

14. `src/core/renderer/pipeline/phases/CameraPhase.js`
   - Final transform creation.

15. `src/core/renderer/pipeline/layers/StageLayerComposer.js`
   - Confirm scene and actors share camera world.

16. `src/core/renderer/scene/FoodKitchenBackdrop.js`
   - Confirm world/backdrop coverage.

17. `src/data/scenes/healthyLunch/cameras.js`
   - Existing camera data to rewrite.

18. `src/data/scenes/healthyLunch/beats.js`
   - Beat data must request shot grammar, not hard-coded dumb camera IDs only.

---

# Phase 2 — New Cinematic Grammar Folder

Create a new folder:

`src/camera/grammar/`

## New files

19. `src/camera/grammar/ShotVocabulary.js`
   - Defines every movie shot type and metadata.
   - Each shot definition includes:
     - `name`
     - `category`
     - `defaultZoom`
     - `targetCountRange`
     - `safeMargin`
     - `defaultPitch`
     - `defaultYaw`
     - `defaultRoll`
     - `renderDetailMode`
     - `useCases`

20. `src/camera/grammar/ShotCategories.js`
   - Distance, composition, movement, angle, editorial, emotion categories.

21. `src/camera/grammar/ShotTypeNames.js`
   - Canonical constants for all shot names.
   - Prevent string typo bugs.

22. `src/camera/grammar/ShotAliases.js`
   - Allows input aliases:
     - `cu` -> `closeUp`
     - `mcu` -> `mediumCloseUp`
     - `ots` -> `overTheShoulder`
     - `ews` -> `extremeWideShot`

23. `src/camera/grammar/AngleVocabulary.js`
   - Canonical yaw/pitch/roll degrees.

24. `src/camera/grammar/AngleResolver.js`
   - Converts names/intent into degrees:
     - power -> low angle
     - confusion -> dutch
     - clarity -> eye-level three-quarter

25. `src/camera/grammar/LensVocabulary.js`
   - 2D-friendly lens language:
     - wide
     - normal
     - portrait
     - telephoto
     - macro
   - Maps to zoom/compression/parallax hints.

26. `src/camera/grammar/MovementVocabulary.js`
   - Camera movement names:
     - static
     - pushIn
     - pullOut
     - pan
     - tilt
     - follow
     - track
     - arc
     - reveal
     - whipPan

27. `src/camera/grammar/ShotIntentVocabulary.js`
   - Beat intent names:
     - dialogue
     - reaction
     - objectReveal
     - foodAction
     - decision
     - emotion
     - group
     - comedy
     - tension
     - explanation

---

# Phase 3 — Target System

Create folder:

`src/camera/targets/`

## New files

28. `src/camera/targets/CameraTarget.js`
   - Standard target shape:
     - id
     - type: actor/prop/point/group
     - priority
     - role: speaker/listener/object/reaction/background
     - bounds
     - position

29. `src/camera/targets/TargetResolver.js`
   - Converts beat + state into target objects.
   - Finds actors/props by ID.
   - Handles arrays and missing targets safely.

30. `src/camera/targets/TargetBoundsResolver.js`
   - Computes combined bounds for actors and props.
   - Uses character scale and prop size.

31. `src/camera/targets/TargetPriorityResolver.js`
   - Determines primary/secondary targets.
   - Speaker usually primary in dialogue.
   - Object primary for inserts.
   - Group moment balances all.

32. `src/camera/targets/TargetRoleClassifier.js`
   - Classifies targets into story roles.

33. `src/camera/targets/TargetListNormalizer.js`
   - Accepts strings, objects, arrays, nested targets.
   - Returns clean target list.

34. `src/camera/targets/TargetSafetyFilter.js`
   - Removes invalid/offstage/missing targets.
   - Falls back to visible actors.

35. `src/camera/targets/TargetDebugLabeler.js`
   - Debug/test helper for plan inspection.

---

# Phase 4 — Automatic Shot Selection

Create folder:

`src/camera/planning/`

## New files

36. `src/camera/planning/AutomaticShotPlanner.js`
   - Main entry point.
   - Input: beat/event/state/previous camera.
   - Output: shot plan.

37. `src/camera/planning/ShotRuleEngine.js`
   - Applies rules and scoring.

38. `src/camera/planning/ShotCandidateGenerator.js`
   - Generates possible shots from target count and intent.

39. `src/camera/planning/ShotScorer.js`
   - Scores candidates by:
     - target coverage
     - emotion match
     - action clarity
     - continuity
     - mobile safety
     - variety

40. `src/camera/planning/BeatIntentResolver.js`
   - Infers intent from beat fields:
     - speaker/text -> dialogue
     - prop/object -> object action
     - emotion/moment -> emotion
     - interaction -> interaction

41. `src/camera/planning/DialogueShotPlanner.js`
   - Dialogue-specific planning:
     - two-shot
     - over-the-shoulder
     - clean single
     - shot/reverse shot
     - reaction shot

42. `src/camera/planning/ObjectShotPlanner.js`
   - Object-specific planning:
     - insert
     - hands insert
     - food insert
     - cutaway
     - reaction insert

43. `src/camera/planning/ActionShotPlanner.js`
   - Movement/action planning:
     - follow
     - tracking
     - full shot
     - cowboy shot

44. `src/camera/planning/EmotionShotPlanner.js`
   - Emotion planning:
     - close-up
     - medium close-up
     - push-in
     - high/low angle based on emotion.

45. `src/camera/planning/GroupShotPlanner.js`
   - Two/three/group shots.

46. `src/camera/planning/RevealShotPlanner.js`
   - Reveal, pan, push-in, object reveal.

47. `src/camera/planning/ComedyShotPlanner.js`
   - Wider framing for comedy beats.

48. `src/camera/planning/ShotVarietyMemory.js`
   - Avoids repeating same shot too often.
   - Can be state-based or pure function with previous plans.

49. `src/camera/planning/ShotPlan.js`
   - Standard shot plan data object.

---

# Phase 5 — Framing and Geometry

Create folder:

`src/camera/framing/`

## New files

50. `src/camera/framing/FrameBounds.js`
   - A rectangle/bounds utility.

51. `src/camera/framing/TargetFrameSolver.js`
   - Converts target bounds to camera x/y/zoom.

52. `src/camera/framing/MobileSafeFrameSolver.js`
   - Guarantees mobile UI and top bars do not cover action.

53. `src/camera/framing/HeadroomSolver.js`
   - Adds correct headroom for close/medium/wide shots.

54. `src/camera/framing/LookRoomSolver.js`
   - Gives screen space in direction of gaze/action.

55. `src/camera/framing/LeadRoomSolver.js`
   - Gives screen space for movement.

56. `src/camera/framing/RuleOfThirdsSolver.js`
   - Places subject on thirds for strong composition.

57. `src/camera/framing/GroupBalanceSolver.js`
   - Balances two-shot/three-shot/group shot spacing.

58. `src/camera/framing/ObjectInsertFrameSolver.js`
   - Frames object + hands/face safely.

59. `src/camera/framing/ShotScaleResolver.js`
   - Converts shotType to zoom and vertical crop.

60. `src/camera/framing/CameraClampSolver.js`
   - Prevents black void and impossible camera positions.

---

# Phase 6 — Angle and Degrees

Create folder:

`src/camera/angles/`

## New files

61. `src/camera/angles/YawAngleResolver.js`
   - Horizontal angle names and degrees.

62. `src/camera/angles/PitchAngleResolver.js`
   - High/low angle pitch.

63. `src/camera/angles/RollAngleResolver.js`
   - Dutch angle roll.

64. `src/camera/angles/CharacterViewAngleMapper.js`
   - Maps yaw degrees to character view:
     - front
     - threeQuarter
     - side
     - backThreeQuarter
     - back
   - Important for future character view rendering.

65. `src/camera/angles/AngleIntentResolver.js`
   - Story intent to angle:
     - power -> low
     - vulnerability -> high
     - confusion -> dutch
     - intimacy -> eye-level

66. `src/camera/angles/AnglePlan.js`
   - Standard object: yaw/pitch/roll/name.

---

# Phase 7 — Camera Movement

Create folder:

`src/camera/movement/`

## New files

67. `src/camera/movement/CameraMovePlanner.js`
   - Chooses static/push/pull/pan/follow.

68. `src/camera/movement/PushInPlanner.js`
   - Emotional push-in.

69. `src/camera/movement/PullOutPlanner.js`
   - Reveal/ending pull-out.

70. `src/camera/movement/PanPlanner.js`
   - Pan between targets.

71. `src/camera/movement/FollowPlanner.js`
   - Follow walking actor.

72. `src/camera/movement/ArcPlanner.js`
   - 2D fake arc/orbit as parallax/angle hint.

73. `src/camera/movement/RevealMovePlanner.js`
   - Reveal object/actor.

74. `src/camera/movement/MovementEasing.js`
   - Easing profiles:
     - gentle
     - dramatic
     - comedySnap
     - whip

75. `src/camera/movement/MovementPlan.js`
   - Standard movement object.

---

# Phase 8 — Continuity System

Create folder:

`src/camera/continuity/`

## New files

76. `src/camera/continuity/ShotContinuityEngine.js`
   - Prevents jarring jumps.

77. `src/camera/continuity/AxisOfActionGuard.js`
   - Keeps 180-degree rule unless intentional.

78. `src/camera/continuity/EyeLineMatchGuard.js`
   - Keeps gaze direction consistent.

79. `src/camera/continuity/ShotReverseShotPlanner.js`
   - Alternates speaker/listener shots.

80. `src/camera/continuity/CutSeverityEstimator.js`
   - Scores how violent a cut is.

81. `src/camera/continuity/CutSmoother.js`
   - Adds transition or movement when jump is too strong.

82. `src/camera/continuity/ShotHistoryStore.js`
   - Stores recent shot types and angles.

83. `src/camera/continuity/ContinuityPlan.js`
   - Standard continuity metadata.

---

# Phase 9 — Runtime Integration

## Existing files to rewrite fully

84. `src/core/app/director/logic/CameraProcessor.js`
   - Route camera events through `AutomaticShotPlanner` when event says:
     - `autoShot: true`
     - `targets`
     - `shotIntent`
     - missing hard-coded cameraId
   - Preserve old camera IDs for backward compatibility.

85. `src/core/app/director/logic/CinematicCameraEnforcer.js`
   - Replace ad hoc rules with shot plan safety and target resolving.
   - Keep as final safety layer.

86. `src/camera/MobileCameraMercy.js`
   - Use `MobileSafeFrameSolver` and shot scale categories.

87. `src/camera/ShotComposer.js`
   - Delegate to new framing solvers or become compatibility wrapper.

88. `src/camera/SafeFrameResolver.js`
   - Delegate to `TargetFrameSolver`/`MobileSafeFrameSolver`.

89. `src/camera/production/ShotPlanner.js`
   - Become facade over `AutomaticShotPlanner`.

90. `src/camera/production/FramingSolver.js`
   - Use new framing solver.

91. `src/camera/production/SubjectBounds.js`
   - Use target bounds resolver.

92. `src/camera/production/ShotContinuityPlanner.js`
   - Use continuity engine.

93. `src/camera/production/CameraEmotionRules.js`
   - Use emotion shot planner and angle intent resolver.

94. `src/core/renderer/pipeline/phases/CameraPhase.js`
   - Read new fields if necessary:
     - `rotation`
     - `angleDegrees`
     - `movement`
   - Must not break existing transform.

95. `src/core/renderer/pipeline/phases/CinematicCharacterStaging.js`
   - Use shot plan fields:
     - `renderDetailMode`
     - `stagingMode`
     - `targetActors`
   - Avoid hiding actors unless shot plan explicitly allows it.

---

# Phase 10 — Scene Data Upgrade

## Existing files to rewrite

96. `src/data/scenes/healthyLunch/cameras.js`
   - Replace many hard-coded camera assumptions with reusable shot templates:
     - establish
     - twoShotTable
     - guideCleanSingle
     - kidCleanSingle
     - foodInsert
     - reactionClose
     - celebrationWide

97. `src/data/scenes/healthyLunch/beats.js`
   - Add automatic shot requests per beat:
     - `autoShot: true`
     - `shotIntent`
     - `targets`
     - `primaryTarget`
     - `angleIntent`
     - `movementIntent`
   - Example:
     - guide explains -> twoShot / OTS / medium
     - kid reacts -> reaction close-up
     - apple hops -> food insert
     - bite -> hands insert + reaction
     - celebration -> wide group shot

98. `src/data/scenes/healthyLunch/metadata.js`
   - Add default shot grammar rules for this scene:
     - genre: educational cartoon
     - camera style: stable, warm, low jitter
     - mobile safety margins

99. `src/data/scenes/healthyLunch/index.js`
   - Ensure beat compiler includes shot fields.

---

# Phase 11 — Dialogue / Beat Compiler

## Existing files

100. `src/director/dialogue/DialogueBeatCompiler.js`
   - Compile beat-level shot fields into camera events.
   - Camera events should include:
     - `autoShot`
     - `targets`
     - `shotIntent`
     - `angleIntent`
     - `movementIntent`
     - `speaker`
     - `listener`
     - `prop`

101. `src/core/app/director/logic/EventProcessor.js`
   - Ensure camera event routes cleanly and state stores shot plan metadata.

---

# Phase 12 — Debug / Inspector

Create folder:

`src/camera/debug/`

## New files

102. `src/camera/debug/ShotPlanLogger.js`
   - Logs chosen shot type, targets, zoom, angle degrees.

103. `src/camera/debug/ShotPlanOverlay.js`
   - Optional overlay showing target boxes / safe frame.

104. `src/camera/debug/ShotDecisionTrace.js`
   - Stores candidate scores for debugging.

105. `src/camera/debug/CameraDebugFlags.js`
   - Toggle debug visualizations.

---

# Phase 13 — AI / Authoring Integration

## Existing/new files

106. `src/ai/SceneDSL.js`
   - Add methods:
     - `.shot(type)`
     - `.autoShot(intent, targets)`
     - `.angle(nameOrDegrees)`
     - `.movement(type)`
     - `.focus(targets)`

107. `src/ai/SceneCompiler.js`
   - Compile AI scene instructions into shot grammar requests.

108. `src/ai/PerformancePromptCompiler.js`
   - Add camera-intent extraction:
     - “dramatic” -> push-in / close
     - “show food” -> insert
     - “conversation” -> two-shot / shot-reverse-shot

109. `src/ai/ShotPromptCompiler.js`
   - New file.
   - Converts natural language into shot request.

---

# Phase 14 — Editor UI Plan

Existing editor panels may need later connection. Planned files:

110. `src/editor/model/ShotInspectorModel.js`
   - Exposes shot type, targets, angle degrees, movement, safe frame.

111. `src/editor/panels/ShotGrammarPanel.js`
   - Lets user pick shot type and target list.

112. `src/editor/panels/CameraAnglePanel.js`
   - Shows yaw/pitch/roll degrees.

113. `src/editor/panels/ShotDecisionTracePanel.js`
   - Shows why automatic shot was chosen.

114. `src/editor/panels/CameraSafeFramePanel.js`
   - Shows mobile safe frame.

---

# Phase 15 — Verification

## New verify files

115. `tools/verify/shotVocabularySmoke.js`
   - All shot names exist.
   - Aliases resolve.

116. `tools/verify/angleVocabularySmoke.js`
   - Angle names resolve to degrees correctly.

117. `tools/verify/targetResolverSmoke.js`
   - Actor/prop target list resolves from fake state.

118. `tools/verify/automaticShotPlannerSmoke.js`
   - Dialogue -> two-shot or OTS.
   - Emotion -> close-up.
   - Object action -> insert.
   - Group -> group/wide.

119. `tools/verify/framingSolverSmoke.js`
   - Target bounds produce sane x/y/zoom.
   - No black-void camera values.

120. `tools/verify/mobileSafeShotSmoke.js`
   - Mobile safe margins work.

121. `tools/verify/shotContinuitySmoke.js`
   - Consecutive shots do not violently jump unless intended.

122. `tools/verify/shotAngleCharacterViewSmoke.js`
   - Degrees map to character view names.

123. `tools/verify/dialogueAutoShotSmoke.js`
   - Healthy lunch beats compile camera events with automatic shot request fields.

124. `tools/verify/healthyLunchAutoShotSmoke.js`
   - Runtime camera event produces safe plan for healthy lunch.

125. `tools/verify/shotPromptCompilerSmoke.js`
   - Natural language shot prompts compile.

## Existing file

126. `package.json`
   - Add verify scripts.
   - Include in full `npm run verify`.

---

# Phase 16 — Implementation Order

1. Read current camera files and data.
2. Create grammar vocabulary files.
3. Create target resolver files.
4. Create automatic planning files.
5. Create framing solvers.
6. Create angle degree solvers.
7. Create movement planners.
8. Create continuity engine.
9. Wire `CameraProcessor` through `AutomaticShotPlanner`.
10. Rewrite `CinematicCameraEnforcer` as final safety layer.
11. Rewrite `MobileCameraMercy` to use mobile safe frame solver.
12. Rewrite production facade files.
13. Rewrite healthy lunch camera/beat data to request automatic shots.
14. Rewrite `DialogueBeatCompiler` to emit auto-shot camera events.
15. Add debug/AI/editor foundations.
16. Add verification.
17. Run targeted verifies.
18. Run full `npm run verify`.
19. Browser test with fresh query.
20. Tune shot grammar values from screenshots.

---

# Backward Compatibility Rules

- If a camera event has explicit `x`, `y`, `zoom`, it must still work.
- If a camera event has old `cameraId`, it must still work.
- If `autoShot` is missing, old behavior should continue.
- If target IDs are missing, planner must fall back to visible characters.
- If all targets are missing, planner must return a safe master shot.
- No camera planner may output extreme zooms by default.
- No camera planner may reveal black void.
- Mobile safe frame always wins over artistic framing.

---

# Desired Result

After implementation, a beat can simply say:

```js
{
  speaker: 'guide',
  listener: 'kid',
  text: 'Look at this apple.',
  autoShot: true,
  shotIntent: 'dialogueWithObject',
  targets: ['guide', 'kid', 'apple'],
  primaryTarget: 'guide',
  objectTarget: 'apple'
}
```

And the engine chooses:

- medium two-shot if both are talking
- food insert when apple acts
- reaction close-up when kid reacts
- OTS if dialogue needs intimacy
- safe mobile framing
- proper yaw/pitch/roll degrees
- stable continuity from previous shot

The camera becomes a film director, not a random zoom machine.

