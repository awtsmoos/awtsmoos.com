B"H

# AWTSMOOS TUNNEL — SOURCE RELIABILITY AUDIT AND LIVE MAC EVIDENCE
2026-10-19, America/New_York. Primary route: `awt-awtsmoos-2184`.
Authoritative working checkout: `/Users/awtsmoos/work/awtsmoos.com` on Intel Mac `Yackovs-MacBook-Air.local`.

## Executive finding: PARTIALLY REPAIRED, NOT PRODUCTION VERIFIED
The real installed agent accepted and completed four trivial synchronous native commands, a durable asynchronous command, subsequent exact-status observations, and separate stdout retrieval. Its own local `/readyz` reports a registered relay but explicitly declares `commandExecution: not_probed`. Therefore native command execution through loopback is **observed**, while authenticated remote dispatch from the hosted server through WebSocket to this native child is **not yet proven**.

The installed runtime remains **1.0.681**, whereas the verified new repository manifest is **1.0.686**. Never equate a committed repair, source test, ZIP test fixture, server Git push, runtime installation, and live behavior.

## Architecture map — verified code boundaries
1. Hosted server control API authenticates the caller, resolves the requested device, applies account-bound ownership rules, and durably stores request/recovery state in the tunnel relay.
2. WebSocket registration under `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay` fences an incumbent using `registrationTransfer.js`; `lower_authority_tunnel_owner_active` comes from this security check and must not be suppressed.
3. The local native agent has a supervised parent launcher, separately incarnated WebSocket connection child, durable child ingress custody, parent main queue, priority lanes, and command/FS/browser executors.
4. The command runner has synchronous inline execution and durable asynchronous jobs; accepted job IDs have separate status and output APIs, reconciliation, persisted receipts, terminal ACKs and idempotency controls.
5. The local loopback HTTP entrypoint in `agent/lib/local-api.js` serves `/healthz`, `/readyz`, `/command`, `/fs`, and tool-specific operations. Local success does not prove the hosted control plane.
6. The Merkava runtime flows through `tools/fs/actionGroups/runtimeActions.js` and the local ESM Merkava service. Virtual CJS is bounded by `MerkavaVirtualRequire.js`, and separate legacy ESM execution is selected by `MerkavaVmFileExecutor.js`.
7. The release pipeline uses `agent/manifest.txt`, `release/releaseSourceGuard.js`, `agent/scripts/verify-manifest.cjs`, `geelooy/api/tunnel/install/tools/zipBundle.js`, and platform installers. Current installed files are in `~/.awtsmoos-tunnel`, not the Git working tree.

## Chronology and observations (all UTC on 2026-10-19 unless indicated)
- Historical reported failures supplied by the user: pending control receipts, execution stalls, WebSocket 1012, authority conflicts, false cognition successes, Merkava VM `require is not defined`. Historical reports are **not** new log proof of their root causes.
- At 11:00:55.152, installed `agent.log`: `connection child 75578 SIGTERM for execution_consumer_stalled`; source of the stalled execution remains unproven.
- At 11:01:06.006 a WebSocket opened; 11:01:07.431 registration succeeded for `awt-awtsmoos-2184`.
- At 11:03:14.908 and 11:06:58.737 log recorded `websocket_remote_close_1012`, reconnecting. Receipt also reports `remote_close_1012:Server restart`; no server-side restart trace was independently obtained.
- Two launcher process roots were observed, including supervised `~/.awtsmoos-tunnel` and old temporary `awts-complete-reinstall-.../live-runtime`; this is a *possible* competing-instance risk, not confirmed dual route registration. Neither was killed.
- Eight historical reconciliation batches repeatedly inspected about 147 command jobs. Source and a red-green pagination fixture demonstrated omitted page advancement.
- Installed cognition action `merkavaParserSmoke` via `POST /fs` responded HTTP 200, `ok:true`, `result.type:cognition-report` without executing a parser smoke test. This confirms the runtime false-success defect.
- Installed `/readyz`: HTTP 200, `relayReady:true`, runtime `1.0.681`, `commandExecution:not_probed`.
- Four installed `POST /command` inline commands correctly produced `AWTSMOOS_NATIVE_PROOF_42` with code 0 in 155, 11, 18 and 13 ms.
- Durable job: `cmdjob_mvf6fdvi_f5c3f2a6b378`, accepted HTTP 200 in 115 ms, initially `spawning`, observed `completed` with exit code 0 by 386 ms, exact output-page returned `AWTSMOOS_DURABLE_RECEIPT_42` without resubmitting original work.
- A missing owner identity produced `missing_command_owner_identity`; a new correctly identified request succeeded, preserving owner-scope protections.

