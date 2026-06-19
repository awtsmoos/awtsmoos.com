B"H

# Massive Brainstorm — Every File To Touch For Full Cinematic 2D Scheme

This is a planning-only brainstorm for moving the current engine toward the ideal reference: centered stable story-driven shots, rich room, bearded hat characters, expressive acting, real 2D inserts, smooth camera grammar, and mobile-safe composition.

The priority is **do not break existing things**. Every implementation must be additive, fallback-driven, and verified. Existing character faces/limbs/camera/props continue to work. New production systems wrap or extend them.

---

## The visible gap from current to goal

The current screenshot still shows:

1. Too much empty wall/ceiling.
2. Camera sometimes too far and not emotionally motivated.
3. Room details not as rich as the goal board.
4. Characters improved, but not yet cinematic enough.
5. Hat/beard/accessory layer exists, but needs better proportions and face integration.
6. Table/props are not dominant enough in insert shots.
7. Scene flow is not yet a true storyboard.
8. Mobile browser/UI still steals lower frame area.
9. Shot grammar exists, but default scene must deliberately exploit it.
10. Backdrop needs authored composition, not just scattered details.

---

# Phase 1 — Safety Infrastructure First

## Files to inspect/read

1. `src/core/renderer/pipeline/FrameClearPhase.js`
   - Verify black void prevention is active every frame.

2. `src/core/renderer/pipeline/layers/StageLayerComposer.js`
   - Ensure screen-space fallback background stays behind camera world.

3. `src/core/renderer/pipeline/phases/CameraPhase.js`
   - Confirm camera transform uses x/y/zoom consistently.

4. `src/camera/framing/MobileSafeFrameSolver.js`
   - Tune mobile-safe crop and zoom limits.

5. `src/camera/framing/CameraClampSolver.js`
   - Tune hard clamps.

6. `src/core/app/director/logic/CinematicCameraEnforcer.js`
   - Smooth camera and target centering.

## Files to touch

7. `src/core/renderer/pipeline/FrameClearPhase.js`
   - Keep full-screen warm fill.
   - Add optional production-room gradient.
   - Add CSS black-void resistance.

8. `src/core/renderer/pipeline/layers/StageLayerComposer.js`
   - Add screen-space room safety base.
   - Add optional screen parallax layer.
   - Keep camera_world unchanged.

9. `src/camera/framing/MobileSafeFrameSolver.js`
   - Add portrait-safe shot profiles:
     - widePortrait
     - twoShotPortrait
     - closePortrait
     - insertPortrait
   - Prevent subjects from becoming tiny.

10. `src/camera/framing/CameraClampSolver.js`
   - Add shot-specific x/y/zoom clamps.
   - Guarantee no extreme zoom-out on mobile.

11. `src/core/app/director/logic/CinematicCameraEnforcer.js`
   - Add shot hold damping.
   - Add target center fallback.
   - Add mobile lower-control avoidance.

---

# Phase 2 — True Shot Grammar Completion

## Existing files to extend carefully

12. `src/camera/grammar/ShotVocabulary.js`
   - Add composition metadata for every shot:
     - subjectScale
     - headroom
     - tableVisibility
     - backgroundVisibility
     - emotionalUse
     - mobileRisk

13. `src/camera/grammar/ShotTypeNames.js`
   - Keep all constants.
   - Add missing specific goal board names if needed:
     - `warmStudyWide`
     - `rabbiTwoShot`
     - `seferInsert`
     - `soupInsert`

14. `src/camera/grammar/ShotAliases.js`
   - Add aliases:
     - `studyWide`
     - `rabbiClose`
     - `sefer`
     - `soup`

15. `src/camera/planning/AutomaticShotPlanner.js`
   - Improve event-to-shot plan conversion.
   - Preserve old explicit camera behavior.

16. `src/camera/planning/ShotScorer.js`
   - Reward centered stable two-shots.
   - Penalize empty space.
   - Penalize tiny actors.
   - Penalize repeated same crop too long.

17. `src/camera/planning/ShotCandidateGenerator.js`
   - Make dialogue use actual cinematic sequence:
     - establishing -> twoShot -> OTS -> close -> insert -> reaction -> wider twoShot.

18. `src/camera/planning/DialogueShotPlanner.js`
   - Add shot/reverse-shot mode.
   - Add OTS if there are exactly two people.

