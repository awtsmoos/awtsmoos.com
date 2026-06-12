B"H

# Extremely focused visual architecture breakdown into small modules

## Prime law
No more giant visual files. Every visual idea becomes a small, named module. Each module should answer one question: what vessel does this style own?

## Target visual architecture

### Global foundation
1. geelooy/style/foundation/tokens/color.css
- all gold, ink, vellum, dark glass, danger, success tokens
- no selectors except :root

2. geelooy/style/foundation/tokens/space.css
- spacing scale: --space-1 through --space-9
- safe area variables
- bottom nav clearance

3. geelooy/style/foundation/tokens/radius.css
- --radius-xs/s/m/l/xl/pill

4. geelooy/style/foundation/tokens/shadow.css
- --shadow-card, --shadow-float, --shadow-modal, --shadow-glow

5. geelooy/style/foundation/tokens/type.css
- font families
- type scale
- line height scale

6. geelooy/style/foundation/tokens/motion.css
- transitions, easing, reduced motion defaults

7. geelooy/style/foundation/index.css
- imports all token modules only

8. geelooy/style/foundation/reset/scroll.css
- html/body scroll ownership
- touch-action pan-y
- overscroll behavior

9. geelooy/style/foundation/reset/media.css
- img/video/svg max width

10. geelooy/style/foundation/reset/focus.css
- focus-visible rings

11. geelooy/style/foundation/reset/index.css
- imports reset modules

12. geelooy/style/foundation/effects/glass.css
- reusable glass/backdrop classes or variables

13. geelooy/style/foundation/effects/gold-border.css
- gold border utilities

14. geelooy/style/foundation/effects/ambient-bg.css
- background atmosphere layers

15. geelooy/style/foundation/effects/index.css
- imports effects modules

16. geelooy/style/awtsmoos-scroll-sovereignty.css
- should become a tiny compatibility shim importing foundation/reset/scroll.css plus overlay pointer safety

---

# Home page visual modules

## Current file to split
geelooy/style/social/home.css is too broad. Split into:

17. geelooy/style/social/home/index.css
- imports all home modules

18. geelooy/style/social/home/shell.css
- body background and .geelooy-home-shell grid only

19. geelooy/style/social/home/sanctuary-card.css
- left card
- logo mark
- title
- glow
- side links

20. geelooy/style/social/home/feed-shell.css
- center phone/feed vessel
- feed header

21. geelooy/style/social/home/feed-tabs.css
- For You / Following / Trending segmented tabs

22. geelooy/style/social/home/composer.css
- composer row only

23. geelooy/style/social/home/post-card.css
- feed post cards, author row, image glow, footer

24. geelooy/style/social/home/discovery-card.css
- right discovery panel only

25. geelooy/style/social/home/responsive.css
- all home media queries

26. geelooy/style/social/home/accessibility.css
- focus-visible and reduced motion for home

## Template touch
27. geelooy/index.html
- switch stylesheet from /style/social/home.css to /style/social/home/index.css?v=...

---

# Heichel visual modules

## Existing entry
geelooy/style/heichelos/heichel/index.css should stay as the entry, but import many small modules.

28. geelooy/style/heichelos/heichel/tokens.css
- either keep local tokens or import foundation tokens and define Heichel aliases

29. geelooy/style/heichelos/heichel/shell.css
- shell background, main stage, page padding

30. geelooy/style/heichelos/heichel/topbar.css
- sticky topbar only
- icon buttons only
- safe-area top

31. geelooy/style/heichelos/heichel/drawer.css
- mobile drawer only
- drawer links
- backdrop interaction if needed

32. geelooy/style/heichelos/heichel/hero.css
- Heichel hero background, seal, title, description

33. geelooy/style/heichelos/heichel/hero-stats.css
- stat grid only

34. geelooy/style/heichelos/heichel/kickers.css
- CURRENT HEICHEL / CURRENT SERIES pill labels

35. geelooy/style/heichelos/heichel/series-heading.css
- current series info panel

36. geelooy/style/heichelos/heichel/search.css
- sticky search row and filter chip

37. geelooy/style/heichelos/heichel/tabs.css
- tab gate segmented UI

