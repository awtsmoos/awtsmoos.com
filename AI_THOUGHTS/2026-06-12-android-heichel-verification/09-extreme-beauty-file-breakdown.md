B"H

# Extreme beautiful visual system: exact file breakdown

This is not the previous cleanup split. This is the next visual product layer: making Home, Heichel, Series, Reader, Modals, Commentary, and mobile feel like one sacred living world. Every file should be small and own one vessel or one effect.

## Prime architecture rule
- Entry files import only.
- Every module owns one visual idea.
- No module should exceed 120 lines.
- No feature should depend on one giant visual-polish file.
- New beauty layers should sit above stable split modules and can be disabled by removing one import.

---

# A. Global beauty foundation

## A1. Tokens to create
1. `geelooy/style/foundation/beauty/palette/parchment.css`
- Light manuscript palette.
- Variables: --theme-bg, --theme-surface, --theme-ink, --theme-muted, --theme-accent.

2. `geelooy/style/foundation/beauty/palette/night-gold.css`
- Deep black/gold palette.
- Used for reader and sacred dark panels.

3. `geelooy/style/foundation/beauty/palette/sapphire.css`
- Cool blue/silver alternate mood.

4. `geelooy/style/foundation/beauty/palette/emerald.css`
- Green/gold alternate mood.

5. `geelooy/style/foundation/beauty/palette/crimson.css`
- Royal red/gold alternate mood.

6. `geelooy/style/foundation/beauty/palette/index.css`
- Imports all palette modules.

## A2. Light and depth modules
7. `geelooy/style/foundation/beauty/light/ambient-wash.css`
- Global radial background washes.
- No page-specific selectors except data attributes / root classes.

8. `geelooy/style/foundation/beauty/light/gold-glow.css`
- Reusable golden glow variables and classes.

9. `geelooy/style/foundation/beauty/light/edge-light.css`
- Subtle card edge highlights.

10. `geelooy/style/foundation/beauty/light/spotlight.css`
- Spotlight focus glow for current reading area.

11. `geelooy/style/foundation/beauty/light/index.css`
- Imports light modules.

12. `geelooy/style/foundation/beauty/depth/layers.css`
- Defines --layer-bg, --layer-content, --layer-float, --layer-modal, --layer-toast.

13. `geelooy/style/foundation/beauty/depth/shadow-stack.css`
- Premium shadow stack tokens.

14. `geelooy/style/foundation/beauty/depth/glass-stack.css`
- Glass backgrounds and border variables.

15. `geelooy/style/foundation/beauty/depth/index.css`
- Imports depth modules.

## A3. Motion modules
16. `geelooy/style/foundation/beauty/motion/timing.css`
- --motion-instant, --motion-quick, --motion-normal, --motion-slow.

17. `geelooy/style/foundation/beauty/motion/easing.css`
- --ease-out-soft, --ease-enter, --ease-exit, --ease-sacred.

18. `geelooy/style/foundation/beauty/motion/reveal.css`
- Generic reveal animation classes.

19. `geelooy/style/foundation/beauty/motion/reduced.css`
- Reduced motion overrides.

20. `geelooy/style/foundation/beauty/motion/index.css`
- Imports motion modules.

## A4. Sacred geometry
21. `geelooy/style/foundation/beauty/geometry/dividers.css`
- Sacred divider line styles.

22. `geelooy/style/foundation/beauty/geometry/seals.css`
- Circular seal base styles.

23. `geelooy/style/foundation/beauty/geometry/runes.css`
- Tiny glyph/rune markers.

24. `geelooy/style/foundation/beauty/geometry/index.css`
- Imports geometry modules.

## A5. Master beauty entry
25. `geelooy/style/foundation/beauty/index.css`
- Imports palette, light, depth, motion, geometry.
- Used by Home, Heichel, Reader.

---

# B. Home page extreme beauty layer

## B1. New entry
26. `geelooy/style/social/home/beauty/index.css`
- Imports all home beauty modules.
- Home `index.css` should import this last.

## B2. Atmosphere
27. `geelooy/style/social/home/beauty/atmosphere/background.css`
- Rich cosmic/parchment background.

28. `geelooy/style/social/home/beauty/atmosphere/particles.css`
- CSS-only tiny glows using pseudo-elements.

