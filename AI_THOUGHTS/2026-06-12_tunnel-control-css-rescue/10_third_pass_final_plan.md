B"H

# Third Pass Final Plan

After reading `shell.css`, the remaining issue is confirmed:

- Runtime card paragraphs are currently forced through `overflow-wrap:anywhere` and `word-break:break-word`.
- That is too broad for readable prose.
- It belongs only on technical runtime identifiers and captions.

Rewrite target:

- `geelooy/apps/tunnel-control/css/future/views/shell.css`

Exact changes:

1. Rewrite the whole file.
2. Preserve shell layout: two-column desktop, sticky sidebar, control main grid, brand row, nav buttons, runtime cards, user chip.
3. Keep `.awt-brand-block p` and `.awt-runtime-caption` capable of breaking long paths.
4. Keep `.awt-runtime-card-top strong/span` capable of breaking long runtime IDs.
5. Change `.awt-runtime-card p` to normal wrapping.
6. Leave nav text ellipsis rules intact.
7. Verify braces.
8. Re-run grep for broad break rules.
9. Write final audit.
