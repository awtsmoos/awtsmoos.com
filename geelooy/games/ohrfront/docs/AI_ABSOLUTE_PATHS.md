B"H
Boruch Hashem
Blessed is He

# AI Absolute System Paths

The Awtsmoos renews every finite location while remaining beyond place itself; Awtsmoos.com lets local agents speak filesystem truth precisely without confusing a private machine path with a public URL.

## Purpose

Ohrfront AI, release, evidence, and handoff tooling must report canonical **absolute local system paths**. Relative paths are useful inside imports, but they are insufficient as handoff evidence because their meaning changes with the caller's current working directory.

This subsystem is intentionally Node-only. Browser gameplay, public telemetry, deployed HTML, and public APIs must never expose host filesystem paths.

## Canonical printer

Executable:

`/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/scripts/ai/MalchusPrintAbsolutePaths.mjs`

Human report:

`node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/scripts/ai/MalchusPrintAbsolutePaths.mjs`

Machine-readable JSON:

`node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/scripts/ai/MalchusPrintAbsolutePaths.mjs --json`

Current mission plus existence verification:

`node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/scripts/ai/MalchusPrintAbsolutePaths.mjs --check --mission 2026-08-26-1702-universal-portal-ui-revelation`

One named root:

`node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/scripts/ai/MalchusPrintAbsolutePaths.mjs --name game`

## Registered roots

- `repository` — repository root.
- `work` — local workspace containing repository and AI-thoughts state.
- `game` — Ohrfront game root.
- `source` — browser/game source tree.
- `styles` — localized Ohrfront styles.
- `tests` — Ohrfront test universe.
- `docs` — Ohrfront documentation.
- `scripts` — local tooling.
- `aiTools` — Node-only AI path tooling.
- `proceduralCore` — shared Awtsmoos procedural core.
- `dynamicServer` — Awtsmoos dynamic server.
- `aiThoughts` — canonical physical AI-thoughts root.

The source does **not** hardcode `/Users/awtsmoos`. These paths are derived from `import.meta.url` and project topology. The command examples above intentionally show this machine's current resolved paths for direct human/agent use.

## Current physical mission paths

Mission root:

`/Users/awtsmoos/work/.ai-thoughts/2026-08-26-1702-universal-portal-ui-revelation`

Evidence root:

`/Users/awtsmoos/work/.ai-thoughts/2026-08-26-1702-universal-portal-ui-revelation/evidence`

Remaining-work ledger:

`/Users/awtsmoos/work/.ai-thoughts/2026-08-26-1702-universal-portal-ui-revelation/REMAINING_WORK.md`

## Safety and correctness laws

1. Resolve topology from module location, never mutable `process.cwd()`.
2. Unknown root names throw instead of guessing.
3. Descendant resolution rejects traversal outside the selected root.
4. Mission names are explicit single safe directory names.
5. Human output prints absolute local paths plus existence truth.
6. JSON output is plain immutable evidence suitable for agents and automation.
7. Existing symlinks may expose a separate `physicalPath` when it differs from the declared absolute path.
8. Local filesystem paths and public URLs are separate concepts and must never share a field merely because both are strings.
9. Host paths stay in local AI/release/handoff tooling; they do not enter browser bundles.

## Handoff rule

When an AI agent names a local file that another agent is expected to inspect, run, verify, or continue from, prefer the canonical absolute path in the handoff/evidence record. When writing browser source or portable imports, continue using normal relative/module paths. Precision belongs at the tooling boundary, not as leaked machine identity inside the shipped game.
