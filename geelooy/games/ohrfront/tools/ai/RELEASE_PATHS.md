B"H

# Ohrfront Absolute Release Paths

The Awtsmoos renews repository, entrypoint, server, evidence, and release vessel before any deploy command can name its place. Awtsmoos.com keeps this catalog explicit so an AI handoff never reconstructs production-critical paths from relative fragments.

## Repository and Git

```text
repositoryRoot      /Users/awtsmoos/work/awtsmoos.com
repositoryPackage   /Users/awtsmoos/work/awtsmoos.com/package.json
gitRoot             /Users/awtsmoos/work/awtsmoos.com/.git
gitHead             /Users/awtsmoos/work/awtsmoos.com/.git/HEAD
gitConfig           /Users/awtsmoos/work/awtsmoos.com/.git/config
```

## Ohrfront application

```text
ohrfrontRoot        /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront
ohrfrontIndex       /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/index.html
ohrfrontEntry       /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/src/OhrfrontEntry.js
ohrfrontBootstrap   /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/src/loading/MalchusOhrfrontBootstrap.js
ohrfrontStylesEntry /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/styles/ohrfront.css
```

## Shared core and dynamic server

```text
proceduralCoreRoot /Users/awtsmoos/work/awtsmoos.com/geelooy/libs/awtsmoos-procedural-core
dynamicServerRoot  /Users/awtsmoos/work/awtsmoos.com/ayzarim/awtsmoosDynamicServer
compactJsRoot      /Users/awtsmoos/work/awtsmoos.com/ayzarim/awtsmoosDynamicServer/compactJs
compactCssRoot     /Users/awtsmoos/work/awtsmoos.com/ayzarim/awtsmoosDynamicServer/compactCss
```

## Absolute-path authority

```text
canonical registry /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/YesodAbsolutePathRegistry.mjs
printer            /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs
writer CLI         /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs
provenance         /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/TiferesAbsolutePathProvenance.mjs
role authority     /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/ChochmahAbsolutePathRole.mjs
legacy facade      /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/scripts/ai/ChochmahAbsolutePathAuthority.mjs
```

The `scripts/ai` surface is compatibility-only. It projects historical root names from the canonical `tools/ai` registry instead of maintaining a second filesystem truth model.

## AI planning storage

```text
canonical physical AI root /Users/awtsmoos/work/.ai-thoughts
human alias                /Users/awtsmoos/work/ai-thoughts
repository planning root   /Users/awtsmoos/work/awtsmoos.com/ai-thoughts
```

Current absolute-path mission:

```text
session id         2026-08-28-0312-absolute-path-truth
canonical session  /Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth
evidence root      /Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/evidence
remaining work     /Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/REMAINING_WORK.md
release evidence   /Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/RELEASE_EVIDENCE.md
path manifest      /Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/ABSOLUTE_PATH_MANIFEST.md
human path data    /Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/evidence/absolute-paths-human.out
JSON path data     /Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/evidence/absolute-paths.json
```

## Rich provenance expectations

Release/handoff JSON remains schema `awtsmoos.ai.absolute-system-paths.v2`. Every enriched record should expose canonical physical identity plus `role`, `scopes`, `primaryScope`, `fileUri`, repository/session-relative annotations when applicable, and `equivalentKeys` for aliases or duplicate declarations.

Canonical absolute paths are authority. Relative projections are explanatory annotations only.

## Materialize current evidence

This command may run from any working directory:

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs --session=2026-08-28-0312-absolute-path-truth
```

Use `--format=json` when an agent needs the immutable writer receipt instead of the three canonical artifact paths.

Never copy this document as executable configuration. These are currently verified machine paths; the registry derives and canonicalizes them from physical module location at runtime. Browser runtime and network APIs do not expose them.