38. geelooy/style/heichelos/heichel/grid.css
- viewport and dynamic-grid layout only

39. geelooy/style/heichelos/heichel/card.css
- nav-card base

40. geelooy/style/heichelos/heichel/card-media.css
- media thumb and icon

41. geelooy/style/heichelos/heichel/card-menu.css
- card menu trigger and panel

42. geelooy/style/heichelos/heichel/bottom-nav.css
- fixed bottom nav only

43. geelooy/style/heichelos/heichel/bulk-actions.css
- #bulk-actions-bar only

44. geelooy/style/heichelos/heichel/modal/base.css
- modal root, backdrop, chamber

45. geelooy/style/heichelos/heichel/modal/form.css
- modal form, input, select, textarea

46. geelooy/style/heichelos/heichel/modal/actions.css
- cancel/save buttons

47. geelooy/style/heichelos/heichel/modal/index.css
- imports modal modules

48. geelooy/style/heichelos/heichel/responsive.css
- all heichel breakpoints

49. geelooy/style/heichelos/heichel/accessibility.css
- focus, reduced motion, touch target policy

## Template touch
50. geelooy/heichelos/heichel/_awtsmoos.heichel.html
- cache bump index.css only

51. geelooy/heichelos/_awtsmoos.heichel.html
- same for fallback route

---

# Post reader visual modules

## Current entry
geelooy/heichelos/post/styles/main.css should be pure imports.

52. geelooy/heichelos/post/styles/reader-foundation/index.css
- imports tiny reader foundation modules

53. geelooy/heichelos/post/styles/reader-foundation/tokens.css
- reader tokens only

54. geelooy/heichelos/post/styles/reader-foundation/scroll-root.css
- natural document scroll ownership
- replaces current ideal/reborn/scroll-root.css after migration

55. geelooy/heichelos/post/styles/reader-foundation/shell.css
- reader root background and page flow

56. geelooy/heichelos/post/styles/reader-foundation/header.css
- sticky integrated header only

57. geelooy/heichelos/post/styles/reader-content/width.css
- reading width and content padding

58. geelooy/heichelos/post/styles/reader-content/title-crown.css
- post title crown only

59. geelooy/heichelos/post/styles/reader-content/chunk.css
- .scroll-chunk only

60. geelooy/heichelos/post/styles/reader-content/section-card.css
- .section card visual only

61. geelooy/heichelos/post/styles/reader-content/typography.css
- paragraph, Hebrew/English, line height, font scale

62. geelooy/heichelos/post/styles/reader-content/anchors.css
- verse anchor glyphs, copy/share affordance

63. geelooy/heichelos/post/styles/reader-content/focus-halo.css
- current paragraph spotlight future module

64. geelooy/heichelos/post/styles/reader-content/index.css
- imports reader-content modules

65. geelooy/heichelos/post/styles/reader-controls/floating.css
- A/I floating controls only

66. geelooy/heichelos/post/styles/reader-controls/labels.css
- Type / Notes pseudo labels

67. geelooy/heichelos/post/styles/reader-controls/auto-scroll.css
- auto-scroll control visuals

68. geelooy/heichelos/post/styles/reader-controls/index.css
- imports reader controls

69. geelooy/heichelos/post/styles/reader-settings/sheet.css
- typography bottom sheet container only

70. geelooy/heichelos/post/styles/reader-settings/group.css
- settings group card visuals

71. geelooy/heichelos/post/styles/reader-settings/inputs.css
- inputs/selects/ranges/buttons

72. geelooy/heichelos/post/styles/reader-settings/color-grid.css
- color picker layout only

73. geelooy/heichelos/post/styles/reader-settings/index.css
- imports settings modules

74. geelooy/heichelos/post/styles/reader-sidebar/shell.css
- sidebar shell open/closed only

75. geelooy/heichelos/post/styles/reader-sidebar/comments.css
- comment list visuals only

76. geelooy/heichelos/post/styles/reader-sidebar/composer.css
- comment composer only

77. geelooy/heichelos/post/styles/reader-sidebar/resizer.css
- desktop resize grip only

78. geelooy/heichelos/post/styles/reader-sidebar/index.css
- imports sidebar modules

