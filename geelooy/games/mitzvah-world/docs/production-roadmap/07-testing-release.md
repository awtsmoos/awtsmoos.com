B"H

# Testing, Acceptance, and Release

## Every integration wave

- Refresh Git status/log/reflog/worktrees/stashes and preserve concurrent dirt.
- Run syntax checks, line-count enforcement, header/style rules, tabs, `git diff --check`, focused unit tests, architecture tests, and official compact-runtime build.
- Never hand-edit compact bundles; verify build outputs were generated from authored sources.
- Keep generated diagnostics out of Git.

## Domain tests

- Full-catalog semantic regressions and PBR-channel safety.
- Import dedupe, filename collision, idempotency, archive safety, and provenance.
- Quest exact-once rewards, prerequisites, abandonment, restore, and event ordering.
- Bridge gap, road grade, Creator transaction rollback, duplicate-click races, persistence, collision restore, and navigation.
- Terrain/hydrology invariants, streaming duplicate prevention, memory leaks, repeated region transitions, and long-session soak.
- Mobile multi-touch, pointer cancel, orientation, browser lifecycle, context loss, offline/online, and save/reload loops.

## Visual acceptance

- Maintain stable reference cameras for opening vista, dense village/market, river/waterfall, forest, alpine, night, Beis Midrash, farbrengen, Bridge Trial, Creator, and mobile HUD.
- Compare automated screenshots for regressions and manually review realism, density, composition, lighting, material scale, religious details, and UI readability.
- Review Jewish architecture, Hebrew, sacred objects, clothing, menorah form, and accidental cross-like forms explicitly.

## Release candidate

- Freeze an exact RC build long enough to test it completely.
- Verify deployed commit equals intended `origin/main`.
- Verify public asset catalog generation equals intended release.
- Hard reload and cached reload; fresh guest and returning save; mobile and desktop.
- Require no uncaught errors, unhandled rejections, unexpected 404/CORS failures, stale CDN mix, invisible collision, negative inventory, duplicate rewards, impossible quests, or unbounded memory growth.
- Run the complete Bridge Trial -> stone reward -> Build -> reload proof as a cross-system acceptance path.
- Fix all P0/P1 issues, rebuild the RC, and rerun affected acceptance gates.
- Roll out gradually and watch real metrics before expanding traffic.