## Confirmed causes and source repairs
**A. False cognition success (confirmed in installed runtime).** Generic cognition fallback returned success-shaped reports without performance. Corrected source module `geelooy/apps/tunnel/agent/tools/fs/actionGroups/cognition/genericCognitionReport.js` now returns `ok:false`, `performed:false`, `analysisOnly:true`, `error:cognition_action_not_implemented`. Existing local installation is still old; deployment is not claimed. Regression `agent/testing/cognitionHonestFallback.test.cjs`.

**B. Repeated history pages (source-reproduced).** `stateRootsAsync.js` always selected the initial bounded list of roots, and the continuation had no cursor. Changed `tools/fs/commandJob/stateRootsAsync.js`, `crossRootScanner.js`, `crossRootReconciler.js` to preserve the next unvisited root offset without skipping a partially inspected root. New `agent/testing/crossRootContinuationPagination.test.cjs` failed before repair (two distinct roots instead of five), passed afterward (five across three pages). Full scan throughput improvement is not yet measured in deployed agent.

**C. Mixed CJS/ESM entrypoint selection (source-reproduced).** `MerkavaVmFileExecutor.js` selected a loader based on **all virtual files**, so an unused ESM sibling could divert a CommonJS entrypoint into an incorrect executor. Now prefer identifiable syntax of the requested entrypoint, retaining virtual require's restrictions against host imports. Extended `MerkavaVirtualRequire.test.js` from five to eight checks. This fixes one reproduced related module-loading failure; the historical full workflow's precise `require is not defined` stack was not reproduced from its archived receipt.

**D. Stale retry regression test (test-contract mismatch).** A test expected `commandStart` to redispatch after restart. `request-retry-durability.js` deliberately marks it not replay-safe; a repeated command must instead be coalesced until reconciled. Corrected `requestRetryReadRestartReplay.test.cjs` to assert read-only replay once and no blind command/write replay. No weakened production replay policy.

**E. Manifest inventory omissions (confirmed).** The repository's existing `1.0.685` manifest omitted 20 present runtime modules, including browser action handlers, binary artifact upload helpers, and Merkava URL/backends. Rebuilt deterministically to **1.0.686** with **3,076 runtime manifest files**; `verify-manifest.cjs` now says `manifest_fresh`, source guard `release_source_clean`, startup probe passed. The public manifest URL returned HTTP **403** during external baseline check, so the new version was derived from Git/local baselines and is not proven publicly accessible.

## Performance measurements — never conflate different paths
- Local `awt status` first/cold tool-observed total 2,269 ms. Ten subsequent CLI checks: p50 172 ms, p90 199 ms, p95/p99 202 ms, max 202 ms. Captured in `04_STATUS_BASELINE.json`.
- Ten loopback `GET /readyz` calls: typical 2–8 ms, one 65.76 ms tail, p50 3.64 ms and sample p95 65.76 ms. This measures local HTTP, not hosted control dispatch.
- Four loopback inline commands: 155, 11, 18, 13 ms from client fetch start through final HTTP JSON and correct stdout.
- Local durable command: 115 ms through initial accepted receipt; terminal observed at 386 ms after one subsequent poll; stream returned correct output from a separate call.
- Explicit Merkava runtime with inline HTML returned score 100/console output in 702 ms. `engine:auto` spent its first **3,500 ms** trying Chrome, timed out, and returned `node-dom` at 3,517 ms. This is an observed fallback-policy tail-latency source, not fully repaired.
- No defensible before/after hosted dispatch percentiles or incident-wide p99 exist yet. Stage timestamps across ingress, queue, WS, child, worker, persistence and caller were not fully collected.

