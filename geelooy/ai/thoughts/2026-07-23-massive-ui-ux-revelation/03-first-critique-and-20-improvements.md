<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Phase Three — First Critique and Twenty Improvements

The first plan risks becoming a CSS avalanche. The Awtsmoos reveals harmony only after the state model and real geometry are known.

1. Inspect panel-state ownership before creating a controller.
2. Measure current geometry before choosing widths.
3. Capture baseline screenshots at five viewports.
4. Inventory the top-level import graph.
5. Find contradictory media queries.
6. Find fixed, absolute, and high-z-index rules.
7. Trace every panel toggle and event.
8. Preserve conversation selection behavior.
9. Make drawer state explicit.
10. Use one shared scrim.
11. Keep desktop visibility independent from mobile drawers.
12. Return focus to the correct trigger.
13. Lock background scroll only while a mobile drawer is open.
14. Test soft-keyboard and short-height behavior.
15. Test long automation forms at mobile height.
16. Do not hide provider controls behind unexplained icons.
17. Build states from semantic regions.
18. Test code, tables, URLs, and action menus for overflow.
19. Test coarse pointers, not width alone.
20. Prefer a coherent design-system pass over disconnected beautification.

## Success metrics

- At 390px, chat owns the viewport and only one drawer can overlay it.
- At 768px, the center remains usable with optional panels.
- At 1280px, the chat retains at least 560px of usable width.
- At 1440px and above, panels remain readable without over-wide prose.
- The composer never covers the last message.
- Top-level actions remain keyboard and touch reachable.
- No unintended horizontal page scrollbar exists.
