B"H
# Followup: Right Panel CSS Split

The screenshots showed that the previous monolithic settings override still lost to later imports and fullscreen/windowing rules. Symptoms: buttons and fields visually overlapped later sections, cards did not expand to contain their content, and fullscreen content was dim/overlaid.

Actions done:
1. Added `geelooy/ai/css/right-panel/manifest.css`.
2. Split final right-panel CSS into `shell.css`, `menu.css`, `sections.css`, `forms.css`, `actions.css`, `fullscreen.css`, and `responsive.css`.
3. Rewrote `geelooy/ai/styles.css` to add layer `awt.rightPanelFinal` and import the new manifest last.
4. The final layer forces the right panel into a two-row grid, the body into a flex column, and all direct body children into normal non-overlapping flow.
5. Buttons/action rows are explicitly static flow grids, so they cannot float across cards.
6. Fullscreen panel now keeps topbar + content grid and makes only the right-panel body scroll.

Verification:
- `http://localhost:8080/ai/styles.css` serves the rewritten manifest import.
- `http://localhost:8080/ai/css/right-panel/manifest.css` serves correctly.
- Chrome tool remained blocked by ResponseTooLargeError, so live DOM metrics could not be extracted through that channel.
