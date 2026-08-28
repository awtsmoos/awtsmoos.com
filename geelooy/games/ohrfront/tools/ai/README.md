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

Every registry record preserves the original canonical fields and now also exposes:

- `key`: stable semantic registry name.
- `role`: `root`, `entry`, `style`, `planning`, `release`, `evidence`, `tool`, or another bounded role.
- `scopes`: every containing realm, such as `ai-session`, `ohrfront`, `repository`, or `work`.
- `primaryScope`: the narrowest meaningful containing realm.
- `fileUri`: portable `file://` identity for the canonical physical path.
- `relativeToRepository`: readability annotation only; never path authority.
- `relativeToSession`: session-local readability annotation when applicable.
- `equivalentKeys`: registry names resolving to the same physical canonical path.

The historical fields remain authoritative: `requestedPath`, `path`, `canonicalPath`, `parentPath`, `basename`, `extension`, `exists`, `kind`, `canonicalized`, and `canonicalVerified`.

## Print one shell-clean absolute path

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=ohrfrontRoot
```

Default single-key text output remains one canonical absolute path so command substitution stays compatible.

## Rich discovery

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=ohrfrontEntry --format=text
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --session=2026-08-28-0312-absolute-path-truth --format=json
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --keys
```

JSON keeps schema `awtsmoos.ai.absolute-system-paths.v2`, declares CWD independence, preserves the historical top-level `paths` map, and enriches each record with provenance.

## Resolve from an explicit semantic root

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --resolve=src/OhrfrontEntry.js --from=ohrfrontRoot
```

Relative targets never use caller CWD. The explicit default base remains `repositoryRoot`.

## Materialize this session's evidence

This command may be run from `/tmp` or any unrelated directory:

```bash
node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs --session=2026-08-28-0312-absolute-path-truth
```

Canonical publication destinations:

```text
/Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/ABSOLUTE_PATH_MANIFEST.md
/Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/evidence/absolute-paths-human.out
/Users/awtsmoos/work/.ai-thoughts/2026-08-28-0312-absolute-path-truth/evidence/absolute-paths.json
```

The writer stages complete sibling temporary files and atomically renames them. It never writes through `/Users/awtsmoos/work/ai-thoughts` merely because that alias is convenient.

## One authority, two compatibility surfaces

The canonical authority lives under:

```text
/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai
```

The historical `scripts/ai` API remains compatible, but its root strings now come from the canonical `YesodAbsolutePathRegistry`. Old callers may continue using `game`, `source`, `tests`, `aiThoughts`, and related names without creating a second filesystem truth model.

## Safety and release use

Session ids permit only letters, numbers, `.`, `_`, and `-`; separators and traversal fail before path composition. Use `--require-existing` for source/release inputs that must already exist. Future evidence outputs should not be required to exist before the writer creates them.

Stable printer formats remain `text`, `json`, `env`, `paths`, and `keys`. Browser game code never imports this tooling, and host filesystem paths are not exposed through Ohrfront runtime or network APIs.

Release-critical machine evidence is cataloged at:

```text
/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/RELEASE_PATHS.md
```
