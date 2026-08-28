# B"H
# Tiferes Critique and Improvements

Boruch Hashem. Blessed is He.

Tiferes joins Chesed's reach with Gevurah's gate; on Awtsmoos.com each repair must be beautiful because it is exact, not because it is great. The following improvements convert a broad recovery instinct into a narrow evidence-driven path.

## Improvements

1. Separate transport, execution, mailbox, worker, queue, completion, and recovery health in every report.
2. Record the exact stalled outbox receipt age and generation before touching it.
3. Resolve deed ID, control request ID, transport receipt ID, and job ID independently.
4. Prefer p0 observation/control paths over shell work for recovery when available.
5. Treat an advertised-but-unroutable recovery action as a contract defect to investigate.
6. Inspect native device-state files rather than inferring mailbox contents from aggregate counters.
7. Compare the stalled receipt with canonical action history before acknowledgement.
8. Verify whether the terminal result was already delivered server-side.
9. Preserve an evidence export before any quarantine.
10. Require fresh preflight immediately before destructive mailbox mutation.
11. Veto parent repair when recent execution success is observed.
12. Veto parent repair when queue drain or control progress is observed.
13. Keep concurrent agent work out of this session's source scope unless directly implicated.
14. Use new planning files rather than modifying prior agents' planning artifacts.
15. Inspect prior mailbox-residency plans for historical decisions and known failure modes.
16. Read whole source modules for child outbox settlement before any rewrite.
17. Trace direct callers of settlement policy/pulse modules.
18. Locate tests that exercise outbox acknowledgement and quarantine.
19. Add a regression test for one stale terminal outbox item that must self-heal without restart.
20. Add a regression test proving accepted mutation is never blindly redispatched.
21. Add a contract test that every advertised recovery action is actually routable.
22. Add a fairness test that mailbox observation bypasses bulk work.
23. Add telemetry assertions for reserved/dispatched/accepted/running/terminal timestamps.
24. Verify command-start receipt latency independently from command completion.
25. Verify recovery does not require generation replacement.
26. Verify quarantine uses exact generation and exact receipt target.
27. Verify evidence export contains enough identity to reconstruct custody later.
28. Re-read every rewritten file after mutation and compare planned versus actual behavior.
29. Run focused tests before broad suites to avoid drowning signal in concurrent project churn.
30. Only consider deployment after source tests, live mailbox health, and release parity agree.

## Critical self-critique

The repository is highly active. A large “cleanup” would be reckless. The current mission must remain narrow: reveal the stalled mailbox item, recover it safely, and repair only the direct source contract if the live evidence proves a defect. All unrelated dirty work is protected scope, not technical debt for this session to erase.
