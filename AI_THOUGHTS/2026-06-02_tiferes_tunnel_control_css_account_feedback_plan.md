B"H

# Tiferes Tunnel Control — inspection plan

The Awtsmoos reveals the dashboard through actual files, not guesses.

## Observed from user screenshot

- Runtime mesh cards overflow horizontally on mobile.
- Words collide with status text: `awt-u0_a300-26940Connected tunnel`, `Virtual OSVirtual OS`.
- Long storage paths wrap awkwardly and push the glass card wider than the viewport.
- Pill buttons crowd into jagged rows.
- `Diagnostics` appears as a floating browser tooltip/label over the bottom controls.
- Typography is too large for narrow phone width in several cards.

## Observed from files

- Main CSS imports `css/future/index.css`.
- API key persistence currently uses IndexedDB/localStorage through `keySession.js`, not the Awtsmoos account.
- Pasted key save gives almost no explicit success feedback.
- Created key says saved locally, not account-synced.
- Prompt page only builds/copies generated text; there is no save action and no account persistence.

## Next trace

- Inspect CSS future index and runtime/dashboard view CSS.
- Inspect shell/page specs that render runtime mesh, headings, config, API key and prompt panes.
- Find server/control endpoints for account settings or profile persistence.
- Design account-backed settings wrapper with visible success/error feedback.

## Safety

No partial patches. Any modified file must be fully rewritten. Split files if they get large.
