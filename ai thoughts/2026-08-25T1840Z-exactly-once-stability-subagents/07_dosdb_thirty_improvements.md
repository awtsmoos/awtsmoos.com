B"H
Boruch Hashem
Blessed is He

# Thirty DosDB and Collaboration Improvements

1. Add a tiny isolated map-root create/load regression.
2. Run it with default verified reuse.
3. Run it with reuse disabled.
4. Add repeated free/reuse churn before map creation.
5. Verify SmartPointer offset/length round trips at every root creation.
6. Verify newly written MAP magic before the pointer is published.
7. Distinguish new empty DB from existing unresolved root.
8. Add structured root-health state at open.
9. Fail closed on corrupt existing root.
10. Preserve original bytes and root seal on root failure.
11. Add explicit database verification details to AWDB failures.
12. Expose lock-busy separately from corruption.
13. Replace 250ms fixed mission lock wait with bounded policy backed by contention tests.
14. Add jitter/backoff only where replay is side-effect safe.
15. Make collection first initialization idempotent.
16. Protect concurrent collection creation with one stable path lock/transaction boundary.
17. Stop `load()` from converting storage failure into `null`.
18. Stop `all()` from converting storage failure into `[]`.
19. Add degraded/unknown collaboration state.
20. Make claims conservative when registry is unknown.
21. Preserve last-known membership evidence during storage failure.
22. Preserve unknown/fresh peer file caution during degraded mode.
23. Add 64-writer first-root race test.
24. Add 128-agent join/message/claim persistence test.
25. Add close/reopen durability test.
26. Add deliberate root-seal corruption test.
27. Add process-lock contention test.
28. Fix response compaction so grep/findFiles/AST primary results never disappear.
29. Add dedicated instruction packs for DosDB integrity and degraded collaboration.
30. Publish only after public reinstall plus long idle, mutation, collaboration, and browser-agent soak.
