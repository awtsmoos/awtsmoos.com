B'H
# Screenshot Breakage Plan

Fresh screenshots prove the post reader is still visually broken despite static class coverage: the settings panel is visible by default, controls are in normal flow, and actual template classes (`typography-details`, `hidden-details`, `settings-group`, etc.) are not receiving the correct reader UI styling. Static `min-width` coverage was not enough.

Immediate evidence:
- Templates use `typography-details hidden-details`, not `awtsmoos-reader-settings`.
- Reader control CSS styles `.awtsmoos-floating-controls` but does not position it fixed.
- `hidden-details` is not hidden by current active CSS.
- Settings classes are actual legacy template names, so they need real styling.

Fix plan:
1. Add a targeted live-template CSS shard for actual post reader template classes.
2. Import it from active `post/styles/main.css`.
3. Replace the Heichel notification anchor with an inline details menu offering an online panel and a new-tab link, so tapping it does not immediately reload away.
4. Tighten mobile topbar/hamburger/notification styles.
5. Verify with tests and served CSS tokens.
