# B"H — Phase Two Adversarial Critique

## Problems in the first preference

A durable ledger and worker process are not enough unless the lifecycle is precisely bounded. The design must define exact crash boundaries, process identity, output semantics, queue fairness, retention, and recovery behavior.

## Improvements required

1. Separate caller request ID from internal immutable command operation ID.
2. Persist a normalized command hash and canonical cwd.
3. Persist idempotency acceptance before any spawn attempt.
4. Coalesce the same key and hash across multiple callers.
5. Reject the same key with a different command hash.
6. Record spawn intent, spawn attempt, and spawn receipt separately.
7. Use PID plus process start token or birth timestamp.
8. Create a process group before executing user work.
9. Signal only a process group whose birth identity still matches.
10. Record TERM request, grace deadline, KILL escalation, and cleanup result.
11. Treat natural exit during cancellation as a compatible terminal receipt.
12. Make terminal transitions revisioned and immutable.
13. Coalesce identical duplicate terminal receipts.
14. Quarantine incompatible second terminal receipts.
15. Limit concurrent commands per tunnel, root, mission, and agent.
16. Reserve capacity for status, cancel, and emergency cleanup.
17. Bound queued commands independently from running commands.
18. Bound stdout and stderr independently by bytes.
19. Preserve total byte counts and explicit truncation markers.
20. Page output from immutable chunk offsets or stable files.
21. Never read entire output files merely to answer status.
22. Bound completed-job retention by age, count, and aggregate bytes.
23. Never evict a running or cancelling record.
24. Mark retention eviction with an auditable tombstone or terminal summary.
25. Reconcile stale running records at startup.
26. Distinguish missing worker, missing process, identity mismatch, and unknown liveness.
27. Remove process-local registry entries after every terminal path.
28. Own all timeouts in a resource ledger.
29. Use monotonic elapsed time for in-process deadlines.
30. Persist wall-clock timestamps only for audit and restart recovery.
31. Inject failures before and after every persist and spawn boundary.
32. Test parent crash after spawn and before receipt.
33. Test worker crash before child spawn, after spawn, and after exit.
34. Test output writer failure and disk-full behavior.
35. Test thousands of old completed jobs and prove bounded startup time.
36. Test many callers polling one job without registry or timer growth.
37. Test hundreds of agents with per-owner fairness.
38. Expose queue, running, retained, output-byte, and orphan metrics.
39. Redact secrets and environment values before persistence.
40. Keep compatibility adapters outside the native core.

## Revised selection

Build an isolated command kernel with:

- canonical operation acceptance;
- memory and atomic-file ledger implementations;
- owner-aware bounded admission;
- worker supervisor abstraction;
- process birth identity abstraction;
- process-group cancellation contract;
- bounded output metadata;
- retention and reconciliation services;
- deterministic fake-process tests;
- real child-process tests in temporary directories.

The first implementation must not register live actions.
