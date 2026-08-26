B"H
Boruch Hashem
Blessed is He

# Thirty Improvements Before Source Mutation

The Awtsmoos hides danger inside convenient abstractions; Awtsmoos.com therefore critiques the repair until parent residency, exactly-once safety, and observability all rhyme.

1. Keep mailbox emergency actions parent-resident explicitly, never by accidental module-cache coincidence.
2. Name the action set for live-process ownership, not merely priority.
3. Include status, export, reconcile, and quarantine together so no recovery path silently crosses the executor.
4. Preserve ordinary read/write executor isolation.
5. Preserve live-history compact routing behavior.
6. Preserve website mission and socket-owned action routing.
7. Test `requiresExecutor` directly for every mailbox action.
8. Test at least one ordinary filesystem action remains executor-owned.
9. Test controller mailbox registration and public status in one process.
10. Ensure registry tests reset module-global state between cases.
11. Avoid leaking mailbox request payloads in new telemetry.
12. Record only counts, IDs where already public-safe, phase/reason, timestamps, and semantic outcome.
13. Distinguish periodic recovery from explicit user-triggered reconcile.
14. Record last recovery attempt even when no stale custody required action.
15. Record last successful quarantine/reconciliation separately from last attempted scan.
16. Preserve the existing 2-second periodic cadence unless measurement proves it harmful.
17. Do not shorten the 30-second exact custody lease merely for faster dashboards.
18. Keep result-waiting-for-ack preservation semantics untouched.
19. Keep missing-exact-id escalation semantics untouched.
20. Keep exact pre-result quarantine as the only automatic retirement path.
21. Never redispatch an accepted mutation from the recovery code.
22. Make replacement scheduling remain a last resort after semantic ambiguity.
23. Surface whether a native-generation replacement was requested by semantic recovery.
24. Keep telemetry memory-only; no new high-frequency disk writes.
25. Keep telemetry bounded to one latest result plus small counters, not unbounded history.
26. Verify process-owned action routing does not accidentally make heavy actions run on the event loop.
27. Run event-loop lag/queue tests after the change.
28. Verify public mailbox actions remain P0 in the outer priority classification.
29. Verify installed live `connectionMailboxStatus` returns the same mailbox counts visible in connection health after deployment.
30. Soak long enough to cross lease expiry and prove stale custody resolves without a process restart.

The strongest repair is the smallest truthful one: move the recovery door back beside the living mailbox, then make its deeds visible enough that silence can never masquerade as healing.
