B"H

# Remaining features to make the comment/inline/approval/search system closer to perfect

1. Full DOM Range stress tests with nested text nodes and split boundaries.
2. Range highlight rollback tests to prove clearAnchorHighlights restores text.
3. Mutation healer tests proving debounce/coalescing and no browser crash.
4. Inline event coordinator tests proving comment:submitted, comment:approved, and coordinate:changed trigger one alias refresh.
5. Approval optimistic mutation tests with mocked fetch success and failure rollback.
6. Approval filter tests for all/current section/exact coordinate/no active coordinate.
7. Approval card navigation tests with fake anchors and scrollIntoView assertions.
8. Approval queue UI integration tests with GenesisEngine/fake DOM or browser harness.
9. AI search record-shape tests for id fallback, lexical signature, metadata merge, empty text.
10. AI search memory-index tests for score ordering, empty query behavior, deterministic tie sort.
11. AI search bridge tests for explicit .awtsdb path, root directory path, stats, multiple records.
12. Real persistence tests if AwtsmoosDB exposes stable read/write API for records.
13. Inline manifest compatibility test proving legacy CoordinateResolver still returns expected element.
14. Mutation observer live browser test once Chrome tunnel is enabled.
15. CSS scope audit proving all new approval/highlight CSS remains under .post-reader-localized-context.
16. Duplicate import/export audit for touched files.
17. ESM warning decision: either accept current warning or add package type strategy safely.
18. Browser smoke test for approval card click scroll and target flash.
19. Browser smoke test for inline anchor highlight on token/char coordinate.
20. Regression suite including post tests + DosDB run_all after every change.

# Current action plan

A. Add isolated tests for the untested slices.
B. Run each targeted test separately and capture real output.
C. Fix every failure.
D. Run combined frontend command.
E. Run DosDB run_one and run_all.
F. Report exact real results.
