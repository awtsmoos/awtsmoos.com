# B"H — Phase Two: Adversarial Critique

## Problems the first pass could still hide

1. A detached process group can outlive the agent unless startup cleanup proves ownership.
2. PID plus start time may still be unavailable or platform-specific; the abstraction must support explicit unknown identity rather than pretending certainty.
3. Persisting `desiredState=cancelled` before signaling creates a crash window where cancellation was requested but never delivered.
4. Persisting completion after child exit creates a second crash window where a finished command remains running.
5. A hard active cap can deny emergency cleanup if starts and controls share admission.
6. Whole-directory startup scans can overload the agent when thousands of retained jobs exist.
7. Atomic rename is not sufficient if directory durability matters; the reference file store must at least record this limitation.
8. Truncating a live output file can race concurrent readers and writers.
9. A process-group signal can accidentally target the agent if group identity is wrong.
10. Reusing an idempotency key with a different command must be rejected before process spawn.
11. Duplicate close and error events must not write incompatible terminal receipts.
12. Heartbeat writes can create unnecessary disk load across hundreds of commands.
13. Registry snapshots must be bounded, but active ownership itself must also be capped.
14. GC must never delete a nonterminal job only because its start time is old.
15. Store-byte pressure must evict terminal jobs first and return overload if only active jobs remain.
16. Status must not convert an unknown process into detached-running from PID liveness alone.
17. Cancellation must not claim success until cleanup has a receipt or an explicit pending state.
18. Output accounting must count bytes, not only JavaScript characters.
19. Wait loops must be bounded and should not create one timer per waiter indefinitely.
20. Startup reconciliation must be separately callable and idempotent.
21. Process-group behavior must be tested on Unix and safely degraded on Windows.
22. Command text and environment must be redacted or hashed in broad diagnostics.
23. The current active Map is global and can retain jobs if finalization throws before deletion.
24. Finalization needs `finally` cleanup for timers, heartbeat intervals, streams, registry, and active entries.
25. A command whose child emits an error and then close must finalize exactly once.
26. Output writes that fail must become visible in the terminal receipt.
27. Cancellation and timeout racing completion need deterministic precedence.
28. A command may spawn a daemon that deliberately escapes its process group; this is a known containment limit and must be disclosed.
29. Compatibility aliases must preserve requested action identity while lifecycle actions use canonical names internally.
30. A successful unit test does not prove relay responsiveness under many agents; an isolated full-agent harness is required.

## Revised requirements

- Add a terminal transition gate with compare-and-set semantics in-process and revision checks in metadata.
- Add an injectable process identity provider for real and synthetic PID-reuse tests.
- Separate start admission from control admission.
- Add a bounded startup-reconciliation batch and cursor.
- Replace whole-file count refreshes with maintained counters and filesystem stat fallback.
- Make finalization an idempotent state machine that always releases local resources.
- Record cleanup as `requested`, `term_sent`, `kill_sent`, `cleaned`, or `failed`.
- Treat unknown birth identity as unsafe for detached adoption or signaling.
- Keep command metadata compatible, but add schema version, revision, process group, birth token, idempotency, and cleanup fields.
- Run existing compatibility tests unchanged before adding new tests.

## Selected direction

Build an isolated command-core package first. Then integrate it into the repository command modules by rewriting complete files and splitting the current monolithic store into a small facade plus lifecycle, reconciliation, cancellation, and admission modules. Do not update the installed tunnel during this mission.