19. `src/camera/planning/ObjectShotPlanner.js`
   - Better inserts for sefer/soup/cup/table.

20. `src/camera/planning/EmotionShotPlanner.js`
   - Stronger close-ups for reaction.

21. `src/camera/planning/GroupShotPlanner.js`
   - Group should preserve room richness but not make people too tiny.

22. `src/camera/planning/BeatIntentResolver.js`
   - Recognize `sefer`, `soup`, `dialogue`, `reaction`, `teaching`, `lchaim`, etc.

---

# Phase 3 — Cinematic Framing Geometry

## Files to touch

23. `src/camera/framing/TargetFrameSolver.js`
   - Replace generic center with shot-profile solver.
   - Two-shot should center midpoint and keep both chest-up or waist-up.
   - Wide should show room, but people must remain readable.
   - Insert should center prop and table.

24. `src/camera/framing/ShotScaleResolver.js`
   - Add 2D shot scale rules.

25. `src/camera/framing/HeadroomSolver.js`
   - Tune headroom for hats.
   - Hats must not clip.

26. `src/camera/framing/LookRoomSolver.js`
   - Speaker gets tiny look-room toward listener.

27. `src/camera/framing/LeadRoomSolver.js`
   - Movement lead only when actor walks.

28. `src/camera/framing/RuleOfThirdsSolver.js`
   - Disable aggressive thirds on mobile; center is better for phone.

29. `src/camera/framing/GroupBalanceSolver.js`
   - Weighted center of active targets.

30. `src/camera/framing/ObjectInsertFrameSolver.js`
   - Table insert shots should show object, hand, plate/book.

31. `src/camera/framing/FrameBounds.js`
   - Add utility for padded group bounds, aspect fitting, safe crop.

## Possible new files

32. `src/camera/framing/ShotProfileLibrary.js`
   - Defines exact crop profile per shot:
     - wide: zoom 0.82
     - two-shot: 1.02
     - OTS: 1.18
     - close: 1.35
     - insert: 1.48

33. `src/camera/framing/PortraitCompositionSolver.js`
   - Mobile-specific composition rules.

34. `src/camera/framing/TableAwareFrameSolver.js`
   - Keeps table visible in room dialogue.

35. `src/camera/framing/HatHeadroomSolver.js`
   - Prevents black hats from clipping.

---

# Phase 4 — Camera Continuity / Smooth Movement

## Files to touch

36. `src/camera/continuity/ShotContinuityEngine.js`
   - Avoid violent jumps.
   - Add min hold time.

37. `src/camera/continuity/CutSeverityEstimator.js`
   - Score x/y/zoom/shotType changes.

38. `src/camera/continuity/CutSmoother.js`
   - Convert big jump into smooth pan/push.

39. `src/camera/continuity/ShotHistoryStore.js`
   - Track last N shots.

40. `src/camera/continuity/ShotReverseShotPlanner.js`
   - Alternate speaker closeups safely.

41. `src/camera/continuity/AxisOfActionGuard.js`
   - Keep left/right relationship consistent.

42. `src/camera/continuity/EyeLineMatchGuard.js`
   - Make gaze direction match camera side.

## Possible new files

43. `src/camera/continuity/ShotHoldTimer.js`
   - Prevent jitter by enforcing a minimum hold.

44. `src/camera/continuity/CameraSettleFilter.js`
   - Smooth final x/y/zoom over frames.

45. `src/camera/continuity/MobileJitterKiller.js`
   - Quantize tiny subpixel drift on mobile.

---

# Phase 5 — Rich 2D Room Renderer

## Existing file to improve

46. `src/core/renderer/scene/FoodKitchenBackdrop.js`
   - Rename mentally as warm room backdrop, or keep for compatibility.
   - Needs more goal-like details:
     - dark wood bookcase
     - shelves filled with books/seforim
     - framed Hebrew wall sign
     - curtains
     - window with plants
     - table lamp
     - clock
     - coat hooks
     - warm shadows
     - wood grain
     - table dishes

## Better approach: split room renderer into modules

Create folder:

47. `src/core/renderer/scene/productionRoom/`

New files:

48. `src/core/renderer/scene/productionRoom/ProductionRoomBackdrop.js`
   - Main composed renderer.

