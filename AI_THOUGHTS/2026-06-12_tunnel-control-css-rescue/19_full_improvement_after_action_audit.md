B"H

# Full Improvement After Action Audit

User asked for a broad improvement/coding pass. I kept it grounded in actual failing/risky code instead of cosmetic guessing.

Audits run:

1. JS syntax audit
   - First 40 JS files: passed.
   - Second 40 JS files: passed.
   - Remaining 44 JS files: passed.

2. CSS structural audit
   - 22 CSS files scanned for brace balance.
   - No brace mismatches.

3. Full JS import resolver
   - 262 relative imports scanned after rewrites.
   - Missing imports: none.

4. DOM safety scans
   - Found concrete raw-HTML risks in API keys, status summary, path breadcrumbs, and control panel toolbar.
   - Rewrote the affected complete files.

Files changed in this full improvement pass:

1. `geelooy/apps/tunnel-control/js/features/apiKeys.js`
   - Replaced saved-key `innerHTML` with generated DOM nodes.
   - Bound buttons directly instead of querying them after markup injection.
   - Guarded optional status surfaces.
   - Preserved key creation, paste, save, activate, clear, feedback behavior.

2. `geelooy/apps/tunnel-control/js/features/status.js`
   - Replaced identity/device summary `innerHTML` with safe DOM cards.
   - User IDs, tunnel names, roots, versions now render as text nodes.
   - Preserved pills, mini labels, live config loading, tunnel discovery, debug JSON.

3. `geelooy/apps/tunnel-control/js/features/pathCrumbs.js`
   - Removed broken `safeHtml()` where `<` and `>` were not actually escaped.
   - Replaced breadcrumb `innerHTML` with real button/span nodes.
   - Dataset paths are assigned by property, not interpolated into HTML.

4. `geelooy/apps/tunnel-control/js/ui/controlPanels.js`
   - Replaced toolbar title `innerHTML` with real text spans.
   - Replaced fragile dynamic `[data-pane="..."]` selector with real element lookup.
   - Preserved wrapping, collapse memory, focus, floating map, keyboard shortcuts.

Previous CSS improvements still included in working tree:

- `css/future/views/dashboard.css`
- `css/future/core/responsive.css`
- `css/future/views/shell.css`

Final verification after rewrites:

- Changed JS syntax sweep: passed.
- DOM raw HTML scan for changed files: clean.
- Full import resolver: passed, 262 relative imports, zero missing.
- Git diff stat: 6 files changed, 535 insertions, 224 deletions.

Remaining honest limitations:

- Chrome is disabled on the active tunnel, so no live browser screenshot could be captured here.
- A few raw HTML usages remain elsewhere (`boot/init.js`, `ui/dom.js`, `ui/finalLayout.js`, `ui/sections.js`, `features/config.js`), but I did not rewrite them because the scan output did not prove they were dangerous in this pass. They can be inspected one by one in a later focused pass.
