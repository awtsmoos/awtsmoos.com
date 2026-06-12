B"H

# Next legendary visual pass: immense file-by-file breakdown

This is a planning document only. No implementation in this pass. The goal is to define the next round of visual work after the current split, beauty, ownership, and idempotency passes.

## Prime law
Split more. Every module owns one visual vessel, one state, or one effect. If a file begins to explain two visual concepts, it must be split. Entry files import only.

## Current stable base to preserve
- `geelooy/style/foundation/*`
- `geelooy/style/foundation/beauty/*`
- `geelooy/style/social/home/index.css`
- `geelooy/style/heichelos/heichel/index.css`
- `geelooy/heichelos/post/styles/main.css`
- existing beauty JS + diagnostics + tests

The next pass should add higher product-level artistry without breaking scroll, eager rendering, modal stability, or test contracts.

---

# 1. Global design system expansion

## 1.1 Elevation language
1. `geelooy/style/foundation/legend/elevation/level-0.css`
- Page background / ground layer.
- Variables only: `--elevation-0-bg`, `--elevation-0-shadow`.

2. `geelooy/style/foundation/legend/elevation/level-1.css`
- Normal cards.
- `--elevation-1-bg`, `--elevation-1-border`, `--elevation-1-shadow`.

3. `geelooy/style/foundation/legend/elevation/level-2.css`
- Featured cards / active panels.

4. `geelooy/style/foundation/legend/elevation/level-3.css`
- Sticky bars / floating controls.

5. `geelooy/style/foundation/legend/elevation/level-4.css`
- Drawers / sidebars / sheets.

6. `geelooy/style/foundation/legend/elevation/level-5.css`
- Modals / command palettes.

7. `geelooy/style/foundation/legend/elevation/index.css`
- Imports levels 0-5.

## 1.2 Unified spacing rhythm
8. `geelooy/style/foundation/legend/rhythm/space-scale.css`
- 8-point-ish rhythm: `--rhythm-1` through `--rhythm-10`.

9. `geelooy/style/foundation/legend/rhythm/section-spacing.css`
- Generic vertical section rhythm variables.

10. `geelooy/style/foundation/legend/rhythm/card-spacing.css`
- Card padding rules and variables.

11. `geelooy/style/foundation/legend/rhythm/reader-spacing.css`
- Reader-specific verse/chapter rhythm variables.

12. `geelooy/style/foundation/legend/rhythm/index.css`
- Imports rhythm modules.

## 1.3 Unified glow hierarchy
13. `geelooy/style/foundation/legend/glow/ambient.css`
- Soft page background glow variables.

14. `geelooy/style/foundation/legend/glow/interactive.css`
- Hover/focus glow variables.

15. `geelooy/style/foundation/legend/glow/sacred.css`
- Seal / title / crown glow variables.

16. `geelooy/style/foundation/legend/glow/danger-success.css`
- Non-gold semantic glow.

17. `geelooy/style/foundation/legend/glow/index.css`
- Imports glow modules.

## 1.4 Unified motion language
18. `geelooy/style/foundation/legend/motion/page-enter.css`
- Page/chamber entrance animations.

19. `geelooy/style/foundation/legend/motion/card-hover.css`
- Shared hover transform rules via reusable variables/classes.

20. `geelooy/style/foundation/legend/motion/focus-shift.css`
- Focus mode transitions.

21. `geelooy/style/foundation/legend/motion/orb-hover.css`
- Floating orb motion.

22. `geelooy/style/foundation/legend/motion/index.css`
- Imports motion modules.

## 1.5 Master legend entry
23. `geelooy/style/foundation/legend/index.css`
- Imports elevation, rhythm, glow, motion.
- Imported by Home/Heichel/Reader legendary entries, not global reset.

---

# 2. Home: from social feed to living sanctuary

## 2.1 New Home legendary entry
24. `geelooy/style/social/home/legend/index.css`
- Imports foundation legend and all Home legend modules.
- `home/index.css` imports this last.

## 2.2 Feed river system
25. `geelooy/style/social/home/legend/feed-river/rail.css`
- Vertical luminous rail behind feed cards.

26. `geelooy/style/social/home/legend/feed-river/nodes.css`
- Node dots aligned to each post card.

27. `geelooy/style/social/home/legend/feed-river/card-connection.css`
- Pseudo lines between composer and cards.

28. `geelooy/style/social/home/legend/feed-river/index.css`
- Imports feed river modules.