49. `src/core/renderer/scene/productionRoom/RoomPalette.js`
   - Warm study colors.

50. `src/core/renderer/scene/productionRoom/WallRenderer.js`
   - Wall base, plaster texture, subtle gradients.

51. `src/core/renderer/scene/productionRoom/FloorRenderer.js`
   - Wood floor, rug, shadows.

52. `src/core/renderer/scene/productionRoom/TableRenderer.js`
   - Large table, table front, table top, legs.

53. `src/core/renderer/scene/productionRoom/BookcaseRenderer.js`
   - Shelves/books/seforim.

54. `src/core/renderer/scene/productionRoom/WindowRenderer.js`
   - Window, curtains, sunlight, plants.

55. `src/core/renderer/scene/productionRoom/WallDecorRenderer.js`
   - Frames, Hebrew plaque, clock, portraits.

56. `src/core/renderer/scene/productionRoom/LampRenderer.js`
   - Warm lamp glow.

57. `src/core/renderer/scene/productionRoom/PlantRenderer.js`
   - Plants as authored shapes.

58. `src/core/renderer/scene/productionRoom/RoomDetailRenderer.js`
   - Small props, hooks, hats/coats.

59. `src/core/renderer/scene/productionRoom/RoomParallaxLayers.js`
   - Back wall, table plane, foreground plane.

60. `src/core/renderer/scene/productionRoom/RoomSafeCoverage.js`
   - Ensures renderer covers more than camera bounds.

## Integration file

61. `src/core/renderer/pipeline/phases/ScenePhase.js`
   - Select `ProductionRoomBackdrop` when scene style is `goal_board_warm_study`.
   - Fallback to existing scene renderer.

---

# Phase 6 — Table / Insert Shot Prop System

## Existing files to inspect/touch

62. `src/core/renderer/props/PropBuilder.js`
   - Improve prop-specific drawings.

63. `src/core/renderer/props/PropRenderer.js`
   - Confirm layering and camera transform.

64. `src/core/renderer/props/PropArtLibrary.js` if exists.

## New files

65. `src/core/renderer/props/production/ProductionPropLibrary.js`
   - Sefer/book, soup bowl, cup, spoon, bread, plate, note, pen, lamp, table objects.

66. `src/core/renderer/props/production/BookPropRenderer.js`
   - Closed sefer, open sefer, Hebrew title-like marks without requiring exact text.

67. `src/core/renderer/props/production/SoupPropRenderer.js`
   - Bowl, soup, matzah ball, herbs, spoon.

68. `src/core/renderer/props/production/CupPropRenderer.js`
   - Tea cup with handle and steam.

69. `src/core/renderer/props/production/PlatePropRenderer.js`
   - Plate, bread/food, shadows.

70. `src/core/renderer/props/production/TablePropClusterRenderer.js`
   - Cluster props for wide/two-shot.

71. `src/core/renderer/props/production/InsertPropRenderer.js`
   - High-detail insert version.

72. `src/core/renderer/props/production/PropShadowRenderer.js`
   - Better soft shadows.

73. `src/core/renderer/props/production/PropHighlightRenderer.js`
   - Tiny highlights.

---

# Phase 7 — Character Identity: Rabbi/Sage Production Style

## Existing stable character files to touch

74. `src/character/factory/stable/StableCharacterAssembler.js`
   - Keep additive accessory layer.
   - Add production style flag mapping.

75. `src/character/factory/stable/StableAccessories2D.js`
   - Improve hat proportions.
   - Add beard volume, side curls, glasses.
   - Add vest/shirt collar accessory if safer here.

76. `src/character/factory/stable/StablePalette.js`
   - Add sage/rabbi palette defaults.

77. `src/character/factory/stable/StableRigMetrics.js`
   - Add metrics for adult male rabbi proportions.

78. `src/character/factory/stable/StableBody2D.js`
   - Better suit/vest/shirt layers.
   - Add jacket lapels, vest buttons, shirt sleeves.

79. `src/character/factory/stable/StableLimbs2D.js`
   - More natural hand gestures.
   - Gesturing hands for dialogue.

80. `src/character/factory/stable/StableShapeKit.js`
   - Better finger arcs, palms, cuffs.

81. `src/character/factory/stable/StableHair2D.js`
   - Hair under hat, side curls, beard compatibility.

