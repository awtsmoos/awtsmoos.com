#B"H — The Great Awtsmoos Tunnel Revelation — Ledger
Started 2026-11-24T19:16Z (server). Repo main, 309 dirty paths from other sessions (PRESERVED, never erased).

## Phase A — Truth (baseline, before any change)
- Apps exist: geelooy/apps/tunnel, tunnel-control, code; API: geelooy/api/tunnel/{_awtsmoos.derech.js, control/{core,routes(131 files),docs,missionRooms,mcp,preview}, install}; WS relay: ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay (durable envelopes/store already present).
- Lifecycle: client -> control route (request.js: POST body via bodyPayload.bodyJson from paramKinds.POST; GET via paramKinds.GET) -> tunnelPayload builders (core/tunnelPayload/*) -> relay durable envelope -> native agent (apps/tunnel/agent) -> durable result -> responsePruner.
- Baseline tests: control/core/test = 33/33 PASS. Public: tunnel 200, tunnel-control 200, code 301, os 301, docs 200 (title Awtsmoos Tunnel API Docs), install windows/unix 200 with B"H bash script.
- nginx: client_max_body_size 100M global, oauth-api 96m, tunnel-rescue WS proxy timeouts 3600s. No BH.sh in repo root; deploy law = scripts/VM_DEPLOY_API.md + vmDeploySigned.mjs (server-side Node needs systemctl restart awtsmoos.service; static live on next request). CACHE_BUSTING.md + bustAllCaches.mjs + BuildVersionGuard govern freshness; visible URLs unchanged.
- PRE-EXISTING FAILURE: tests/tunnel-command-surface/chatgptOpenApiYaml.test.cjs expects internal operation enums (- chatgptSeasonSaveAndContinue) in the GPT yaml. The current generator (scripts/generate-tunnel-openapi-live.cjs) renders the new 14-capability body-first surface and deliberately does NOT leak internal enums (leaksInternalDoctorEnum:false). Regenerating DELETES 59 lines/file and the test still fails -> test is stale vs the new surface; generator output restored byte-identical, nothing committed from that experiment. Recorded as Known Defect K1 for a future ruling (update test to capability surface, or re-add operation enums).

## Known defects from mission brief vs reality
- 414: partially solved already — generated OpenAPI is body-first (awtsmoosTunnelAction POST + application/json, legacy GET kept), large writes have dedicated resumable transfer (awtsmoosTunnelTransferGet, chunked SHA-256). Gap closed this run: a deterministic transport guard module.
- Disappearance/uncertain jobs: relay already has durablePendingRecovery/durableStore; gap closed: canonical job state machine distinguishing not_accepted/unknown, blind-retry forbidden except not_accepted.
- Device affinity, premature termination: missionRooms + mission actions exist; full engine rework NOT done this run (see Remaining).

## 3 planning passes (condensed)
1. Explore: reuse existing durable relay/payload/installer systems; do not rewrite working infra.
2. Refine: add a small canonical layer (core/revelation) that existing surfaces can adopt incrementally; pure modules, zero wiring risk, fully unit-tested.
3. Sequence: protocol -> jobs -> transport -> paths -> safe writes -> reconnect, tests first-class in core/test (auto-discovered by walkers).

## Implemented this run (Phase B/C/E foundations)
New package geelooy/api/tunnel/control/core/revelation/ (6 modules, all <120 lines, tabs/JSDoc/B"H):
- protocol.js (92L): canonical awtsmoos.tunnel/1 envelope validateRequest + makeResponse (accepted != completed; statuses incl. partial/pending/unknown/not_accepted).
- jobLifecycle.js (66L): legal transition graph, terminal set, mayRetryBlindly only for not_accepted.
- transportGuard.js (43L): 2048B URL ceiling, 32MB bounded body, payload-in-GET rejected (414 killer), larger -> chunked.
- pathGuard.js (42L): traversal/absolute/null-byte/symlink-escape/sensitive-file denial, realpath ancestor walk.
- safeWrite.js (58L): atomic tmp+rename, mode preservation, expected-hash precondition (null = must-not-exist), optional backup, temp cleanup.
- reconnect.js (45L): capped exponential backoff + jitter (injectable random), presence classification (stale heartbeat = degraded/offline, never confidently online; auth_required wins).
Test: core/test/revelation.test.cjs — covers all six incl. real symlink escape + hash-conflict in a temp project. PASS.
Full core suite after change: see verification below.

## Remaining (honest)
- Adopt revelation modules inside live routes/relay/agent (wiring = next mission; modules are additive, nothing live imports them yet).
- K1 stale OpenAPI test vs 14-capability surface — needs a ruling.
- Tunnel/Tunnel-Control UI reinvention, shared-room UI, mission watchdog wiring, workflow/browser/preview unification: NOT completed this run.
- Windows/macOS installer E2E: not physically verified (Linux static tests only: installerSourceFingerprint PASS, missionAccess PASS).
- No deploy/restart performed: new files are additive library modules not imported by running code, so no restart needed and none risked amid 309 other-session dirty paths. BH.sh does not exist in this repo; deploy law followed by NOT deploying.

## Rollback
git checkout -- (nothing modified) ; delete untracked: geelooy/api/tunnel/control/core/revelation/ geelooy/api/tunnel/control/core/test/revelation.test.cjs and this ledger dir. Scoped commit (if made) reverts with: git revert <hash>.

## Verification (post-change)
- Core suite re-run: 34 tests, 33 pass in-suite; the 1 failure (apiKeyStoreAtomicExpiry) passes 3/3 standalone and passed in the 33/33 baseline — timing flake under suite load, unrelated (no shared code). Revelation test PASS standalone and in-suite.