## Tests and evidence
- Focused source/custody/reconnect/Merkava selection: 38/38 passing.
- Historical cross-root scan/reconciliation subset: 6/6 passing.
- Extended security, replay, release, native-agent lifecycle matrix: 33/33 passing after stale retry test correction.
- Four explicit Merkava runtime-action harness assertions passed; real runtime produced score 100.
- Hosted relay account/registration fencing harness passed.
- Deterministic manifest integrity check `manifest_fresh`, source guard clean.
- Temporary ZIP closure test confirmed `1.0.686`, 3,077 bundle entries, 10,516,406 bytes, SHA-256 `668f8a5a63cbdade64a8ccc823e8f10844ac509c646e5a99911967af4a76f725`, startup imports and installed manifest verifier. This test deletes its temporary artifact, and **does not prove a published ZIP or running install**.
- Normal local browser/Chrome screenshot tests, true hosted WS control calls, real server restart + 1012 injection, ownership lease expiry injection, remote failure recovery, deployment installation, and p99 before/after measures are not complete.

## Security boundaries
Retained authenticated server ownership fencing; no Linux tunnel was used; no secrets printed or committed. Never infer execution from `/readyz` heartbeat alone. Original durable receipt IDs were observed rather than resubmitted. No forced Git reset, blind command replay, guardian restart, or installed agent replacement was performed.

## Git, release, and rollback evidence
- Starting HEAD was `bde3c07c7`; unrelated glyph source became visible through independent concurrent work and origin eventually advanced to `77c619a41`. We did not discard or overwrite it.
- Source repair commit: `7f7c63120`.
- Manifest regeneration commit: `e5ceed47f`.
- Retry idempotency test commit: `b52055f9f`.
- Explicit runtime harness commit: `9e6f8368b`.
- Installed `~/.awtsmoos-tunnel/release-source-sha.txt`: `1098afa92ef270ef15cc3de797a28561236eb0cf`; installed runtime `1.0.681`.
- Manifest local SHA-256 after v1.0.686 generation: `bc07f9cf4e65076e663f740bb8f276669b605d499fea7923e5abb37a51c48771`.
- Existing installed manifest, recovery archive, and known-good mechanisms remain intact for rollback. Actual controlled activation/rollback has **not** been performed.

## Completion status (distinct evidence levels)
| Criterion | Status |
|---|---|
| Observed native Mac readiness and commands | **Observed and locally executed** |
| False-success defect cause | **Confirmed**, old live runtime still has it |
| Paginated recovery scanner cause | **Confirmed in source/test fixture** |
| Mixed-module entrypoint cause | **Confirmed in source/test fixture** |
| Source fixes + selective regression tests | **Passing** |
| Manifest closure | **Verified as source and temporary ZIP test** |
| Published production artifact | **Unverified** |
| Installed `1.0.686` on intended Mac | **NOT deployed** |
| Live remote server → WebSocket → Mac execution | **NOT verified** |
| Fully repaired 1012/stall/ownership incident | **NOT established** |
| Complete stage-level latency p99 + after/deployment | **NOT measured** |

## Prioritized unresolved risks and next engineering gates
P0: Prove authenticated hosted control dispatch and terminal ACK on `awt-awtsmoos-2184`, then reproduce exact old consumer stalls and server-origin 1012. Gather per-stage latency and worker custody progress without side-effect replay.
P0: Establish controlled, manifest-hash-verified native upgrade and rollback. Public manifest fetch currently responds 403; installed runtime remains old. Resolve publication/reachability before using network installer.
P1: Identify old temporary reinstall launcher's authority, socket, process tree, and whether it actually claims registration. Do not terminate it on speculation.
P1: Profile auto Chrome startup's 3.5-second fallback; preserve an explicit Chrome-fidelity path while considering a health-based short-circuit or configurable fast engine preference.
P1: Test lost ACK, server/child restarts, overlapping mutable requests, long jobs, cancellation, browser navigation and screenshot transfer against real paired server/agent.
P2: Audit the full advertised cognition list (many operations legitimately remain unsupported). Separate actual handlers from safe `not_implemented` replies and cover contract-specific behavior.
P2: Cross-root job pagination still reexamines a *single partially inspected root* if the per-root job/action cap is reached; preserving this root avoids skipped work, but a within-root cursor may be needed for enormous job forests.

This document records work and evidence, not a declaration of full operational completion.