## 2.3 Card dimensionality
29. `geelooy/style/social/home/legend/cards/active-depth.css`
- Active/hover card gains depth.

30. `geelooy/style/social/home/legend/cards/receding-depth.css`
- Non-active cards slightly quieter.

31. `geelooy/style/social/home/legend/cards/sacred-edge.css`
- Shared inner edge lighting for home cards.

32. `geelooy/style/social/home/legend/cards/meta-row.css`
- Footer/meta row refinement.

33. `geelooy/style/social/home/legend/cards/index.css`
- Imports card modules.

## 2.4 Discovery constellation
34. `geelooy/style/social/home/legend/constellation/shell.css`
- Discovery card becomes constellation container.

35. `geelooy/style/social/home/legend/constellation/nodes.css`
- Discovery links as glowing nodes.

36. `geelooy/style/social/home/legend/constellation/connectors.css`
- Connector lines between discovery nodes.

37. `geelooy/style/social/home/legend/constellation/orbit-hover.css`
- Hover pulse / orbit effect.

38. `geelooy/style/social/home/legend/constellation/index.css`
- Imports constellation modules.

## 2.5 Sanctuary entrance identity
39. `geelooy/style/social/home/legend/sanctuary/monument-title.css`
- Larger, more intentional Geelooy title.

40. `geelooy/style/social/home/legend/sanctuary/seal-pulse.css`
- Very subtle seal pulse.

41. `geelooy/style/social/home/legend/sanctuary/mission-copy.css`
- Better paragraph width and rhythm.

42. `geelooy/style/social/home/legend/sanctuary/nav-artifacts.css`
- Side links become artifact slabs.

43. `geelooy/style/social/home/legend/sanctuary/index.css`
- Imports sanctuary modules.

## 2.6 Home JS enhancements
44. `geelooy/scripts/awtsmoos/social/home/legend/feedCardObserver.js`
- Adds `.is-feed-current` to card closest to viewport center.

45. `geelooy/scripts/awtsmoos/social/home/legend/constellationState.js`
- Adds data-state to discovery links on focus/hover.

46. `geelooy/scripts/awtsmoos/social/home/legend/index.js`
- Runs Home legendary behavior safely.

47. `geelooy/index.html`
- Full rewrite to include legend script and bump cache to `legend-001` after tests.

---

# 3. Heichel: palace / archive / journey

## 3.1 New Heichel legend entry
48. `geelooy/style/heichelos/heichel/legend/index.css`
- Imports foundation legend and Heichel legend modules.
- `heichel/index.css` imports this last.

## 3.2 Monument hero
49. `geelooy/style/heichelos/heichel/legend/monument/shell.css`
- Hero becomes palace entrance.

50. `geelooy/style/heichelos/heichel/legend/monument/crown-glow.css`
- Seal/crown glow.

51. `geelooy/style/heichelos/heichel/legend/monument/title-scale.css`
- Monumental title size and line-height.

52. `geelooy/style/heichelos/heichel/legend/monument/description-scroll.css`
- Description gets graceful max-width and rhythm, no clipping.

53. `geelooy/style/heichelos/heichel/legend/monument/stat-altars.css`
- Stats become small altar-like pills.

54. `geelooy/style/heichelos/heichel/legend/monument/index.css`
- Imports monument modules.

## 3.3 Scroll transformation states
55. `geelooy/style/heichelos/heichel/legend/scroll-state/expanded.css`
- Default hero state.

56. `geelooy/style/heichelos/heichel/legend/scroll-state/compressed.css`
- `.hero-compact` refined layout.

57. `geelooy/style/heichelos/heichel/legend/scroll-state/topbar-merge.css`
- Compact hero visually merges with topbar.

58. `geelooy/style/heichelos/heichel/legend/scroll-state/index.css`
- Imports scroll-state modules.

## 3.4 Search as command center
59. `geelooy/style/heichelos/heichel/legend/search/command-shell.css`
- Search row becomes command-center surface.

60. `geelooy/style/heichelos/heichel/legend/search/input-aura.css`
- Input focus aura.

61. `geelooy/style/heichelos/heichel/legend/search/filter-chip.css`
- Better filter chip states.

62. `geelooy/style/heichelos/heichel/legend/search/index.css`
- Imports search modules.

## 3.5 Artifact card system
63. `geelooy/style/heichelos/heichel/legend/artifact-card/surface.css`
- Cards become manuscript/tablet artifacts.

