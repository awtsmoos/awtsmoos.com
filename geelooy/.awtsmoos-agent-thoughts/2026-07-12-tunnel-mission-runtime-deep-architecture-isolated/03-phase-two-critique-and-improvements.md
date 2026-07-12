# B"H — Phase Two Critique and Improvements

## Attack on the first pass

The hybrid preference is promising but still too abstract. It risks recreating a distributed system inside one repository without specifying storage semantics, exact crash boundaries, compatibility ownership, clock rules, queue admission, and proof obligations. The following improvements must be incorporated before implementation.

## Thirty improvements

1. Define one canonical identity schema with mandatory, optional, and forbidden field combinations.
2. Separate `operationId` from caller-supplied `controlRequestId` so internal durable identity survives adapter mistakes.
3. Require a normalized request hash for every idempotent mutation.
4. Store the first accepted canonical envelope immutably.
5. Reject same idempotency key with a different canonical payload as a typed conflict.
6. Define exactly which late responses are accepted after disconnect and which are quarantined.
7. Make connection epoch comparison explicit and independently testable.
8. Use monotonic durations for deadlines while persisting wall-clock timestamps for audit.
9. Bound every registry by count, bytes, age, or all three.
10. Define eviction behavior for pending, completed, quarantined, and replay records.
11. Never evict an active operation without persisting an orphan or expired terminal receipt.
12. Separate transport liveness from operation liveness.
13. Separate process liveness from job completion truth.
14. Persist intent before any external side effect.
15. Persist a completion receipt before releasing claims or scheduling dependents.
16. Define the exact duplicate-frame policy for non-final and final frames.
17. Make stream acknowledgment explicit; do not infer it from UI rendering.
18. Add per-connection and per-tunnel byte budgets, not only request counts.
19. Reserve P0/P1 queue capacity so overload cannot block Stop or Status.
20. Add weighted aging so lower lanes do not starve forever.
21. Define cancellation as desired state plus runtime acknowledgment, not one boolean.
22. Add a cleanup deadline and escalation path for every cancellable resource.
23. Make all resource cleanup idempotent and receipt-producing.
24. Model mission claims as compare-and-swap revisions with heartbeat and expiration.
25. Prevent claim renewal after a newer owner has acquired the resource.
26. Persist agent checkpoints before releasing a turn lease.
27. Distinguish logical agent identity from replaceable execution session.
28. Define restart recovery for agents whose session vanished mid-action.
29. Keep network and model calls outside mission-store transactions.
30. Add a per-root concurrency governor above mission and job schedulers.
31. Add provider-specific rate limits independent of root caps.
32. Require process birth identity beyond PID before signaling or reconciling.
33. Store command output in bounded chunks with total byte counters and truncation markers.
34. Record process-group identity and descendant-cleanup results.
35. Make browser lease scope explicit: browser, context, target, or CDP session.
36. Prohibit implicit active-target mutation in the next runtime.
37. Use one CDP session per leased target for parallel work.
38. Add browser context cleanup deadlines and cookie/storage isolation tests.
39. Make frontend state queryable from backend snapshots after reconnect.
40. Require dry-run mutation previews to include affected entities and policy precedence.
41. Return per-entity receipts for fleet mutations.
42. Store an immutable event timeline separate from current materialized state.
43. Redact secrets at event creation, not only at rendering.
44. Add schema version and compatibility version to every persisted record.
45. Define migration as dual-read or shadow-read before any dual-write.
46. Avoid dual-write until deterministic reconciliation exists.
47. Make rollback possible without consuming new-only state.
48. Require old clients to receive typed unsupported-field responses rather than silent drops.
49. Add a deterministic fake clock for unit and leak tests.
50. Add a deterministic fault injector for storage, transport, and process boundaries.
51. Make cross-process tests use separate stores and ports.
52. Ensure soak tests report memory, handles, timers, listeners, child processes, and latency percentiles.
53. Treat missing metrics as a failed readiness criterion.
54. Add a formal completion matrix mapping every user requirement to evidence.
55. Keep the initial code surface smaller than the full architecture: protocol, operation coordinator, keyed scheduler, mission graph core, resource ledger, and tests.

## Revised staged scope

### Stage 0 — Evidence and contracts

Read real code, map call paths, publish schemas, and build deterministic tests against pure modules.

### Stage 1 — Isolated reference runtime

Implement memory-backed stores and pure coordinators under `next-runtime`. No live adapters.

### Stage 2 — Cross-process reference

Use isolated worker processes and temporary JSON or SQLite stores. Prove reconnect, crash, stale response, and reconciliation behavior.

### Stage 3 — Shadow adapters

Read legacy traffic and compare decisions without answering live users. This stage is only a proposal until the isolated evidence is strong.

### Stage 4 — Canary and rollback

Not authorized in this mission. Requires explicit review and all readiness gates.

## Revised core principle

The next runtime should not promise exactly-once side effects. It should provide durable, idempotent, at-least-once orchestration with exactly-once acceptance of a canonical operation identity and deterministic duplicate handling.
