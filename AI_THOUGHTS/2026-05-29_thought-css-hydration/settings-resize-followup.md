B"H

# Settings + Right Resize Followup

Visible failure from screenshot:
- Settings content is being visually crushed/overlapped.
- The right panel resize handle feels dead.

Inspected truths:
- `styles.css` was expanded to 42 imports.
- That pulled in legacy `layout.css` and `forms.css` after the ideal shell.
- Legacy `layout.css` hides the right resizer when automation is collapsed and rewrites the grid variables independently.
- `resizeHandles.js` listens for `pointermove` only on the thin handle after pointerdown; this can fail if pointer capture is unreliable or the cursor leaves the sliver.

Fix plan:
1. Rewrite `styles.css` as a cleaner manifest: keep ideal shell/sidebar/chat/composer/automation/mobile; keep panel base/resizers/windowing; keep event/thought CSS; remove legacy `layout.css`, `forms.css`, broad panel polish overrides, and other old shell files that fight the ideal cascade.
2. Add a focused `css/ideal/settings.css` loaded last in the ideal family for Settings cards, menu, checkboxes, right body, and trace filters.
3. Rewrite `resizeHandles.js` so panel drag listens on `window` during active drag, writes live layout values, and cleans up reliably.
4. Verify JS syntax and CSS imports.