64. `geelooy/style/heichelos/heichel/legend/artifact-card/media-glyph.css`
- Media thumb as glyph seal.

65. `geelooy/style/heichelos/heichel/legend/artifact-card/title-rhythm.css`
- Title and description rhythm.

66. `geelooy/style/heichelos/heichel/legend/artifact-card/meta-badges.css`
- Reading time / post count / series count badge visuals.

67. `geelooy/style/heichelos/heichel/legend/artifact-card/recent-glow.css`
- `.is-recent` or `[data-recent]` subtle edge glow.

68. `geelooy/style/heichelos/heichel/legend/artifact-card/index.css`
- Imports artifact card modules.

## 3.6 Journey timeline real styling
69. `geelooy/style/heichelos/heichel/legend/journey/shell.css`
- Future timeline container.

70. `geelooy/style/heichelos/heichel/legend/journey/line.css`
- Vertical timeline line.

71. `geelooy/style/heichelos/heichel/legend/journey/node.css`
- Node card style.

72. `geelooy/style/heichelos/heichel/legend/journey/current-node.css`
- Current chapter highlight.

73. `geelooy/style/heichelos/heichel/legend/journey/index.css`
- Imports journey modules.

## 3.7 Empty states
74. `geelooy/style/heichelos/heichel/legend/empty/shell.css`
- Empty state layout.

75. `geelooy/style/heichelos/heichel/legend/empty/orb.css`
- Empty state glow/orb.

76. `geelooy/style/heichelos/heichel/legend/empty/copy.css`
- Empty state typography.

77. `geelooy/style/heichelos/heichel/legend/empty/action.css`
- Empty call-to-action.

78. `geelooy/style/heichelos/heichel/legend/empty/index.css`
- Imports empty modules.

## 3.8 Heichel JS legend
79. `geelooy/heichelos/heichel/modules/legend/cardDepthObserver.js`
- Adds current/receding classes to cards around viewport center.

80. `geelooy/heichelos/heichel/modules/legend/heroScrollDepth.js`
- Refines hero compact states with thresholds.

81. `geelooy/heichelos/heichel/modules/legend/emptyStateBlessing.js`
- Adds CSS class to empty lists if they have no content.

82. `geelooy/heichelos/heichel/modules/legend/index.js`
- Runs legend behaviors safely.

83. `geelooy/heichelos/heichel/app.js`
- Full rewrite to import/run legend safely.

---

# 4. Reader: sacred manuscript chamber

## 4.1 New reader legend entry
84. `geelooy/heichelos/post/styles/reader-legend/index.css`
- Imports foundation legend + reader legend modules.
- `post/styles/main.css` imports this last.

## 4.2 Chamber atmosphere
85. `geelooy/heichelos/post/styles/reader-legend/chamber/deep-background.css`
- More dimensional reading background.

86. `geelooy/heichelos/post/styles/reader-legend/chamber/manuscript-noise.css`
- Low-opacity texture.

87. `geelooy/heichelos/post/styles/reader-legend/chamber/light-columns.css`
- Subtle vertical light columns behind text.

88. `geelooy/heichelos/post/styles/reader-legend/chamber/index.css`
- Imports chamber modules.

## 4.3 Chapter entrance
89. `geelooy/heichelos/post/styles/reader-legend/chapter-entrance/title-rise.css`
- Title entrance animation.

90. `geelooy/heichelos/post/styles/reader-legend/chapter-entrance/glow-settle.css`
- Crown glow settles after load.

91. `geelooy/heichelos/post/styles/reader-legend/chapter-entrance/content-reveal.css`
- Verse reveal on initial load.

92. `geelooy/heichelos/post/styles/reader-legend/chapter-entrance/index.css`
- Imports chapter entrance modules.

## 4.4 Verse rhythm
93. `geelooy/heichelos/post/styles/reader-legend/verse-rhythm/separators.css`
- Sacred separators between verse cards.

94. `geelooy/heichelos/post/styles/reader-legend/verse-rhythm/current-verse.css`
- Current verse refined highlight.

95. `geelooy/heichelos/post/styles/reader-legend/verse-rhythm/past-future.css`
- Soft fade for past/future when focus active.

96. `geelooy/heichelos/post/styles/reader-legend/verse-rhythm/important-passage.css`
- Pull quote / important passage visual.