79. geelooy/heichelos/post/styles/reader-overlays/context-menu.css
- context menus only

80. geelooy/heichelos/post/styles/reader-overlays/command-palette.css
- command palette only

81. geelooy/heichelos/post/styles/reader-overlays/verse-menu.css
- verse menu only

82. geelooy/heichelos/post/styles/reader-overlays/index.css
- imports overlay modules

83. geelooy/heichelos/post/styles/reader-responsive/mobile.css
- mobile reader overrides

84. geelooy/heichelos/post/styles/reader-responsive/tablet.css
- tablet reader overrides

85. geelooy/heichelos/post/styles/reader-responsive/desktop.css
- desktop reader overrides

86. geelooy/heichelos/post/styles/reader-responsive/reduced-motion.css
- motion safety

87. geelooy/heichelos/post/styles/reader-responsive/index.css
- imports responsive modules

## Template touch
88. geelooy/heichelos/post/_awtsmoos.post.html
- link /heichelos/post/styles/main.css?v=reader-split-001

---

# JS support modules for visual health

These should be tiny and optional; no visual logic hidden in CSS alone.

89. geelooy/heichelos/post/logic/visual/bootHealth.js
- reports section count, CSS asset presence, scroll root dimensions

90. geelooy/heichelos/post/logic/visual/scrollBlockerDetector.js
- finds visible fixed overlays with pointer-events and huge bounds

91. geelooy/heichelos/post/logic/visual/renderCountVerifier.js
- compares expected sections to rendered .section count

92. geelooy/heichelos/post/logic/visual/controlLabels.js
- optional enhancement for A/I controls if CSS pseudo labels are not enough

93. geelooy/heichelos/post/logic/visual/index.js
- calls tiny visual diagnostics once after post render

94. geelooy/heichelos/post/postLogic.js
- import visual/index.js after boot, ideally one line in a controlled full rewrite

95. geelooy/heichelos/heichel/modules/visual/modalHealth.js
- verifies modal DOM refs once after render

96. geelooy/heichelos/heichel/modules/visual/scrollHealth.js
- reports scrollHeight/clientHeight and top blockers

97. geelooy/heichelos/heichel/modules/visual/index.js
- runs modalHealth and scrollHealth

98. geelooy/heichelos/heichel/app.js
- import visual/index.js after UI render, controlled full rewrite

---

# Test modules

99. geelooy/style/test/cssImportGraph.test.mjs
- confirms no missing @import files

100. geelooy/style/test/cssSmallModuleBudget.test.mjs
- warns if any new CSS module exceeds 120 lines, except entry files

101. geelooy/style/test/noFixedReaderShell.test.mjs
- fails if reader root modules contain position fixed + height 100vh combo

102. geelooy/heichelos/post/logic/visual/test/renderCountVerifier.test.mjs
- unit test for section count mismatch detection

103. geelooy/heichelos/heichel/modules/visual/test/modalHealth.test.mjs
- verifies missing optional modal refs do not crash

104. geelooy/heichelos/heichel/modules/visual/test/scrollHealth.test.mjs
- smoke test for scroll diagnostics

---

# Migration phases

## Phase 1: Create module shells
Create new module folders and entry files without deleting old CSS yet.

## Phase 2: Move current visual-polish into small modules
Break current large visual-polish.css files into the module files above.

## Phase 3: Replace old imports
Make main entry CSS import new modules last, keeping old modules temporarily.

## Phase 4: Delete duplicate legacy visual owners
Remove old reader-canvas, scaffolding, old layout ownership from import graph only after visual parity.

## Phase 5: Add tests
Add import graph, size budget, no-fixed-reader-shell, and visual health tests.

## Phase 6: Runtime diagnostics
Add boot console warnings for scroll blockers and mismatched render counts.

## Phase 7: Final visual consolidation
Every file owns one visual vessel. No mega CSS file remains.

---

# Red lines
- No partial patching.
- No CSS file over 120 lines where avoidable.
- Entry files are imports only.
- Visual modules own one thing.
- Scroll ownership belongs to one module only.
- Modal styling belongs to modal modules only.
- Reader content styling belongs to reader-content modules only.
- Diagnostics must warn, not break production.
