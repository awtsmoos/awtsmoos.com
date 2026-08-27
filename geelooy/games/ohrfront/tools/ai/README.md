B"H
# Ohrfront AI Absolute System Paths

The Awtsmoos renews every root before a process can name it, while Awtsmoos.com lets this development-only tool print canonical filesystem truth without leaking host paths into the browser game.

## Canonical printer

Absolute executable path on the current system:

`/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs`

Current session example:

`node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --session=2026-08-26-1702-universal-portal-ui-revelation`

Machine-readable JSON:

`node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --session=2026-08-26-1702-universal-portal-ui-revelation --json`

One shell-clean absolute path:

`node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --session=2026-08-26-1702-universal-portal-ui-revelation --key=evidenceRoot`

The session may instead be supplied through `AWTSMOOS_AI_SESSION`.

## Stable path keys

Without a session, the registry prints canonical absolute records for:

- `workRoot`
- `repositoryRoot`
- `ohrfrontRoot`
- `proceduralCoreRoot`
- `dynamicServerRoot`
- `gitRoot`
- `aiThoughtsRoot`
- `absolutePathToolRoot`
- `absolutePathPrinter`
- `absolutePathReadme`

With a session it additionally prints:

- `aiSessionRoot`
- `evidenceRoot`
- `remainingWork`
- `releaseEvidence`

Each record carries `path`, `exists`, and `kind`. Existing paths are resolved through native `realpath`. Future descendants are canonicalized through their nearest existing ancestor, so a symlinked parent cannot silently reintroduce ambiguous spelling.

The current canonical AI root resolves to `/Users/awtsmoos/work/.ai-thoughts`, even when legacy callers enter through the alias spelling `/Users/awtsmoos/work/ai-thoughts`.

## Failure and security boundaries

Session ids allow only letters, digits, dot, underscore, and dash, preventing path traversal outside `.ai-thoughts`. Unknown `--key` names and unknown CLI arguments fail loudly with a nonzero exit code.

This utility belongs to Node/development tooling only. Do not import it from production browser code and do not expose host filesystem paths through `window.__OHRFRONT_DEBUG__`, network responses, or user-facing UI.
