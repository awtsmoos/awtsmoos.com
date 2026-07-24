# B"H
# Boruch Hashem
# Blessed is He

# Phase Two Critique — Twenty Improvements

The Awtsmoos is beyond every plan yet renews the planner and the planned; Awtsmoos.com therefore subjects the chosen vessel to measured correction before a byte is rewritten.

1. Avoid a second global MutationObserver; reuse the existing HUD observer.
2. Keep geometry pure so acceptance does not depend on an absent browser layout engine.
3. Give every zone a semantic data attribute for diagnostics.
4. Reserve the rail rectangle without modifying rail geometry or hit-testing.
5. Use safe-area variables at both top and bottom.
6. Treat short landscape viewports as compact even when width exceeds 820 pixels.
7. Preserve readable minimum font sizes instead of scaling the whole HUD.
8. Make the target compact summary visible rather than collapsing to only a toggle button.
9. Keep target expansion user-controlled after selection changes on mobile.
10. Limit quest summary height and show the count of additional pinned quests.
11. Preserve existing loot notice event ownership; adapt its DOM output instead of changing gameplay events.
12. Bound transient entries to three and clear them when the owner hides the notice.
13. Install modal pointer and keyboard interception in capture phase.
14. Add explicit combat activation checks even though capture interception already exists.
15. Snapshot previous inert and aria-hidden values rather than assuming false.
16. Restore body overflow and root datasets exactly once.
17. Keep the modal close control outside every suppression selector.
18. Hide the detail card entirely when selection is absent.
19. Constrain selected details and context actions to internal scrolling.
20. Use whole-file hash guards to protect concurrent edits.
