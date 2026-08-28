B"H

# Awtsmoos AI Absolute System Paths

The Awtsmoos renews every root before a pathname can describe its finite place. Awtsmoos.com keeps this tooling strict: AI, release scripts, and future agents exchange canonical absolute filesystem truth instead of depending on whichever directory happened to launch Node.

## Canonical executables

Read-only discovery:

```text
/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs
```

Explicit session evidence publication:

```text
/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs
```

Both executables derive repository identity from physical module location. `/Users/awtsmoos` documents this machine; it is not hardcoded runtime configuration.

## Path truth model

Every rich path record exposes `requestedPath`, canonical `path`/`canonicalPath`, canonical anatomy, existence/kind evidence, and canonicalization verification. Human symlink spelling remains visible when supplied, but canonical physical identity is authoritative.

Current AI storage realms:

```text
canonical physical AI root /Users/awtsmoos/work/.ai-thoughts
human alias                /Users/awtsmoos/work/ai-thoughts
repository planning root   /Users/awtsmoos/work/awtsmoos.com/ai-thoughts
```

## Print one shell-clean absolute path

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=ohrfrontRoot
```

Single-key default output is one canonical absolute path, suitable for command substitution.

## Rich discovery

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=ohrfrontEntry --format=text
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --format=json
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --keys
```

JSON uses schema `awtsmoos.ai.absolute-system-paths.v2`, declares `cwdIndependent: true`, and retains the complete keyed record graph.

## Resolve from an explicit semantic root

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --resolve=src/OhrfrontEntry.js --from=ohrfrontRoot
```

Relative targets never use caller CWD. The explicit default base is `repositoryRoot`.

## Materialize absolute-path evidence

For the current live session:

```bash
cd /tmp
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs --session=session-20260826-1702-universal-portal-ui-revelation
```

The command publishes exactly these canonical physical files and prints their absolute paths:

```text
/Users/awtsmoos/work/.ai-thoughts/session-20260826-1702-universal-portal-ui-revelation/ABSOLUTE_PATH_MANIFEST.md
/Users/awtsmoos/work/.ai-thoughts/session-20260826-1702-universal-portal-ui-revelation/evidence/absolute-paths-human.out
/Users/awtsmoos/work/.ai-thoughts/session-20260826-1702-universal-portal-ui-revelation/evidence/absolute-paths.json
```

Use `--format=json` when automation needs the frozen writer receipt rather than three path lines. `AWTSMOOS_AI_SESSION` may supply the session instead of `--session=`.

The writer requires an explicit validated session, confines destinations to the canonical physical session root, stages complete sibling temp files, then atomically renames each artifact into place. It never chooses a destination from caller CWD and never writes through `/Users/awtsmoos/work/ai-thoughts` merely because that alias is convenient to humans.

## Session safety

Session ids permit only letters, numbers, `.`, `_`, and `-`. Separators and traversal fail before session composition. The read-only printer and evidence writer share the same guarded registry, so discovery and publication describe the same physical root model.

## Strict release discovery

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=ohrfrontEntry --require-existing
```

Missing source targets become hard failures containing the absolute printer path and canonical missing target. Future evidence destination files should not be required to exist before the writer creates them.

## Stable output formats

The printer supports `text`, `json`, `env`, `paths`, and `keys`. The writer supports `paths` and `json` receipts. Importing either executable is silent; terminal output occurs only at the direct CLI boundary.

For this machine's release-critical path catalog, use:

```text
/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/RELEASE_PATHS.md
```

These tools are development/release-only. Browser game code never imports them, and host filesystem paths are not exposed through Ohrfront runtime or network APIs.
