<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Awtsmoos Cloud Master Plan

This directory is the durable continuation contract for the Awtsmoos Cloud, Website Maker, Geelooy OS, Tunnel account layer, hosting, commerce, and release work.

## Session start order

1. Read `CURRENT_STATE.md`.
2. Read `TASK_LEDGER.md` and select the first `[>]` task, otherwise the first dependency-ready `[ ]` task.
3. Read the matching phase file before editing.
4. Inspect targeted Git status and current file contents before every existing-file edit.
5. Never reset, discard, or overwrite unrelated concurrent-agent changes.
6. Complete the task verification gate before marking it `[x]`.
7. Update `CURRENT_STATE.md` and `TASK_LEDGER.md` before ending a session.

## Source laws

Every touched source file begins with the language-appropriate equivalent of the three blessing lines. JavaScript uses tab indentation, extensive JSDoc, readable multi-line statements, no minification, and fewer than 120 lines per authored source file.

## Phase files

- `PHASE_01_DEPLOYMENTS.md` — immutable revisions, serving, rollback, health, previews.
- `PHASE_02_PROMPT_PUBLISH.md` — one-prompt project creation and Website Maker integration.
- `PHASE_03_CLOUD_PRIMITIVES.md` — storage, functions, databases, compute, jobs, secrets, domains.
- `PHASE_04_OS_TUNNEL.md` — complete account/cloud object graph and Geelooy OS control plane.
- `PHASE_05_COMMERCE_SCALE.md` — plans, metering, Perutas, security, abuse, observability, scale.
- `PHASE_06_RELEASE.md` — global tests, staging, selective Git integration, deploy, production proof.

## Status notation

- `[x]` verified complete.
- `[>]` current in-progress step. There should normally be exactly one.
- `[ ]` not started or dependency-blocked.
- `[!]` blocked by an external dependency; document the blocker in `CURRENT_STATE.md`.
