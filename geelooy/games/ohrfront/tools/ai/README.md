B"H

# Ohrfront AI Absolute System Paths

Boruch Hashem. Blessed is He.

The Awtsmoos renews every machine, directory, process, and pathname from nothing each instant. Awtsmoos.com therefore treats AI filesystem location as evidence, not memory: current publication paths are canonical absolute system paths, while older planning locations remain explicitly labeled history.

## Canonical AI artifact root

Current AI plans, evidence, `REMAINING_WORK`, release evidence, and generated path manifests belong beneath:

```text
/Users/awtsmoos/.awtsmoos-agent-thoughts/general
```

The runtime derives this root from `os.homedir()` as:

```text
<home>/.awtsmoos-agent-thoughts/general
```

Do not publish new AI evidence into the repository or work-root aliases merely because those older locations exist.

## Legacy planning locations

The registry deliberately keeps these paths visible as compatibility/provenance evidence:

```text
legacyAiThoughtsRoot     /Users/awtsmoos/work/.ai-thoughts
aiThoughtsAliasRoot      /Users/awtsmoos/work/ai-thoughts
repositoryAiThoughtsRoot /Users/awtsmoos/work/awtsmoos.com/ai-thoughts
```

They are **not** alternate spellings of `aiThoughtsRoot`. A future agent may inspect them for historical artifacts, but new session publication descends only from the canonical host-level root.

## Core contract

`YesodAbsolutePathRegistry` discovers the repository from its own module URL rather than caller CWD. Each record exposes canonical physical identity plus provenance such as:

- `requestedPath`
- `canonicalPath`
- `parentPath`
- `exists`
- `kind`
- `canonicalVerified`
- `role`
- `scopes`
- `primaryScope`
- `fileUri`
- repository/session-relative annotations
- `equivalentKeys`

The `aiThoughtsRoot` record has primary scope `ai-thoughts`. Session descendants have primary scope `ai-session`.

## Print one absolute path

This command can run from any directory:

```bash
/usr/local/bin/node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAbsolutePaths.mjs --key=aiThoughtsRoot
```

The default single-key output is one bare canonical absolute path, suitable for shell capture.

Available formats include `text`, `json`, `env`, `paths`, `keys`, and `system`. `system` additionally reports physical realpath/device/inode evidence when a target exists.

## Session paths

For a validated session id such as `ohrfront-release-2026-08-31`:

```text
aiSessionRoot  /Users/awtsmoos/.awtsmoos-agent-thoughts/general/ohrfront-release-2026-08-31
evidenceRoot   /Users/awtsmoos/.awtsmoos-agent-thoughts/general/ohrfront-release-2026-08-31/evidence
remainingWork  /Users/awtsmoos/.awtsmoos-agent-thoughts/general/ohrfront-release-2026-08-31/REMAINING_WORK.md
```

Unsafe traversal session ids are rejected before publication.

## Dedicated AI handoff

```bash
/usr/local/bin/node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAiAbsoluteHandoff.mjs --session=ohrfront-release-2026-08-31
```

The handoff separates:

- canonical and legacy filesystem records
- absolute system executables
- URLs
- copy-pastable continuation commands containing absolute executables and absolute target paths

Use `--json` for machine ingestion.

## Materialize evidence

```bash
/usr/local/bin/node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusWriteAbsolutePathEvidence.mjs --session=ohrfront-release-2026-08-31
```

The writer creates the session/evidence directories under the canonical AI root and prints canonical absolute artifact paths. Tests use unique throwaway sessions and delete only their exact generated session directory.

## Safety boundary

These tools are Node/agent tooling. Browser runtime and network APIs must not expose host filesystem paths. Relative projections are explanatory annotations only; canonical absolute paths remain authority.