97. `geelooy/heichelos/post/styles/reader-legend/verse-rhythm/index.css`
- Imports verse-rhythm modules.

## 4.5 Progress spine upgrade
98. `geelooy/heichelos/post/styles/reader-legend/progress-spine/shell.css`
- Better spine rail.

99. `geelooy/heichelos/post/styles/reader-legend/progress-spine/markers.css`
- Better markers.

100. `geelooy/heichelos/post/styles/reader-legend/progress-spine/active-marker.css`
- Active marker with glow.

101. `geelooy/heichelos/post/styles/reader-legend/progress-spine/labels.css`
- Optional labels/tooltips.

102. `geelooy/heichelos/post/styles/reader-legend/progress-spine/index.css`
- Imports progress spine modules.

## 4.6 Margin notes / future Talmud feel
103. `geelooy/heichelos/post/styles/reader-legend/margin-notes/shell.css`
- Margin note container.

104. `geelooy/heichelos/post/styles/reader-legend/margin-notes/note-card.css`
- Note card style.

105. `geelooy/heichelos/post/styles/reader-legend/margin-notes/connector.css`
- Line connecting note to verse.

106. `geelooy/heichelos/post/styles/reader-legend/margin-notes/responsive.css`
- Collapse notes into bottom sheet on mobile.

107. `geelooy/heichelos/post/styles/reader-legend/margin-notes/index.css`
- Imports margin note modules.

## 4.7 Completion sanctuary
108. `geelooy/heichelos/post/styles/reader-legend/completion/shell.css`
- End-of-chapter completion container.

109. `geelooy/heichelos/post/styles/reader-legend/completion/orb.css`
- Completion glow orb.

110. `geelooy/heichelos/post/styles/reader-legend/completion/actions.css`
- Next chapter / back to series buttons.

111. `geelooy/heichelos/post/styles/reader-legend/completion/index.css`
- Imports completion modules.

## 4.8 Reader JS legend
112. `geelooy/heichelos/post/logic/legend/centerSectionObserver.js`
- Adds `.is-reader-center` to center-most visible section.

113. `geelooy/heichelos/post/logic/legend/readingProgressState.js`
- Updates CSS variable `--reader-progress`.

114. `geelooy/heichelos/post/logic/legend/completionState.js`
- Detects near-bottom and adds `.reader-near-complete`.

115. `geelooy/heichelos/post/logic/legend/sectionKindClassifier.js`
- Applies `data-awtsmoos-kind` heuristics only if no metadata exists.

116. `geelooy/heichelos/post/logic/legend/index.js`
- Runs reader legend safely.

117. `geelooy/heichelos/post/postLogic.js`
- Full rewrite to run legend safely after beauty.

---

# 5. Comments and commentary visual expansion

## 5.1 Reader comment legend CSS
118. `geelooy/heichelos/post/styles/reader-legend/comments/thread-shell.css`
- Comment thread region.

119. `geelooy/heichelos/post/styles/reader-legend/comments/thread-lines.css`
- Thread line geometry.

120. `geelooy/heichelos/post/styles/reader-legend/comments/identity-chip.css`
- Alias/author chip styling.

121. `geelooy/heichelos/post/styles/reader-legend/comments/reply-card.css`
- Reply card style.

122. `geelooy/heichelos/post/styles/reader-legend/comments/inline-anchor.css`
- Inline comment anchor visual.

123. `geelooy/heichelos/post/styles/reader-legend/comments/index.css`
- Imports comment legend modules.

## 5.2 Comment JS optional state
124. `geelooy/heichelos/post/logic/legend/commentThreadState.js`
- Adds depth classes to nested comments if DOM supports it.

125. `geelooy/heichelos/post/logic/legend/inlineAnchorState.js`
- Highlights corresponding verse when hovering inline anchor.

These can be included in reader legend index later.

---

# 6. Loading and empty states

## 6.1 Global loading visuals
126. `geelooy/style/foundation/legend/loading/skeleton.css`
- Generic skeleton shimmer.

127. `geelooy/style/foundation/legend/loading/orb.css`
- Loading orb.

128. `geelooy/style/foundation/legend/loading/text.css`
- Loading copy styles.

129. `geelooy/style/foundation/legend/loading/index.css`
- Imports loading modules.

## 6.2 Templates / loading include
130. `geelooy/loading.html`
- If used globally, full rewrite to add legend loading classes.

---

# 7. Scrollbar and platform polish

