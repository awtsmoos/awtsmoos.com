B"H

# Conflict burn-down plan

The current audit found real competing style sources still imported before the ideal owner layer:

- `layout/sidebar.css` still defines `.sidebar`, `.sidebar.hidden-comments`, desktop/mobile motion.
- `reader-runtime-polish.css` still defines `.sidebar`, `.awtsmoos-view-header`, `.awtsmoos-view-content`, and mobile drawer rules.
- `comments/inline-intense.css` imports the old elite inline cascade.
- `comments/sidebar-intense.css` and `comments/sidebar-premium.css` define sidebar/comment panel visuals.

## Safe fix
Do not delete files blindly. Rewrite conflicting imported files as compatibility/legacy notes with no active conflicting selectors, then move needed visuals into the `ideal/*` modules.

## Files to rewrite whole
1. `layout/sidebar.css` -> empty legacy shim.
2. `layout/resizer.css`, `layout/polished-resizer.css`, `layout/polished-mobile-drawer.css` -> empty legacy shims if they target resizer/sidebar.
3. `comments/inline-intense.css` -> empty legacy shim because ideal inline now owns inline cards.
4. `comments/sidebar-intense.css`, `comments/sidebar-premium.css` -> empty legacy shims because ideal sidebar now owns sidebar panels/comment visuals.
5. `reader-runtime-polish.css` -> keep only non-sidebar/non-inline/non-panel global polish.
6. Add any missing comment card styling to `ideal/sidebar-comments.css`, imported by `forever-ui-fixes.css`.

Then verify:
- syntax checks
- all existing tests
- grep for active competing selectors in those legacy files
- CSS duplicate selector check in ideal modules