29. `geelooy/style/social/home/beauty/atmosphere/vignette.css`
- Edge vignette and depth fade.

30. `geelooy/style/social/home/beauty/atmosphere/index.css`
- Imports atmosphere modules.

## B3. Sanctuary card upgrades
31. `geelooy/style/social/home/beauty/sanctuary/seal.css`
- Living seal in left card.

32. `geelooy/style/social/home/beauty/sanctuary/title.css`
- Big title typography and glow.

33. `geelooy/style/social/home/beauty/sanctuary/links.css`
- Premium navigation link styling.

34. `geelooy/style/social/home/beauty/sanctuary/index.css`
- Imports sanctuary modules.

## B4. Feed beauty
35. `geelooy/style/social/home/beauty/feed/topbar.css`
- Feed topbar glass / native app feel.

36. `geelooy/style/social/home/beauty/feed/tabs-slider.css`
- Animated-looking segmented tab slider using CSS background.

37. `geelooy/style/social/home/beauty/feed/composer-glow.css`
- Composer glow and active state.

38. `geelooy/style/social/home/beauty/feed/card-depth.css`
- Deeper post card shadows and layers.

39. `geelooy/style/social/home/beauty/feed/media-frames.css`
- Visual frames for post media glow.

40. `geelooy/style/social/home/beauty/feed/index.css`
- Imports feed modules.

## B5. Discovery beauty
41. `geelooy/style/social/home/beauty/discovery/constellation.css`
- Discovery links as constellation-like nodes.

42. `geelooy/style/social/home/beauty/discovery/card.css`
- Discovery card premium surface.

43. `geelooy/style/social/home/beauty/discovery/index.css`
- Imports discovery modules.

## B6. Home responsive beauty
44. `geelooy/style/social/home/beauty/responsive/mobile.css`
- Mobile native app polish.

45. `geelooy/style/social/home/beauty/responsive/tablet.css`
- Tablet polish.

46. `geelooy/style/social/home/beauty/responsive/desktop.css`
- Desktop polish.

47. `geelooy/style/social/home/beauty/responsive/index.css`
- Imports responsive modules.

---

# C. Heichel extreme beauty layer

## C1. New entry
48. `geelooy/style/heichelos/heichel/beauty/index.css`
- Imports all Heichel beauty modules.
- Existing Heichel `index.css` should import this last.

## C2. Heichel identity
49. `geelooy/style/heichelos/heichel/beauty/identity/shell.css`
- Whole Heichel identity area background logic.

50. `geelooy/style/heichelos/heichel/beauty/identity/seal.css`
- Animated / glowing Heichel seal.

51. `geelooy/style/heichelos/heichel/beauty/identity/title.css`
- Title treatment: large, readable, sacred.

52. `geelooy/style/heichelos/heichel/beauty/identity/description.css`
- Description typography and reveal space.

53. `geelooy/style/heichelos/heichel/beauty/identity/stats.css`
- Sacred stats pills.

54. `geelooy/style/heichelos/heichel/beauty/identity/index.css`
- Imports identity modules.

## C3. Scroll-reactive-ready hero
55. `geelooy/style/heichelos/heichel/beauty/hero/compact-state.css`
- Classes for future scroll-compressed hero.

56. `geelooy/style/heichelos/heichel/beauty/hero/depth-glow.css`
- Hero glow layers.

57. `geelooy/style/heichelos/heichel/beauty/hero/ornaments.css`
- Decorative CSS ornaments.

58. `geelooy/style/heichelos/heichel/beauty/hero/index.css`
- Imports hero modules.

## C4. Navigation and tabs
59. `geelooy/style/heichelos/heichel/beauty/navigation/topbar-glass.css`
- More premium topbar.

60. `geelooy/style/heichelos/heichel/beauty/navigation/bottom-orbit.css`
- Bottom nav as orbit dock.

61. `geelooy/style/heichelos/heichel/beauty/navigation/breadcrumb-ribbon.css`
- Future breadcrumb ribbon styling.

62. `geelooy/style/heichelos/heichel/beauty/navigation/tabs-slider.css`
- Premium animated-looking tabs.

63. `geelooy/style/heichelos/heichel/beauty/navigation/index.css`
- Imports navigation modules.