82. `src/character/factory/stable/StableFace2D.js`
   - Ensure beard does not cover expressive mouth.

83. `src/character/factory/stable/face/FaceRenderer.js`
   - Stronger expression integration.

84. `src/character/factory/stable/face/FaceFrontRenderer.js`
   - Better front faces.

85. `src/character/factory/stable/face/FaceThreeQuarterRenderer.js`
   - Better 3/4 face and beard alignment.

86. `src/character/factory/stable/face/EyeRenderer.js` if exists.
   - Eye highlights, gaze direction, eyelids.

87. `src/character/factory/stable/face/MouthRenderer.js` if exists.
   - Phoneme shapes.

## New possible files

88. `src/character/factory/stable/StableBeard2D.js`
   - Dedicated beard shape, strands, jaw volume.

89. `src/character/factory/stable/StableHat2D.js`
   - Dedicated black hat renderer.

90. `src/character/factory/stable/StableGlasses2D.js`
   - Round glasses.

91. `src/character/factory/stable/StablePayos2D.js`
   - Side curls.

92. `src/character/factory/stable/StableSuit2D.js`
   - Vest/jacket/white shirt details.

93. `src/character/factory/stable/StableHands2D.js`
   - Move detailed hands out of limb file.

94. `src/character/style/RabbiCharacterStyle.js`
   - Style data for hats/beards/suits.

---

# Phase 8 — Facial Expression System

## Existing files

95. `src/performance/face/EmotionLibrary.js`
   - More expression poses.

96. `src/performance/face/FacePose.js`
   - Ensure fields support asymmetry.

97. `src/character/performance/CharacterPerformanceComposer.js`
   - Better face/body signal mixing.

98. `src/character/performance/CinematicFaceSignal.js`
   - More cinematic expression signal.

99. `src/character/performance/render/PerformanceRenderBridge.js`
   - Ensure face pose reaches renderer.

100. `src/character/performance/layers/EmotionLayer.js`
   - Emotion-to-pose blend.

101. `src/character/performance/layers/SpeechLayer.js`
   - Better mouth movement.

102. `src/character/performance/layers/FaceLayer.js`
   - Blinks/gaze/cheeks.

## New files

103. `src/performance/face/ExpressionBlendEngine.js`
   - Blend emotion + speech + reaction + gaze.

104. `src/performance/face/BrowExpressionModel.js`
   - Inner/outer brow, asymmetry, pinch.

105. `src/performance/face/EyeFocusModel.js`
   - Pupil direction, eyelids, blink timing.

106. `src/performance/face/MouthPhonemeModel.js`
   - Talk mouth shapes.

107. `src/performance/face/CheekAndSmileModel.js`
   - Smile + cheek lift.

108. `src/performance/face/ReactionExpressionLibrary.js`
   - Reaction presets: surprise, listening, amused, thoughtful, proud.

109. `src/performance/face/ExpressionTiming.js`
   - Microtiming: eyes react before mouth.

110. `src/performance/face/ListenerReactionEngine.js`
   - Listener acts while speaker talks.

---

# Phase 9 — Body Acting / Hands

## Existing files

111. `src/character/performance/CharacterPerformanceComposer.js`
   - Stronger gesture curves.

112. `src/character/performance/layers/GestureLayer.js`
   - Map gestures to arm/hand poses.

113. `src/character/performance/layers/LocomotionLayer.js`
   - Keep idle steady.

114. `src/character/factory/stable/StableLimbs2D.js`
   - Hand gestures, pointing, open palm, table gestures.

115. `src/character/factory/stable/StableBody2D.js`
   - Shoulder movement, breathing, jacket deformation.

## New files

116. `src/performance/body/DialogueGestureLibrary.js`
   - teach, explain, point, listen, disagree, laugh, bless, showBook.

117. `src/performance/body/HandPoseLibrary.js`
   - open palm, point, pinch, rest-on-table, hold-cup, hold-book.

118. `src/performance/body/IdleBreathModel.js`
   - subtle idle.

119. `src/performance/body/ListenerBodyModel.js`
   - nods, leans, reactions.

120. `src/performance/body/TableInteractionModel.js`
   - hands near table/objects.

---

# Phase 10 — Default Scene as Storyboard

## Existing default scene files

