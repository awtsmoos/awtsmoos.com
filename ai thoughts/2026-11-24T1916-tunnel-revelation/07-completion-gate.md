# B"H — Tunnel Revelation FINAL COMPLETION GATE (§42) — 2026-11-25

Scored after run 06 (two coordinated restarts, live authenticated probes,
CDP mobile pass, live mission exercise). Legend: LIVE-VERIFIED = proven
against production; VERIFIED = proven by tests/fixtures/route-layer;
PARTIAL = real but not fully exercised; BLOCKED = proven impossible now,
with evidence.

| # | Gate item | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Installation works | PARTIAL | Linux disposable-HOME fail-safe (run 02); installer suites 9/10 + fingerprint standalone PASS. Win/Mac: see BLOCKED line |
| 2 | Repair works | PARTIAL | Installer repair path exists + static tests; no live repair drill |
| 3 | Upgrade works | PARTIAL | Static/simulated only |
| 4 | Uninstall works | PARTIAL | Static only; never touches user projects by design |
| 5 | Device identity preserved | VERIFIED | Linux agent identity stable across both run-06 restarts (registered, heartbeat 21:29:27 UTC) |
| 6 | Multiple devices handled correctly | VERIFIED | Presence projection live; deviceState honesty rendered-verified (runs 02/04/05) |
| 7 | Authentication works | LIVE-VERIFIED | Real 401s (fs, devices, bridge); session-restore fix rendered-verified run 05 |
| 8 | Permissions enforced | LIVE-VERIFIED | Bridge write gate rejects API-key-only writes; fs coarse denial; 401 before guard |
| 9 | Large requests work | LIVE-VERIFIED | Payload-in-GET → HTTP 414 canonical (post ee85e1ef4); POST-body path passes; 413/chunked guidance in body |
| 10 | Large files work | VERIFIED | Chunked large-write transport tests (TC sandbox), byte/line ranges in agent |
| 11 | Bulk writes work | VERIFIED | Native writeIfHash/bulkWriteIfHashes + E2E proof slice (run 03) |
| 12 | Command jobs work | VERIFIED | Job lifecycle E2E (real child process) + relay 32/32 |
| 13 | Command output streams correctly | VERIFIED | Relay durable envelopes; live agent-room shows real command entries |
| 14 | Cancellation works | VERIFIED | jobLifecycle state machine tests (core 37/37) |
| 15 | Reconnection works | LIVE-VERIFIED | Linux agent re-registered after restart 1 (21:13:55) and restart 2; Mac socket closed 1012 + agent reconnect design (backoff+jitter) |
| 16 | Interrupted jobs recover | VERIFIED | Reconcile-only retry semantics (blind retry only from not_accepted) in relay + tests |
| 17 | Browser control works | PARTIAL | Chrome action family exists agent-side; not live-exercised this mission |
| 18 | Previews work | PARTIAL | Preview routes + gateway exist in live store; not re-exercised run 06 |
| 19 | Plugin schema accurate | VERIFIED | K1 test PASS (14-capability body-first); generator regen byte-stable (run 03) |
| 20 | Alternative integrations work | VERIFIED | OpenAPI docs live 200; MCP catalog routes live; HTTP/CLI surfaces share the registry |
| 21 | Tunnel onboarding works | LIVE-VERIFIED | Desktop rendered (runs 04/05: gold, chooser, async honesty) + CDP mobile 390/320 (run 06) |
| 22 | Tunnel Control works | LIVE-VERIFIED | Desktop signed-in rendered (runs 04/05, all defects closed); mobile public shell CDP PASS; signed-in mobile PARTIAL |
| 23 | Code editor integrates | PARTIAL | Exists + linked from tunnel/onboarding; not re-verified this mission |
| 24 | Virtual OS integrates | PARTIAL | Live devices response includes the Virtual OS vessel with capabilities; full flow not exercised |
| 25 | Shared messages persist | VERIFIED | roomBridge route test (persist + replay dedupe, isolated store); account rooms durable |
| 26 | Actual participants identified | VERIFIED | Live agent-room status returns agent/session/device identity per participant |
| 27 | Multi-agent task coordination works | PARTIAL | All 15 missionRoom* handlers real; live exercise was single-agent |
| 28 | File conflicts detected | VERIFIED | safeWrite stale-hash refusal in E2E proof (content untouched) |
| 29 | Missions persist | LIVE-VERIFIED | Run-06 mission persisted in the agent's real device-state store across processes |
| 30 | Background workers execute | PARTIAL | Bounded-tick continuation by explicit re-call (by design); daemon not live-exercised |
| 31 | Missions recover after interruption | PARTIAL | Lease/checkpoint/watchdog machinery + tests; full interruption drill not run |
| 32 | Spending limits enforced | PARTIAL | Peruta treasury + budgets exist in live store; not exercised |
| 33 | Completion gates require evidence | LIVE-VERIFIED | Run-06 live mission: verify demanded proof-bearing evidence; finalize REFUSED without queue/time/owner release |
| 34 | Workflow execution works | PARTIAL | Workflow action families exist; not exercised run 06 |
| 35 | Remote desktop consent enforced | PARTIAL | Consent-model actions exist; not live-exercised (no session run) |
| 36 | Diagnostics useful | VERIFIED | Collector/finders/drawer + health matrix mounted in boot; modules serve 200; signed-in rendered pane check PARTIAL |
| 37 | Action history works | VERIFIED | Action feed/history actions real; live room feed rendered with entries (runs 04/05) |
| 38 | Security tests pass | VERIFIED | Core 37/37 incl. authorization/binding/socket isolation + symlink-escape pathGuard test |
| 39 | Regression tests pass | VERIFIED* | Core 37/37, relay 32/32, client 8/8; *named pre-existing exceptions: routes deviceDiscovery (stash-proven), 3 TC subAgents tests (other sessions' area), installer fingerprint flake (passes standalone) |
| 40 | Production deployment succeeds | LIVE-VERIFIED | Two coordinated restarts run 06; service healthy (PID 1624708); commits pushed ee85e1ef4, 947a51e0c |
| 41 | Production smoke tests pass | LIVE-VERIFIED | 414, presence, bridge gate, devices, docs, installers, social-search pagination — all checked post-restart |
| 42 | Public documentation accurate | VERIFIED | Docs live 200 + rendered clean (run 04 browser); generated from the stabilized generator |
| 43 | Automatic updates work | PARTIAL | Agent runtime/version system exists (runtime 1.0.724); upgrade drill not run |
| 44 | Established public URLs intact | LIVE-VERIFIED | tunnel, tunnel-control, code (301 as before), /os (301), docs, both installers — all unchanged + healthy |

**Counts: LIVE-VERIFIED 11 · VERIFIED 18 · PARTIAL 15 · BLOCKED 1 line below.**

**BLOCKED (proven, not fabricated):** Windows + macOS physical installer
E2E. Evidence: 73 tunnelBindings contain **zero Windows devices** (no
target exists); the only Mac (awt-awtsmoos-2184) held a live socket at the
21:12:26 UTC restart close but shows no post-restart heartbeat proof in
the server journal through 21:29 UTC and dispatch requires the owner
session. The moment a Windows machine or the Mac is provably online with
heartbeat, this line can be exercised.

**Mission verdict:** the foundational + wiring + UI + live-deployment
scope is COMPLETE and live. What remains is PARTIAL-surface depth
(browser-control/preview/workflow/remote-desktop live exercises,
multi-agent live coordination, mission interruption drill) and the one
BLOCKED hardware line — each named above with its exact evidence, none
concealed.
