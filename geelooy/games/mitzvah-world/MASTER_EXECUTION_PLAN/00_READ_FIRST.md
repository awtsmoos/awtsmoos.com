B"H
Boruch Hashem
Blessed be He

# MitzvahWorld Master Execution Handbook

This folder is the persistent handoff for future sessions. Read this file first, then `STATUS_CHECKLIST.md`, then the domain file for the task you are taking.

## Mission
Build MitzvahWorld into a renderer-independent, deterministic, persistent living-world platform whose terrain, weather, water, vegetation, wildlife, civilization, Creator, quests, audio, UI, and persistence share one coherent world truth.

## Non-negotiable boot law
1. First frame.
2. Visible local world.
3. Player movement/control.
4. Playable state published.
5. Optional enrichment only afterward.
6. No remote API, AI, multiplayer, weather provider, texture catalog, or heavy simulation may block first control.

## Source law for every touched authored source file
- Start with exactly `//B"H`, `//Boruch Hashem`, `//Blessed be He` when the language supports comments.
- JavaScript authored files must remain strictly under 120 lines.
- Use tabs for indentation.
- Use extensive, real JSDoc and descriptive names.
- Never minify, compress, or squeeze logic to satisfy line limits; split modules instead.
- Prefer whole-file rewrites after reading the file; do not blindly patch concurrent work.
## Concurrency / Git law
- Canonical repo: `/Users/awtsmoos/work/awtsmoos.com` on `main`.
- Re-check `git fetch origin main`, status, HEAD, origin/main, worktrees, reflog, and stashes before any reconciliation.
- Canonical is highly concurrent. Never use `git reset --hard`, `git clean -fd`, `git add .`, force-push, or blind stashes.
- Stage only owned paths. Preserve unrelated changes.
- Temporary worktrees are implementation lanes only; final useful work must return to canonical `main` and be pushed so `HEAD == origin/main`.

## Existing isolated lanes to inspect before duplicating work
- Tree/vegetation: `/Users/awtsmoos/.awtsmoos-tree-vegetation-20260909`, branch `ai/tree-vegetation-superset-20260909`.
- Weather: `/Users/awtsmoos/.awtsmoos-weather-core-20260909`, branch `ai/weather-core-20260909`.
- World selector: `/Users/awtsmoos/.awtsmoos-world-selector-20260909`, branch `ai/world-selector-20260909`.
- Do not assume lane state is current; inspect before editing or removing.

## Definition of done
A task is not done because code exists. It is done only when authored-source rules pass, tests pass, runtime/browser behavior is verified where relevant, persistence/reload is proven where relevant, canonical `main` contains the work, origin is synchronized, and production/live verification is complete when deployment is in scope.

## North-star quality
The reference artwork shows the target mood: cinematic valleys, rivers, waterfalls, real settlements, forests, mountains, study halls, Creator building, traversal challenges, coast, desert, night sky, community, and restrained contextual UI. The goal is better: every beautiful scene must be systemic, explorable, persistent, performant, and causally connected rather than a static backdrop.