121. `src/data/scenes/default/DefaultLivingScene.js`
   - Make it the actual goal-board study room.
   - Two main characters, table, props.
   - Author stable positions.

122. `src/data/scenes/default/dialogueBeats.js`
   - Beat-by-beat storyboard:
     1. Establishing wide.
     2. Medium two-shot.
     3. OTS speaker.
     4. Medium close-up.
     5. Close-up reaction.
     6. Insert soup.
     7. Insert book.
     8. Medium dialogue.
     9. Wider two-shot.
     10. Low angle.
     11. High angle table.
     12. Profile shot.
     13. Wide group.
     14. Final pull-out.

123. `src/data/scenes/default/cameraRigs.js`
   - Named fallback rigs for each storyboard shot.

124. `src/data/scenes/default/index.js`
   - Keep export stable.

125. `src/ui/components/editor/panels/director/Panel.js`
   - Ensure PLAY_DETAILED_DEFAULT_SCENE launches this one.

## Possible new scene-specific files

126. `src/data/scenes/default/shotFlow.js`
   - Explicit shot flow array.

127. `src/data/scenes/default/studyRoomProps.js`
   - Prop definitions.

128. `src/data/scenes/default/scholarCharacters.js`
   - Character definitions.

129. `src/data/scenes/default/storyboardBeats.js`
   - Human-readable storyboard data.

130. `src/data/scenes/default/sceneStyle.js`
   - Style guide.

---

# Phase 11 — Scene Compiler / Director Integration

## Files

131. `src/director/dialogue/DialogueBeatCompiler.js`
   - Compile shot fields consistently.
   - Add OTS fields and insert fields.

132. `src/core/app/director/logic/CameraProcessor.js`
   - Auto-shot planning active and stable.

133. `src/core/app/director/logic/CharacterProcessor.js`
   - Ensure expressions/gestures apply.

134. `src/core/app/director/logic/SpeechProcessor.js`
   - Talk state and mouth movement.

135. `src/core/app/director/logic/EventProcessor.js`
   - Event sequencing.

136. `src/core/app/director/logic/PropProcessor.js`
   - Props and insert actions.

137. `src/core/app/Director.js`
   - Verify event timing and camera state hold.

---

# Phase 12 — Debug / Visual Diagnostics

## Existing/new debug files

138. `src/camera/debug/ShotPlanLogger.js`
   - Show chosen shot, targets, zoom.

139. `src/camera/debug/ShotPlanOverlay.js`
   - Draw safe frame/target boxes.

140. `src/camera/debug/ShotDecisionTrace.js`
   - Explain why shot chosen.

141. `src/camera/debug/CameraDebugFlags.js`
   - Toggle overlay.

New files:

142. `src/debug/VisualComparisonOverlay.js`
   - Shows current shot score compared to ideal.

143. `src/debug/CompositionScoreOverlay.js`
   - Empty-space ratio, subject size ratio, center offset.

144. `src/debug/RoomCoverageOverlay.js`
   - Detects exposed void/empty wall.

145. `src/debug/ActorReadabilityOverlay.js`
   - Character pixel size/readability.

---

# Phase 13 — Verification Tests

## Existing tests to update

146. `tools/verify/defaultDetailedSceneSmoke.js`
   - Default scene has scholar room, beards, hats, props, beat count.

147. `tools/verify/cameraCenteredSmoke.js`
   - Centered two-shot.

148. `tools/verify/backdropCoverageSmoke.js`
   - No black void, backdrop overdraw.

149. `tools/verify/facialExpressionSmoke.js`
   - Expressions exist.

150. `tools/verify/accessoryRenderSmoke.js`
   - Hat/beard/glasses visible.

151. `tools/verify/automaticShotPlannerSmoke.js`
   - Dialogue, insert, reaction.

152. `tools/verify/mobileSafeShotSmoke.js`
   - Portrait constraints.

153. `tools/verify/shotContinuitySmoke.js`
   - No violent jumps.

154. `tools/verify/renderConsumptionSmoke.js`
   - Character render still works.

## New tests

155. `tools/verify/studyRoomSceneSmoke.js`
   - Confirms goal-board default scene identity.

156. `tools/verify/roomDetailDensitySmoke.js`
   - Counts room details/props.

