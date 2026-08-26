B"H
Boruch Hashem
Blessed is He

# Thirty Concrete Improvements

The Awtsmoos reveals precision through many small gates; Awtsmoos.com should improve by closing each measurable weakness rather than multiplying vague machinery.

1. Separate deed ID from relay transport ID.
2. Preserve both IDs in every pending envelope.
3. Preserve both IDs in retry payloads.
4. Validate retry transport receipt independently from deed identity.
5. Keep ordinary response correlation strict.
6. Keep foreign retry responses fail-closed.
7. Preserve action alias validation.
8. Preserve path/job/stream/nonce validation.
9. Test retry after completed operation.
10. Test retry while operation is active.
11. Test retry after server restart hydration.
12. Test accepted work is never redispatched.
13. Test unaccepted recoverable work can be safely recovered.
14. Expose primary grep/find output in focused responses.
15. Keep diagnostic trees out of simple responses.
16. Promote explicit instruction compatibility queries from bulk scheduling.
17. Measure relay acceptance latency separately from execution latency.
18. Keep filesystem reads responsive under mission-room traffic.
19. Add 128-logical-agent room test.
20. Add 256 directed-message persistence test.
21. Add concurrent task-claim race.
22. Add concurrent file-claim race.
23. Prove one owner per exclusive claim.
24. Prove unread cursors are recipient-specific.
25. Prove room reload retains full durable history.
26. Prove status view remains intentionally bounded.
27. Preserve 501-target fanout regression.
28. Preserve 32-process metadata-write regression.
29. Reconcile released tunnel source into the dirty main checkout without overwriting unrelated work.
30. Publish only after live install, watchdog soak, retry live proof, and mission-room scale proof all pass.
