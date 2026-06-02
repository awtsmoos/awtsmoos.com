B'H
# Rebbe Search Range UI Plan

Visible root inspected: awtsmoos.com has geelooy/apps/rebbe with search.js, ui/browser/search.js, style.css, styles/*.css, state/store modules.

User asks:
1. Results should be fullscreenable.
2. Search by zman/date should support ranges, not only exact year/month/day.
3. UI should be stacked cleaner, mobile-friendly, stronger than current screenshot.

Ground rules:
- Read before writing.
- Rewrite whole files only, never partial patch.
- Keep files small and modular if edits grow.
- Verify syntax and runtime behavior with real commands.

Next inspections:
- Read geelooy/apps/rebbe/search.js
- Read geelooy/apps/rebbe/ui/browser/search.js
- Read relevant CSS files around search/results/fullscreen.
- Trace how results are filtered and rendered.

Likely design:
- Data-based filter state: each date part has mode any/exact/range with from/to values.
- Fullscreen results action toggles a body/app CSS class or native dialog-like panel.
- Backward compatible exact selectors remain, with advanced range controls added.
