B"H

# Third Pass Brainstorm: Finish the Next Step Entirely

The next useful step is not more summary. It is to finish the remaining layout audit and remove the last prose-shattering CSS risk if it is real.

Observed remaining concern:

- `css/future/views/shell.css` still has `.awt-runtime-card-top strong, .awt-runtime-card-top span, .awt-runtime-card p { overflow-wrap:anywhere; word-break:break-word; }`
- This applies to runtime-card paragraph prose, not only path/id text. It can cause the same ugly broken wrapping inside runtime cards.
- `shell.css` also uses auto columns in safe places (`logo + copy`, `avatar + copy`), but the runtime card text-break rule is a real broad risk.

Potential fixes:

1. Rewrite `shell.css` completely and narrow text breaking there too.
2. Keep technical strings breaking in captions, brand path text, runtime card top id/name spans if needed.
3. Keep normal runtime paragraph text readable.
4. Add `overflow-wrap:anywhere` only to small technical spans and captions.
5. Preserve every layout structure from shell.css.
6. Verify no broad `word-break:break-word` remains outside technical selectors.
7. Run a no-write node audit that scans CSS files for suspicious broad selectors.
8. If live preview is unavailable because Chrome disabled, use static CSS audit and line-by-line readback.

Files planned for possible rewrite:

- `geelooy/apps/tunnel-control/css/future/views/shell.css`

No other code should change unless audit reveals a direct issue.