## C5. Cards hierarchy
64. `geelooy/style/heichelos/heichel/beauty/cards/base-depth.css`
- Card depth and layered background.

65. `geelooy/style/heichelos/heichel/beauty/cards/featured.css`
- Larger featured card class.

66. `geelooy/style/heichelos/heichel/beauty/cards/compact.css`
- Compact card variant.

67. `geelooy/style/heichelos/heichel/beauty/cards/ghost.css`
- Ghost/reference card variant.

68. `geelooy/style/heichelos/heichel/beauty/cards/progress.css`
- Progress bar/ring visuals for future reading progress.

69. `geelooy/style/heichelos/heichel/beauty/cards/menu.css`
- Premium context menu style.

70. `geelooy/style/heichelos/heichel/beauty/cards/index.css`
- Imports card modules.

## C6. Series journey view
71. `geelooy/style/heichelos/heichel/beauty/journey/timeline.css`
- Vertical chapter timeline.

72. `geelooy/style/heichelos/heichel/beauty/journey/node.css`
- Timeline node/card visual.

73. `geelooy/style/heichelos/heichel/beauty/journey/connectors.css`
- Lines between journey nodes.

74. `geelooy/style/heichelos/heichel/beauty/journey/index.css`
- Imports journey modules.

## C7. Heichel modal beauty
75. `geelooy/style/heichelos/heichel/beauty/modal/backdrop.css`
- Ritual gate backdrop.

76. `geelooy/style/heichelos/heichel/beauty/modal/chamber.css`
- Modal chamber glow and geometry.

77. `geelooy/style/heichelos/heichel/beauty/modal/steps.css`
- Future wizard step visual system.

78. `geelooy/style/heichelos/heichel/beauty/modal/actions.css`
- Action button premium states.

79. `geelooy/style/heichelos/heichel/beauty/modal/index.css`
- Imports modal beauty modules.

## C8. Heichel responsive beauty
80. `geelooy/style/heichelos/heichel/beauty/responsive/mobile.css`
- Thumb zone and mobile spacing.

81. `geelooy/style/heichelos/heichel/beauty/responsive/tablet.css`
- Tablet layout improvements.

82. `geelooy/style/heichelos/heichel/beauty/responsive/desktop.css`
- Desktop layout improvements.

83. `geelooy/style/heichelos/heichel/beauty/responsive/index.css`
- Imports responsive modules.

---

# D. Reader extreme beauty layer

## D1. New entry
84. `geelooy/heichelos/post/styles/reader-beauty/index.css`
- Imports all reader beauty modules.
- Post `main.css` should import this last.

## D2. Manuscript chamber
85. `geelooy/heichelos/post/styles/reader-beauty/chamber/background.css`
- Dark / parchment reading chamber background.

86. `geelooy/heichelos/post/styles/reader-beauty/chamber/vignette.css`
- Reader vignette edges.

87. `geelooy/heichelos/post/styles/reader-beauty/chamber/noise.css`
- Subtle paper/noise texture using gradients.

88. `geelooy/heichelos/post/styles/reader-beauty/chamber/index.css`
- Imports chamber modules.

## D3. Title crown
89. `geelooy/heichelos/post/styles/reader-beauty/title/crown-shell.css`
- Title crown vessel.

90. `geelooy/heichelos/post/styles/reader-beauty/title/kicker.css`
- Kicker and meta lines.

91. `geelooy/heichelos/post/styles/reader-beauty/title/title-type.css`
- Main title typography.

92. `geelooy/heichelos/post/styles/reader-beauty/title/ornaments.css`
- Decorative dividers around title.

93. `geelooy/heichelos/post/styles/reader-beauty/title/index.css`
- Imports title modules.

## D4. Verse / section beauty
94. `geelooy/heichelos/post/styles/reader-beauty/verses/card.css`
- Section card premium styling.

95. `geelooy/heichelos/post/styles/reader-beauty/verses/type-teaching.css`
- Teaching verse style.

96. `geelooy/heichelos/post/styles/reader-beauty/verses/type-story.css`
- Story verse style.

97. `geelooy/heichelos/post/styles/reader-beauty/verses/type-question.css`
- Question verse style.

98. `geelooy/heichelos/post/styles/reader-beauty/verses/type-commentary.css`
- Commentary verse style.

