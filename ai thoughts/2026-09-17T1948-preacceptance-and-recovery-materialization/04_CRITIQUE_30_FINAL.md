<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Thirty Final Recovery Checks

1. Heartbeat health is never accepted as command-acceptance health.
2. Pre-acceptance recovery starts before the terminal relay deadline.
3. Original control request identity survives reconnect.
4. Original client request identity survives reconnect.
5. Original nonce survives reconciliation.
6. Same Tunnel identity re-registers.
7. Same device ownership remains authoritative.
8. Connection generation may change safely.
9. Ambiguously accepted mutations are never blind-replayed.
10. Read-only reconciliation remains idempotent.
11. Route fencing prevents dual active sockets from receiving the same work.
12. Late native success is reconciled instead of contradicting a terminal relay result.
13. Recovery state is visible in receipts.
14. Acceptance timeout remains a final fallback, not the first recovery trigger.
15. Existing post-acceptance custody recovery remains intact.
16. Recovery-lane activation failure cannot return full installer success.
17. HTTP lane is materially verified.
18. Unix-socket lane is materially verified.
19. File-trigger lane is materially verified.
20. Guardian lane is materially verified.
21. Launchd and portable fallback report equivalent protection state.
22. Recovery lane labels stay outside the primary service family.
23. Healthy incumbent remains recoverable if candidate protection fails.
24. Installer output states incomplete recovery truthfully.
25. Rescue remains available throughout primary rollout.
26. Protected staged blobs remain byte-identical.
27. Concurrent dirty Tunnel files remain untouched.
28. Clean-source release tests include acceptance and installer failure injection.
29. Primary is deliberately faulted before rescue upgrades.
30. Browser continuation acceptance runs only after native acceptance/recovery is proven stable.
