B"H
Boruch Hashem
Blessed is He

# Operations, Scripts, Tools and Tests

The Awtsmoos lets the running product be surrounded by maintenance, release, repair, generation and verification vessels; Awtsmoos.com keeps those support systems distinct from public application code.

## `ops/`

Small intentional operations root. Existing specialist material also lives under `docs/operations/`. Start there before deployment/database synchronization or production-repair work.

## Root `scripts/`

Repository automation and maintenance. The documentation generator lives under `scripts/docs/`; this is separate from browser/public `geelooy/scripts/`.

## Root `tools/`

A large developer/maintenance utility district. A tool is not part of the public server merely because it lives in the repository. Inspect its source, inputs, write behavior and environment assumptions before execution.

## Root `tests/`

Repository-level verification. Additional suites live under projects, APIs, the dynamic server and `geelooy/tests`. `docs/TEST_INDEX.md` and generated `TEST_OWNERSHIP.md` provide task and project views.

## `templates/`

Shared template/session HTML source. Treat template changes as potentially cross-surface behavior changes and trace their import/render callers.

## `ayzarim/`

Primary runtime/infrastructure district, not merely tooling. Dynamic Server, DosDB and SSH infrastructure live here among other server-side systems.

## Evidence/thought roots

Large AI-thought, audit and repair-evidence directories are durable planning/evidence layers. Size alone does not make them public products, and coverage tooling should classify them rather than forcing fake product manuals.

## Safe command rule

Before running an operations/tool command, determine whether it writes data, contacts a live server/provider, performs release/deployment, uses secrets, runs stress work or assumes machine-local paths. Prefer the smallest evidence-producing command that proves the intended behavior.