99. `geelooy/heichelos/post/styles/reader-beauty/verses/anchors.css`
- Copy/share anchor visuals.

100. `geelooy/heichelos/post/styles/reader-beauty/verses/numbering.css`
- Verse number / glyph system.

101. `geelooy/heichelos/post/styles/reader-beauty/verses/index.css`
- Imports verse modules.

## D5. Reading focus mode
102. `geelooy/heichelos/post/styles/reader-beauty/focus/halo.css`
- Current paragraph/section halo.

103. `geelooy/heichelos/post/styles/reader-beauty/focus/dim-background.css`
- Dims non-focused content.

104. `geelooy/heichelos/post/styles/reader-beauty/focus/lens.css`
- Scribe lens visual overlay.

105. `geelooy/heichelos/post/styles/reader-beauty/focus/index.css`
- Imports focus modules.

## D6. Progress spine
106. `geelooy/heichelos/post/styles/reader-beauty/progress/spine.css`
- Vertical side progress spine.

107. `geelooy/heichelos/post/styles/reader-beauty/progress/markers.css`
- Chapter/verse markers.

108. `geelooy/heichelos/post/styles/reader-beauty/progress/current.css`
- Current marker style.

109. `geelooy/heichelos/post/styles/reader-beauty/progress/index.css`
- Imports progress modules.

## D7. Floating controls beauty
110. `geelooy/heichelos/post/styles/reader-beauty/controls/orbs.css`
- Control buttons as orbs.

111. `geelooy/heichelos/post/styles/reader-beauty/controls/magnetic-hover.css`
- Hover / active feel.

112. `geelooy/heichelos/post/styles/reader-beauty/controls/labels.css`
- Better labels.

113. `geelooy/heichelos/post/styles/reader-beauty/controls/index.css`
- Imports controls modules.

## D8. Commentary sidebar as knowledge chamber
114. `geelooy/heichelos/post/styles/reader-beauty/commentary/chamber.css`
- Sidebar chamber surface.

115. `geelooy/heichelos/post/styles/reader-beauty/commentary/comment-card.css`
- Comment cards.

116. `geelooy/heichelos/post/styles/reader-beauty/commentary/thread-lines.css`
- Thread connection lines.

117. `geelooy/heichelos/post/styles/reader-beauty/commentary/composer.css`
- Composer premium style.

118. `geelooy/heichelos/post/styles/reader-beauty/commentary/index.css`
- Imports commentary modules.

## D9. Settings sheet beauty
119. `geelooy/heichelos/post/styles/reader-beauty/settings/presets.css`
- Future reading preset cards.

120. `geelooy/heichelos/post/styles/reader-beauty/settings/font-preview.css`
- Font preview card styling.

121. `geelooy/heichelos/post/styles/reader-beauty/settings/sliders.css`
- Range controls.

122. `geelooy/heichelos/post/styles/reader-beauty/settings/color-pots.css`
- Color picker styling.

123. `geelooy/heichelos/post/styles/reader-beauty/settings/index.css`
- Imports settings modules.

## D10. Reader responsive beauty
124. `geelooy/heichelos/post/styles/reader-beauty/responsive/mobile.css`
- Mobile reader native flow.

125. `geelooy/heichelos/post/styles/reader-beauty/responsive/tablet.css`
- Tablet margins and controls.

126. `geelooy/heichelos/post/styles/reader-beauty/responsive/desktop.css`
- Desktop margins, progress spine, commentary layout.

127. `geelooy/heichelos/post/styles/reader-beauty/responsive/index.css`
- Imports responsive modules.

---

# E. JS needed for visual behavior, still small

## E1. Scroll-reactive Heichel hero
128. `geelooy/heichelos/heichel/modules/beauty/scrollHeroState.js`
- Adds/removes `.hero-compact` on Heichel shell based on scroll.

129. `geelooy/heichelos/heichel/modules/beauty/ambientMotion.js`
- Adds data attributes for slow atmosphere changes.

130. `geelooy/heichelos/heichel/modules/beauty/index.js`
- Runs Heichel beauty behaviors safely.

131. `geelooy/heichelos/heichel/app.js`
- Full rewrite needed to import and run Heichel beauty index after manifestWorld.

