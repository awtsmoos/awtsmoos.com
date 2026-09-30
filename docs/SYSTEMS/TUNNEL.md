B"H
Boruch Hashem
Blessed is He

# Tunnel System — Architecture Truth

The Awtsmoos joins distant machines without erasing identity or custody; Awtsmoos.com treats route identity, execution ownership, recovery, release provenance, and public proof as separate vessels that must agree.

## Runtime graph

`client/control API -> immutable tunnel route -> primary supervisor -> agent child -> bounded physical workers`

Independent of the primary process family, four official recovery lanes guard the runtime:

- `guardian` — observes primary health and performs bounded repair.
- `http` — local HTTP recovery surface.
- `socket` — local socket recovery surface.
- `file` — filesystem recovery surface.

The official lanes must exist before a newly promoted primary supervisor starts. Retired `com.awtsmoos.independent-*` jobs are historical emergency helpers, not official recovery.

## Identity and custody

- Tunnel identity is the immutable route/tunnel id, not one PID, worker, process generation, or WebSocket connection.
- Command acceptance creates durable custody. A 502/504, EPIPE, socket close, installer replacement, or server restart after acceptance does not authorize replay.
- Observe the original receipt/job with status, wait, output paging, action history, or the returned `retryAction` contract.
- Durable active job states include `spawning`, `running`, and `detached_running`.
- A transport can be connected while execution is unhealthy; transport, acceptance, execution, mailbox, registration, and public service are distinct health planes.

## Installer and promotion lifecycle

The public release surfaces are:

- `/api/tunnel/install/bundle-manifest`
- `/api/tunnel/install/agent.zip`
- `/api/tunnel/install/unix`
- `/api/tunnel/install/windows`

Production activation builds and verifies the real agent bundle before entering the armed mutation/restart section. Installation reconciles official recovery lanes before primary supervisor takeover. The installer may replace the command worker that invoked it, so post-install verification must come from a fresh read-only command after the same immutable route returns.

## Transfer protocol

Resumable transfer separates source proof, transfer creation, chunk writes, status, commit, and cancel.

- Every chunk is hash-verified.
- Manifest mutation is serialized per transfer across worker processes.
- Range coverage is durable and resumable.
- Final commit verifies total size and full-file SHA-256.
- Commit records a durable `committing` state before rename so interrupted promotion can recover.
- Cancel shares transfer custody and cannot race a chunk/commit mutation.
- Path/secret/overwrite guards remain mandatory.

## Permission model

Risky mission filesystem mutations require a scoped one-time capability. The grant is bound to mission id, action, path, and expiry and succeeds only if consumption succeeds. Caller-provided booleans such as `missionStepAuthorized` are never authority. Replay, wrong scope, and expiry fail closed.

## Source roots

- `geelooy/apps/tunnel/agent/` — installed agent runtime, tools, worker/custody logic, transfer and mission policy.
- `geelooy/apps/tunnel/downloads/` — Unix/Windows installer and recovery activation scripts.
- `geelooy/apps/tunnel-control/` — control-plane UI.
- `geelooy/api/tunnel/control/` — control backend and action admission.
- `geelooy/api/tunnel/install/` — public bundle/installer release endpoints.
- `scripts/production/` — canonical deployment, release preflight, certification, and evidence tooling.

## Release truth

A release is complete only when all of these agree:

1. certified source commit;
2. `origin/main`;
3. clean production `main`;
4. activated production service;
5. public bundle manifest/ZIP/installer;
6. installed Mac release SHA/version and integrity;
7. supervised child custody;
8. all four official recovery launchd labels;
9. the same immutable route after restart/reinstall.

A pushed commit is not deployment proof, and a healthy public endpoint is not installed-runtime proof.

## Incident rules

- Do not reinstall for one transient control failure.
- Do not blindly replay accepted mutations.
- Do not destroy dirty user work to make deployment convenient.
- Sparse checkout can create false missing-module test failures; prove test-universe completeness before changing source.
- Prefer isolated fault-injection harnesses over destructive production faults.
- Remove retired emergency recovery jobs only after official recovery is proven alive.

## Operator verification

Use `awt status` and `awt check` after install/restore, then verify launchd labels, installed source SHA/version, integrity, supervisor-child custody, registration freshness, and immutable route. Public release verification and production repository verification are separate mandatory checks.

For direct Chassidus database import, use `docs/operations/DIRECT_DB_IMPORT_RUNBOOK.md`. For agent behavior, `geelooy/apps/tunnel/agents.md` and `geelooy/ai/agents.md` carry the machine-facing operating law.
