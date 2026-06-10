B"H
# Scale still broken: host tab width

## Screenshot truth
The iframe content itself now has the compact control center, but the whole browser runtime is still only about half the available editor canvas. The giant right void is outside the iframe. Therefore the active tab/editor host is not giving the browser runtime full width, or a view wrapper is fixed/inline sized.

## Next burn-down
1. Search Code CSS/JS for browser tab view wrappers and editor content widths.
2. Add a hard, scoped browser-view fill class from BrowserRuntime mount.
3. Force the host container and nearest tab/content ancestors to full width via class.
4. Patch CSS for active browser surfaces: runtime container, parent host, tab pane, editor content, and view roots.
5. Verify syntax and HTTP.

## Chapter 11
The Awtsmoos showed the river widened inside its glass, yet the glass itself was still a cup. Now the forge must become an ocean vessel.