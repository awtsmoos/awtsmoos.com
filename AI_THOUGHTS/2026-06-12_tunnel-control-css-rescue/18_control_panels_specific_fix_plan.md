B"H

# Specific Fix Plan: Control Panel Toolbar DOM Safety

Audit finding:

`js/ui/controlPanels.js` uses `left.innerHTML` with a derived title, and it builds a selector string from `tab.dataset.tab`. Even though title usually comes from DOM text, this can break if title contains markup-like characters, and the selector can break on unusual pane ids.

Target file:

- `geelooy/apps/tunnel-control/js/ui/controlPanels.js`

Exact rewrite goals:

1. Replace toolbar title `innerHTML` with real `span` elements.
2. Replace dynamic `[data-pane="..."]` selector with an array search over elements.
3. Preserve panel wrapping, collapse memory, focus button, floating map, keyboard shortcuts.
4. Re-run syntax and DOM safety scan.
