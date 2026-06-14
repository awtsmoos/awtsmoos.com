B'H
# Evidence Before Write

Observed breakage from files and history:

1. `geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js` creates classes such as `geelooy-heichel-hero`, `hero-stats`, `series-search-row`, `tab-gates`, `dynamic-grid`, `nav-card`, `nav-card-media`, and `nav-card-body`.
2. The current canonical stylesheet `geelooy/style/heichelos/heichel/*.css` mostly styles newer names such as `heichel-hero`, `heichel-hero-stats`, `heichel-search`, `heichel-tabs`, `heichel-grid`, `heichel-card`, and `heichel-card-media`.
3. Commit `340a20356` shows a mass rewrite changing older `nav-card` selectors into mismatched `heichel-card` selectors while the renderer still emits `nav-card`. This explains the screenshot's raw/default browser styling.
4. The drawer stylesheet only sets a border and min-height. It does not make the drawer a hidden overlay or style its anchors, matching the raw underlined `HomeHeichelosSeriesMessagesProfile` seen in the screenshot.
5. The bottom nav is fixed and styled, but the shell needs enough bottom padding to prevent overlap on mobile.
6. Post view has two templates. The active compact template `geelooy/heichelos/post/_awtsmoos.post.html` loads `/heichelos/post/styles/main.css`. Current `main.css` imports only a small new chain, while `aab751f77^` had the reborn shell/reader/settings/sidebar/action chain. The post screenshot looks like styles were deleted; restoring the old base imports before the newer split imports should restore coverage without removing the newer modules.
7. The separate `geelooy/heichelos/heichelos/post/styles/main.css` has missing imports, but it is not referenced by active templates found so far; do not touch it until runtime proves it is active.

Actual touch plan:
- Rewrite `geelooy/style/heichelos/heichel/shell.css` to scope and stabilize the app shell.
- Rewrite `topbar.css`, `drawer.css`, `hero.css`, `hero-stats.css`, `search.css`, `tabs.css`, `grid.css`, `card.css`, `card-media.css`, `card-menu.css`, `responsive.css` so they style the actual emitted classes while preserving newer aliases.
- Rewrite `geelooy/heichelos/post/styles/main.css` as an import ledger: older coverage first, newer split modules after, final scroll-root last.
- Add a focused CSS contract test under `geelooy/heichelos/heichel/modules/test/mobileStyleContract.test.mjs` to prevent class mismatch regression.

No JavaScript rewrite yet. The "buttons don't work" suspicion needs behavior tests after styles, because some buttons may have hidden event issues, but raw screenshots first prove the stylesheet class mismatch.