131. `geelooy/style/foundation/legend/platform/scrollbar.css`
- Themed scrollbar.

132. `geelooy/style/foundation/legend/platform/safe-area.css`
- Consistent safe-area variables and utility classes.

133. `geelooy/style/foundation/legend/platform/android-touch.css`
- Android-specific touch affordance polish, scoped by page classes.

134. `geelooy/style/foundation/legend/platform/index.css`
- Imports platform modules.

`foundation/legend/index.css` should import platform/index.css after creation.

---

# 8. Tests for the next pass

135. `geelooy/style/test/legendImportGraph.test.mjs`
- Verifies all legend CSS imports exist.

136. `geelooy/style/test/legendModuleBudget.test.mjs`
- Verifies no legend CSS module exceeds 120 lines except index files.

137. `geelooy/style/test/noLegendScrollTrap.test.mjs`
- Ensures legend modules do not set global `overflow:hidden`, `height:100vh`, or full-page pointer traps.

138. `geelooy/style/test/legendTemplateContract.test.mjs`
- Verifies templates bumped to `legend-001` only after implementation.

139. `geelooy/heichelos/heichel/modules/legend/test/cardDepthObserver.test.mjs`
- Tests observer guard / cleanup.

140. `geelooy/heichelos/post/logic/legend/test/centerSectionObserver.test.mjs`
- Tests no-crash without IntersectionObserver and idempotency with it.

141. `geelooy/heichelos/post/logic/legend/test/progressState.test.mjs`
- Tests CSS progress variable calculation.

142. `geelooy/heichelos/post/logic/legend/test/sectionKindClassifier.test.mjs`
- Tests section classification does not overwrite existing metadata.

143. `geelooy/scripts/awtsmoos/social/home/legend/test/feedCardObserver.test.mjs`
- Tests center-card class assignment.

---

# 9. Template / boot touches

144. `geelooy/index.html`
- Add home legend script.
- Bump Home CSS + scripts to `legend-001`.

145. `geelooy/heichelos/heichel/_awtsmoos.heichel.html`
- Bump Heichel CSS/JS to `legend-001`.

146. `geelooy/heichelos/_awtsmoos.heichel.html`
- Same fallback bump.

147. `geelooy/heichelos/post/_awtsmoos.post.html`
- Bump reader CSS/JS to `legend-001`.

148. `geelooy/heichelos/heichel/app.js`
- Import/run Heichel legend index after beauty.

149. `geelooy/heichelos/post/postLogic.js`
- Import/run reader legend index after beauty.

---

# 10. Suggested implementation order

## Phase A: Foundation legend only
Files 1-23, 126-129, 131-134.
No templates changed yet.

## Phase B: Home legend
Files 24-47 + tests 143.
Import home legend CSS last.
Do not bump template until tests pass.

## Phase C: Heichel legend
Files 48-83 + tests 139.
Import Heichel legend CSS last.
Run Heichel JS safely from app.js.

## Phase D: Reader legend
Files 84-117 + tests 140-142.
Import Reader legend CSS last.
Run Reader JS safely from postLogic.

## Phase E: Comments and loading
Files 118-130.
Keep comment JS optional unless DOM proves stable.

## Phase F: Template version bump
Files 144-149.
Bump to `legend-001`.

## Phase G: Full test wall
Run old tests + beauty tests + legend tests:
- cssImportGraph
- cssSmallModuleBudget
- noFixedReaderShell
- templateVersionContract
- beautyImportGraph
- beautyModuleBudget
- noBeautyGlobalTrap
- beautyTemplateContract
- heichelNoDuplicateOwnership
- homePointerContract
- reader/heichel visual tests
- legendImportGraph
- legendModuleBudget
- noLegendScrollTrap
- legendTemplateContract
- all legend JS tests
- ReaderWheelBridge
- scrollContract

---

# 11. Highest risk areas
1. Reader legend JS: must not create duplicate observers.
2. Section classifier: must not misclassify or overwrite real metadata.
3. Template bump: must happen only after all imports/tests pass.
4. Loading.html: global include may affect unrelated pages.
5. Home body pseudo-elements: avoid more global body pseudo use; use page root instead.

# 12. Best immediate next mini-pass
If not implementing all at once, start with:
- foundation legend elevation/rhythm/glow
- home feed-river
- Heichel monument hero
- reader verse-rhythm
- legend tests

This would create visible upgrade while keeping risk low.
