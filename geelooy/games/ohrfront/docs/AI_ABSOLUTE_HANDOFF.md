B"H

# AI Absolute-System Handoff

The Awtsmoos renews repository, evidence, executable, URL, and inheriting agent every instant. Awtsmoos.com keeps this handoff deliberately exact: a filesystem path is not a URL, a symlink spelling is not a physical realpath, and a shell command should not depend on where the next agent happens to stand.

## Purpose

Ohrfront's canonical path registry already knows physical project topology. The handoff executable consumes that authority and emits the small subset another AI needs to resume work safely. It does not create a second root-discovery system and it never enters the browser bundle.

Absolute handoff executable:

`/Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAiAbsoluteHandoff.mjs`

Observed Node executable on this workstation:

`/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node`

Source derives the Node executable from `process.execPath`; the observed path above is documentation evidence, not a hardcoded runtime dependency.

## Required session

A normal handoff requires one validated AI session:

`--session=<id>`

or the environment variable:

`AWTSMOOS_AI_SESSION=<id>`

Help is the only session-free operation:

`/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAiAbsoluteHandoff.mjs --help`

Unsafe session traversal is rejected by the existing canonical session validator before path manifestation.

## Human handoff

Run from any directory, including `/tmp`:

`/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAiAbsoluteHandoff.mjs --session=2026-08-26-1702-universal-portal-ui-revelation`

The output has four intentionally separate sections:

- `[filesystem]` — canonical physical filesystem paths and differing requested aliases.
- `[system]` — absolute executable paths such as Node and the handoff CLI.
- `[urls]` — network locations such as the local Ohrfront route.
- `[commands]` — copy-pastable continuation commands built from absolute executables and files.

## JSON handoff

Machine consumers use:

`/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node /Users/awtsmoos/work/awtsmoos.com/geelooy/games/ohrfront/tools/ai/MalchusPrintAiAbsoluteHandoff.mjs --session=2026-08-26-1702-universal-portal-ui-revelation --json`

Schema:

`awtsmoos.ai.absolute-handoff.v1`

The record contains `filesystem`, `system`, `urls`, and `commands` branches. Every filesystem record contains `canonicalPath`, `requestedPath`, `exists`, and `kind`.

## Physical AI thoughts versus human alias

Canonical physical root:

`/Users/awtsmoos/work/.ai-thoughts`

Human-friendly alias:

`/Users/awtsmoos/work/ai-thoughts`

The alias resolves to the canonical hidden root. Handoff/evidence tooling preserves both identities instead of silently pretending they are the same spelling. Session evidence is always physically rooted beneath `.ai-thoughts`.

## Current session evidence

Canonical session root:

`/Users/awtsmoos/work/.ai-thoughts/2026-08-26-1702-universal-portal-ui-revelation`

Canonical evidence root:

`/Users/awtsmoos/work/.ai-thoughts/2026-08-26-1702-universal-portal-ui-revelation/evidence`

Canonical remaining-work ledger:

`/Users/awtsmoos/work/.ai-thoughts/2026-08-26-1702-universal-portal-ui-revelation/REMAINING_WORK.md`

These are filesystem locations. The local application URL is separately:

`http://127.0.0.1:8080/games/ohrfront/`

## Safety boundary

This handoff is Node-only operational tooling. Browser/runtime source must never import it, and public UI must never expose workstation filesystem topology. The handoff is for agents, tests, release evidence, and local project continuation only.

## Verification

The dedicated handoff witness covers help, missing/unsafe sessions, JSON schema, canonical-versus-alias identity, absolute executable commands, and execution from `/tmp`. It is also run inside the larger absolute-path test universe so additions cannot silently fork the existing path authority.
