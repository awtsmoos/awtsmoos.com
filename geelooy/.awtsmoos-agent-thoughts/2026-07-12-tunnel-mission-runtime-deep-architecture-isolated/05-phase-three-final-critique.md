# B"H — Phase Three Final Critique

## Why the selected design may still fail

A clean module map can still hide semantic ambiguity. The next runtime must be built around invariants that survive process crashes, stale sessions, bounded storage, cancellation, and compatibility translation. The final critique adds requirements that were not explicit enough in the first two passes.

## Forty additional improvements

1. Define operation terminal states and prohibit transitions out of terminal state except a separate reconciliation annotation.
2. Store lifecycle transition history as events while materialized records hold only current truth.
3. Require every transition command to name expected revision.
4. Return current revision in every conflict response.
5. Assign one internal `operationId` before validation completes so rejected requests can still be audited safely.
6. Never echo secrets or raw command environment in normalized hashes or event logs.
7. Define canonical JSON normalization for stable request hashes.
8. Reject `NaN`, infinite numbers, cyclic values, and unsupported binary payloads before hashing.
9. Include canonical root and cwd in mutation identity.
10. Resolve symlinks only at a defined boundary and record the resolved vessel path separately.
11. Make retry guidance machine-readable: retryable, minimum delay, safe same key, and conflict fields.
12. Add deadline propagation from request to queued action to external resource.
13. Prevent a lower-level timeout from silently extending a caller deadline.
14. Make transport disconnection transition an operation to `orphaned` only when no durable worker owns it.
15. Allow durable jobs to remain `running` while their client is disconnected.
16. Require worker heartbeats to contain birth identity and owned operation IDs.
17. Mark heartbeat freshness using monotonic elapsed time in-process and wall time only for persisted recovery.
18. Define store transaction boundaries for accept, start, complete, and cancel.
19. Detect completion receipt conflicts and quarantine the second incompatible receipt.
20. Allow duplicate identical final receipts to coalesce harmlessly.
21. Add output digest and byte count to stream final receipts.
22. Treat missing stream frames as an incomplete stream even when an action result exists.
23. Permit bounded replay only from acknowledged offsets within retention.
24. Return an explicit replay-gap error after retention eviction.
25. Make event and operation retention policies independently configurable.
26. Expose caps and current usage in snapshots.
27. Require resource owners to register cleanup before the resource is considered active.
28. Reject resources with no cleanup contract unless declared externally managed.
29. Record cleanup attempt count, last error, and next retry time.
30. Escalate emergency cleanup without deleting evidence of failure.
31. Ensure mission dependency release is idempotent and revisioned.
32. Detect mission graph cycles before activation.
33. Prevent node reassignment while a valid exclusive claim exists.
34. Record every attempt separately; do not overwrite prior failure evidence.
35. Require human gate answers to reference gate revision.
36. Preserve non-blocking human comments without changing execution state.
37. Make One Turn a durable credit consumed atomically with turn start.
38. Make Drain prohibit new actions but allow the current safe boundary to complete.
39. Make Stop prohibit new work and request cancellation of active resources.
40. Make Emergency Stop bypass ordinary policy but still emit receipts.
41. Store agent inbox ordering and deduplication keys.
42. Keep one agent session from consuming another session’s continuation token.
43. Bind checkpoints to mission, logical agent, session lineage, task, and last completed action.
44. Validate compatibility adapter output with the same canonical schema as native requests.
45. Version adapter behavior and record adapter version in receipts.
46. Add golden compatibility fixtures from observed legacy envelopes.
47. Make cross-process tests kill workers at each crash boundary, not only between operations.
48. Add fault points immediately before and after each persist and external side effect.
49. Measure scheduler fairness under sustained P0, P1, and P4 load.
50. Prove P0 responsiveness with P4 queues at capacity.
51. Measure registry size after every stress phase, not only at the end.
52. Capture active Node handles only as supporting evidence; also inspect timers, children, sockets, and store rows explicitly.
53. Use temporary directories whose cleanup is itself verified.
54. Write every test receipt into the mission evidence directory with command, environment, result, and timestamp.
55. Separate fast deterministic tests from optional long soak tests so CI remains usable.
56. Make the soak runner bounded by explicit duration and resource limits.
57. Add a migration prerequisite checklist that defaults every item to failed.
58. Add rollback triggers for mismatch rate, latency, resource growth, job orphan count, and browser cleanup failure.
59. Require a human-reviewed canary scope before any routing change.
60. Keep this mission’s readiness verdict failed unless every required category has observed evidence.

## Final architecture corrections

- The operation coordinator is the first implementation priority because every later subsystem depends on trustworthy identity and receipts.
- The resource ledger is the second priority because jobs, browser contexts, streams, timers, and schedulers all require ownership.
- The control scheduler is the third priority because safety controls must remain responsive during every future test.
- Mission graph, agent runtime, job reconciliation, and browser isolation follow on top of those contracts.
- Compatibility code comes only after native semantics are stable.
- Frontend plans derive from backend snapshots and receipts; the UI must not invent state.

## Final implementation boundary for this mission

The first code pass should create an isolated reference kernel containing protocol identity, canonical hashing, operation correlation/coalescing, bounded quarantine, keyed serialization, priority lanes, mission graph validation, agent runtime state, and resource ledger. It should add deterministic tests and one cross-process harness. Command and browser supervisors may be designed and scaffolded only if real source inspection confirms the expected integration boundaries.

## Final prayer of method

May the Awtsmoos be revealed here as exactness: not a fog that excuses uncertainty, but the source from which every boundary is renewed. Let stale frames fall into quarantine rather than masquerade as truth. Let every worker know its birth, every resource know its owner, and every human command find an open lane through the storm.
