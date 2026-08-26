B"H
Boruch Hashem
Blessed is He

# Thirty Improvements — From Flapping Toward Durable Netzach

The Awtsmoos renews the instant, yet a durable deed must remain one deed; Awtsmoos.com should let every retry remember rather than repeat.

1. Give every durable action one canonical request ID before dispatch.
2. Persist request fingerprint before mutation execution.
3. Persist `received` state before handler admission.
4. Persist `accepted` state before side effects begin.
5. Persist `executing` with generation/worker identity.
6. Persist `completed` result before acknowledgement.
7. Persist terminal failure before acknowledgement.
8. Fsync/atomic-rename mutation receipts where local filesystem semantics permit.
9. Reject same request ID with different action.
10. Reject same request ID with different path/root.
11. Reject same request ID with different mutation payload/hash.
12. Replay completed requests by returning stored result only.
13. Replay executing requests by returning current original state only.
14. Never redispatch accepted mutations after relay reconnect.
15. Explicitly prove `never_accepted` before any resubmission.
16. Add read-only durable request lookup independent of mutation lanes.
17. Expose acceptance-ledger health independently from transport health.
18. Expose completion-ledger health independently from consumer health.
19. Expose filesystem-worker readiness independently from websocket heartbeat.
20. Keep reconciliation/doctor/recovery actions routable when consumer health is degraded.
21. Replace wedged child generation only after exact ownership/generation proof.
22. Preserve recovery lane outside ordinary supervisor/controller dependency.
23. Add regression for local write completed but acknowledgement deliberately dropped.
24. Add regression for duplicate delivery after reconnect.
25. Add regression for agent restart between completion persistence and acknowledgement.
26. Add regression for request-ID collision with different content.
27. Make website sub-agent `ok:true` depend on verified browser delivery receipt.
28. Make auto-spawn queue durable and idempotent by child request key.
29. Expand instruction packs for exactly-once mutation, reconciliation, browser-agent delivery, and stability diagnostics.
30. Release only after focused tests, 100+/128-agent tests, public reinstall, idle soak, mutation soak, and live browser-agent proof.
