B"H

# Awtsmoos AI Absolute System Paths

The Awtsmoos renews every root before a pathname can describe its finite place. Awtsmoos.com keeps this tooling strict: AI, release scripts, and future agents exchange canonical absolute filesystem truth instead of depending on whichever directory happened to launch Node.

## Canonical executables

```text
printer  /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs
writer   /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs
registry /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/YesodAbsolutePathRegistry.mjs
```

These machine paths are documentation evidence, not hardcoded runtime configuration. The registry discovers roots from its own physical module location and canonicalizes them at runtime.

## Physical truth and human aliases

```text
canonical physical AI root /Users/awtsmoos/work/.ai-thoughts
human alias                /Users/awtsmoos/work/ai-thoughts
repository planning root   /Users/awtsmoos/work/awtsmoos.com/ai-thoughts
```

The canonical physical path is authoritative. Alias spelling remains visible as `requestedPath` and through `equivalentKeys`, but publication writes to the physical `.ai-thoughts` root.

## Rich provenance records

Every registry record preserves the original canonical fields and also exposes semantic provenance: `key`, `role`, `scopes`, `primaryScope`, `fileUri`, repository/session-relative readability annotations, and `equivalentKeys`.

The historical fields remain authoritative: `requestedPath`, `path`, `canonicalPath`, `parentPath`, `basename`, `extension`, `exists`, `kind`, `canonicalized`, and `canonicalVerified`.

## Print one shell-clean absolute path

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=ohrfrontRoot
```

Default single-key text output remains exactly one canonical absolute path. Keep this form for shell command substitution and scripts expecting a bare pathname.

## Print physical system identity for AI

Use explicit `system` format when an AI, release agent, or handoff needs to distinguish an absolute-looking alias from the physical filesystem object:

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=aiThoughtsAliasRoot --format=system
```

System output places `canonicalPath` first and also reports `requestedPath`, `physicalRealpath`, `exists`, `kind`, `requestedExists`, `requestedIsSymlink`, `canonicalized`, `canonicalVerified`, device/inode identity, byte size, permission mode, and modification time. Missing future targets remain canonical absolute paths with explicit `exists=false` and null physical metadata.

For the AI alias above, current filesystem truth is:

```text
requestedPath=/Users/awtsmoos/work/ai-thoughts
canonicalPath=/Users/awtsmoos/work/.ai-thoughts
physicalRealpath=/Users/awtsmoos/work/.ai-thoughts
requestedIsSymlink=true
canonicalVerified=true
```

## Rich discovery

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=ohrfrontEntry --format=text
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --session=2026-08-28-0444-absolute-system-path-evidence --format=json
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --keys
```

JSON keeps schema `awtsmoos.ai.absolute-system-paths.v2`, declares CWD independence, preserves the historical top-level `paths` map, and enriches each record with provenance.

## Resolve from an explicit semantic root

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --resolve=src/OhrfrontEntry.js --from=ohrfrontRoot --format=system
```

Relative targets never use caller CWD. The explicit default base remains `repositoryRoot`. System format is equally valid for arbitrary resolved targets.

## Materialize this session's evidence

This command may be run from `/tmp` or any unrelated directory:

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs --session=2026-08-28-0444-absolute-system-path-evidence
```

Canonical publication destinations live beneath:

```text
/Users/awtsmoos/work/.ai-thoughts/2026-08-28-0444-absolute-system-path-evidence
```

The writer stages complete sibling temporary files and atomically renames them. It never writes through `/Users/awtsmoos/work/ai-thoughts` merely because that alias is convenient.

## One authority and compatibility surfaces

Canonical authority lives at `/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai`. Historical `scripts/ai` callers still project from the same `YesodAbsolutePathRegistry`; they do not create a second filesystem truth model.

## Safety and release use

Session ids permit only letters, numbers, `.`, `_`, and `-`; separators and traversal fail before path composition. Use `--require-existing` for source/release inputs that must already exist. Future evidence outputs should not be required to exist before the writer creates them.

Stable printer formats are `text`, `json`, `env`, `paths`, `keys`, and `system`. Browser game code never imports this tooling, and host filesystem paths are not exposed through Ohrfront runtime or network APIs.

Release-critical machine evidence is cataloged at:

```text
/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/RELEASE_PATHS.md
```
