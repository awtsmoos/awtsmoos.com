B"H
Boruch Hashem
Blessed be He

# Current Status / Session Pickup Checklist

Last handbook write observed canonical `main` at `b63562832`, `main...origin/main [ahead 39, behind 5]`. This is only a snapshot: re-check before acting.

## Before doing any work
- [ ] `git fetch origin main`.
- [ ] Inspect canonical status, HEAD, origin/main, recent log/reflog, worktrees, and stashes.
- [ ] Inspect the relevant isolated lane before creating another implementation.
- [ ] Search for concurrent edits to the exact files you plan to touch.
- [ ] Read the relevant domain plan in this folder.
- [ ] Create/choose a narrow owned lane if canonical is dirty in overlapping paths.

## Known locally implemented / partially implemented work to preserve
- [ ] Tree lane: stratified/permuted attachments, interpolated positions, foliage twigs, twig-budget fallback, pipe-model conservation, radius-scaled bark UVs, rounded foliage normals, same-skeleton LOD, billboard overrides, renderer-neutral wind work, EZ-Tree parity tests/work, and new reproductive primitive work. Re-run tests before trusting newest changes.
- [ ] Weather lane: renderer-neutral weather state, spatial fronts, presets, realtime-observation assimilation contract, surface memory, hazards, coupling, vertical profile, terrain coupling, cloud layers, lightning/thunder, forecasting. Re-run all weather tests before merging.
- [ ] World-selector lane: audit completed; existing selector has `simple-meadow` and `local-reference-village`; boot path traced. Feature-manifest rewrite still needs implementation/testing.
- [ ] Transparent botany: recovered/generated alpha tree foliage exists locally; publication/live verification still needs finishing.
- [ ] Semantic texture catalog: local material catalog and semantic classification were expanded; production catalog publication may still lag local state and must be re-verified.
## Highest-priority execution order
1. [ ] Make official world profiles truthful: Blank Meadow, Living Village, Great Valley. Do not expose fake City until it has its own authority.
2. [ ] Finish tree lane tests, strict EZ-Tree superset proof, species materials, no-THREE extraction, and foliage publication.
3. [ ] Finish weather lane tests and connect weather into hydrology, materials, vegetation, audio, NPC behavior, persistence, and MitzvahWorld rendering.
4. [ ] Reconcile terrain/hydrology/architecture/NPC work already active on canonical instead of replacing it.
5. [ ] Build the Creator/API discovery layer so capabilities are easy to find and use.
6. [ ] Build deterministic persistence, world switching cleanup, cancellation, worker scheduling, and resource-budget authorities.
7. [ ] Complete UX/art/audio/accessibility passes against the reference-image quality target.
8. [ ] Execute release, load, outage, soak, scale, canary, rollback, and live-verification gates.

## Never overclaim
Use three distinct statuses in reports:
- `LOCAL`: implemented/tested only on a worktree or machine.
- `MAIN`: reconciled, committed, and present on canonical main/origin.
- `LIVE`: deployed and independently verified from production URLs/runtime.

## Immediate verification commands
```sh
cd /Users/awtsmoos/work/awtsmoos.com
git fetch origin main
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git log -12 --oneline --decorate
git worktree list
git stash list
```

If any exact path is concurrently dirty, do not overwrite it. Rebase/merge only after understanding ownership and tests.