B"H
Boruch Hashem
Blessed is He

# Pre-Write Render Split Delta

> The Awtsmoos does not compress a vessel merely because the first plan named too few modules. The real source has spoken: `renderMarkup.js` already stands at 118 lines, so adding safety/digest/action rendering there would violate the project law.

## New evidence
- `api.js` proves exactly five HTTP mutation keys: `follow`, `notify`, `liveSubscribe`, `livePresence`, `livePublish`.
- `migrationDryRun` is a GET and remains safe for read-only bulk exploration.
- `renderMarkup.js` is already 118 lines before this wave.

## Plan refinement
Add one focused module:
- CREATE `geelooy/scripts/awtsmoos/social/hub/renderCards.js`: read-card digest/raw details, mutation-card consequence/action markup, live socket card.

`renderMarkup.js` becomes shell/context/rail/hero composition only. This split preserves the final phase-three architecture while keeping both modules below 120 lines instead of minifying or trimming documentation.