## E2. Reader focus and progress
132. `geelooy/heichelos/post/logic/beauty/currentSectionTracker.js`
- Tracks visible section via IntersectionObserver.

133. `geelooy/heichelos/post/logic/beauty/focusModeState.js`
- Adds `.reader-focus-active` and `.is-current-section` classes.

134. `geelooy/heichelos/post/logic/beauty/progressSpine.js`
- Creates / updates progress spine markers.

135. `geelooy/heichelos/post/logic/beauty/controlState.js`
- Adds state classes for controls.

136. `geelooy/heichelos/post/logic/beauty/index.js`
- Runs reader beauty behaviors safely.

137. `geelooy/heichelos/post/postLogic.js`
- Full rewrite needed to import and run reader beauty after ignite.

## E3. Home optional behavior
138. `geelooy/scripts/awtsmoos/social/home/beauty/ambientPointer.js`
- Optional pointer glow movement.

139. `geelooy/scripts/awtsmoos/social/home/beauty/index.js`
- Runs home ambient beauty.

140. `geelooy/index.html`
- Full rewrite to include the home beauty script if desired.

---

# F. Template touches
141. `geelooy/index.html`
- Keep `/style/social/home/index.css?v=split-001`.
- Later bump to `beauty-001` after imports added.
- Optionally add home beauty script.

142. `geelooy/heichelos/heichel/_awtsmoos.heichel.html`
- Bump Heichel CSS/JS to `beauty-001`.

143. `geelooy/heichelos/_awtsmoos.heichel.html`
- Same fallback route bump.

144. `geelooy/heichelos/post/_awtsmoos.post.html`
- Bump post CSS/JS to `beauty-001`.

---

# G. Tests needed
145. `geelooy/style/test/beautyImportGraph.test.mjs`
- Verifies new beauty entries and all imports exist.

146. `geelooy/style/test/beautyModuleBudget.test.mjs`
- Same 120-line budget for beauty modules.

147. `geelooy/style/test/noBeautyGlobalTrap.test.mjs`
- Ensures beauty CSS does not set global `overflow:hidden`, `height:100vh`, or pointer-blocking full-screen traps.

148. `geelooy/style/test/beautyTemplateContract.test.mjs`
- Verifies templates use beauty cache versions after implementation.

149. `geelooy/heichelos/heichel/modules/beauty/test/scrollHeroState.test.mjs`
- Tests compact hero class logic.

150. `geelooy/heichelos/post/logic/beauty/test/currentSectionTracker.test.mjs`
- Tests current-section callback logic.

151. `geelooy/heichelos/post/logic/beauty/test/progressSpine.test.mjs`
- Tests marker count from sections.

---

# H. Implementation phases

## Phase 1: create beauty foundation only
Files 1-25. No templates changed yet. Tests: import graph and budget.

## Phase 2: home beauty layer
Files 26-47, then update home index import. Test home route.

## Phase 3: Heichel CSS beauty layer
Files 48-83, update Heichel CSS entry import. Test Heichel route.

## Phase 4: Reader CSS beauty layer
Files 84-127, update post main import. Test post route.

## Phase 5: JS behavior, Heichel
Files 128-131. Test no crash and compact class behavior.

## Phase 6: JS behavior, Reader
Files 132-137. Test no crash, progress spine, current section state.

## Phase 7: Optional home JS
Files 138-140 only if needed; keep disabled if performance risk.

## Phase 8: template cache bump
Files 141-144. Bump to beauty-001.

## Phase 9: final test wall
Run all previous tests plus beauty tests plus live inspectRuntime on:
- `/`
- `/heichelos/ikar?view=series`
- `/heichelos/ikar/series/likutteiAmarim/4?idx=0`

---

# I. Highest-risk files
1. `geelooy/heichelos/post/styles/main.css` because reader imports determine scroll safety.
2. `geelooy/heichelos/post/postLogic.js` because it boots reader.
3. `geelooy/heichelos/heichel/app.js` because it boots Heichel.
4. `geelooy/style/heichelos/heichel/index.css` because import order matters.
5. `geelooy/style/social/home/index.css` because old wrapper still exists.

# J. Safe strategy
- Add beauty modules first.
- Import beauty modules last.
- Never remove stable split modules in same pass.
- Add tests before template bump.
- Only then bump caches.
