B"H

# Second Pass Specific Plan

The audit found another real risk: `css/future/core/responsive.css` has global emergency wrapping rules:

- `.panel`, `.notice`, cards, rows, chips: `overflow-wrap:anywhere; word-break: break-word;`
- inputs, buttons, sections: `overflow-wrap:anywhere`
- output/code blocks: `word-break: break-word`

This was probably intended to prevent horizontal overflow, but it is too broad for normal prose. It can amplify narrow-grid bugs by allowing words to fragment too aggressively. The dashboard module now overrides the home intro paragraph, but other panels can still look broken if a parent gets narrow.

Actual additional file to rewrite completely:

- `geelooy/apps/tunnel-control/css/future/core/responsive.css`

Repair strategy:

1. Keep min-width/max-width safety on flexible UI containers.
2. Use normal wrapping for ordinary prose and cards.
3. Restrict `overflow-wrap:anywhere` / `word-break:break-word` to dangerous content only: pre, code, kbd, outputs, logs, terminal text, raw JSON, long paths, runtime captions, workspace titles, brand block technical strings.
4. Keep all existing responsive breakpoints.
5. Add explicit dashboard header mobile grid-area repetition to preserve the first repair under later cascade.
6. Preserve table overflow protection.
7. Verify with grep and brace checks.
