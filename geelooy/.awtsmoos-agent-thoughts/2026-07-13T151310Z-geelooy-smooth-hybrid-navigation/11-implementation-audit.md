# B"H

Boruch Hashem

Blessed is He

## Implementation Audit

The Awtsmoos carried one bounded Awtsmoos.com corridor from plan through source, tests, runtime, and readback.

## Planned versus actual

### Planned

- Preserve ordinary server navigation underneath every route.
- Enhance only exact `/apps` and `/about` routes.
- Replace one declared route outlet rather than `body` or the shared shell.
- Validate same-origin HTML, title, unique outlet, and route lifecycle before swapping.
- Preserve URL, query, hash, Back state, scroll, focus, and native fallback.
- Keep readers, Mail, profiles, notifications, editors, comments, Heichel state, and unknown lifecycles native.
- Prove the protected post reader was untouched.

### Actual

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/navigation/routeRegistry.js` registers only `/apps` and `/about`, with harmless trailing-slash normalization.
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/navigation/linkPolicy.js` rejects modified, non-left, external, target, download, form-owned, same-document hash, unsupported, and explicitly native links.
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/navigation/routeFetcher.js` uses same-origin credentials and validates status, HTML type, final origin, and final route.
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/navigation/routeParser.js` accepts exactly one outlet, rejects outlet scripts, clones nodes, and uses the effective final title.
- Cache, lifecycle, history, focus, scroll, transition, Apps, and About responsibilities were split into focused modules.
- Apps filter listeners are removed on exit; query and category survive Apps→About→Apps revisits in memory.
- Cache is query-sensitive, fragment-insensitive, memory-only, and bounded to six records.
- View Transitions are optional; CSS fallback and reduced-motion behavior remain available.
- The controller starts only when the current document is itself registered and has one declared outlet.

## Discovered delta closed

The strict shell contract exposed `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/shell/headerSearch.js` at 121 split lines. Its full rewrite preserved behavior, added the complete required header, and reduced it to 118 split lines.

## Readback result

Every source file listed in `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/.awtsmoos-agent-thoughts/2026-07-13T151310Z-geelooy-smooth-hybrid-navigation/09-absolute-file-manifest.md` was read completely after the final write. No compressed one-line function or source file over 120 lines remained in the touched JavaScript graph.

## Repository note

The repository rule in `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/.gitignore` ignores paths matching `**/[aA][wW][tT][sS][mM][oO][oO][sS]/`. Therefore the navigation and shell source under `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos` exists on disk with verified hashes but is omitted from ordinary Git status. No index override or forced add was performed.