157. `tools/verify/scholarCharacterStyleSmoke.js`
   - Hat, beard, glasses, suit/vest.

158. `tools/verify/storyboardShotFlowSmoke.js`
   - Confirms default beats include all main shot types.

159. `tools/verify/mobileNoBlackVoidSmoke.js`
   - Simulates camera and checks frame base fill.

160. `tools/verify/insertShotSmoke.js`
   - Soup/book/cup insert framing.

161. `tools/verify/listenerActingSmoke.js`
   - Listener reaction events exist.

162. `tools/verify/expressionTimingSmoke.js`
   - Speech + face data produce mouth/brows/eyes.

163. `tools/verify/tableAwareFramingSmoke.js`
   - Table stays visible in two-shots.

164. `tools/verify/shotProfileLibrarySmoke.js`
   - Shot profiles valid.

## Package file

165. `package.json`
   - Add verify scripts, then include in full verify.

---

# Phase 14 — Editor / Authoring Support

## Existing files

166. `src/editor/model/ShotInspectorModel.js`
   - Show target/shot/zoom/angle.

167. `src/editor/panels/ShotGrammarPanel.js`
   - Choose shot type.

168. `src/editor/panels/CameraAnglePanel.js`
   - Degree controls.

169. `src/editor/panels/ShotDecisionTracePanel.js`
   - Why this shot?

170. `src/editor/panels/CameraSafeFramePanel.js`
   - Mobile safe frame.

## New files

171. `src/editor/panels/StoryboardPanel.js`
   - Shows shot flow.

172. `src/editor/panels/RoomDetailPanel.js`
   - Toggle room details.

173. `src/editor/panels/CharacterStylePanel.js`
   - Hat/beard/glasses/suit controls.

174. `src/editor/panels/ExpressionPanel.js`
   - Face expression controls.

175. `src/editor/panels/InsertShotPanel.js`
   - Book/soup/cup insert authoring.

---

# Phase 15 — AI Scene Authoring

## Existing files

176. `src/ai/ShotPromptCompiler.js`
   - Map text to goal-board shots.

177. `src/ai/PerformancePromptCompiler.js`
   - Better acting extraction.

178. `src/ai/SceneCompiler.js`
   - Compile story text to scene.

179. `src/ai/SceneDSL.js`
   - Add helpers.

## New files

180. `src/ai/StudyRoomPromptCompiler.js`
   - Turn “two rabbis learning at a table” into scene.

181. `src/ai/StoryboardPromptCompiler.js`
   - Creates shot flow.

182. `src/ai/CharacterStylePromptCompiler.js`
   - Beards/hats/clothes.

183. `src/ai/RoomDetailPromptCompiler.js`
   - Shelves/books/window/lamp.

184. `src/ai/ExpressionPromptCompiler.js`
   - Emotional acting.

---

# Phase 16 — Implementation Order To Avoid Breakage

1. Read all involved files first.
2. Write tests for desired outputs before deep changes.
3. Improve camera clamp/profile only.
4. Run camera tests.
5. Add room renderer modules behind old fallback.
6. Run backdrop tests.
7. Add character accessories as additive layer.
8. Run accessory and render tests.
9. Improve expression library and composer.
10. Run facial tests.
11. Rewrite default scene as storyboard.
12. Run default scene tests.
13. Add prop renderers.
14. Run insert tests.
15. Add continuity smoothing.
16. Run shot continuity tests.
17. Add debug overlays.
18. Run full verify.
19. Browser screenshot compare.
20. Tune values, not architecture.

---

# Critical fallback rules

- If a new renderer fails, fall back to old simple shape.
- If shot plan fails, fall back to centered two-shot.
- If target missing, use all visible actors.
- If prop missing, skip insert or draw fallback box.
- If face pose missing, use warm expression.
- If accessories missing, character still renders.
- If mobile safe frame unknown, assume portrait and conservative zoom.
- If room style unknown, use old backdrop.

---

# Definition of “done”

The scene is not done until screenshots show:

1. No black void.
2. Characters large enough to read faces.
3. Two-shot centered like the board.
4. At least one good close-up.
5. At least one clear insert shot.
6. Room full of details.
7. Beards/hats/glasses visible.
8. Hands gesture naturally.
9. Listener reacts while speaker talks.
10. Camera movement feels stable.

