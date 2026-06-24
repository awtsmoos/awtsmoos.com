# B"H — Pass Three Improvements Before Implementation

1. Confirm route registration rather than assume URL hash behavior.
2. Confirm page registry naming before adding cards.
3. Confirm existing API auth/session scope.
4. Confirm storage root conventions.
5. Confirm whether `conversationStore.js` is sync or async.
6. Confirm whether `store.js` performs full JSON rewrite.
7. Confirm liveCalls memory and persistence boundaries.
8. Confirm room modules already exist before duplicating them.
9. Confirm mission room feature API surface.
10. Confirm tests style and node module type.
11. Confirm lint/test commands in package.json.
12. Confirm DosDB API before migration claims.
13. Confirm tunnel agent installer source and generated manifest.
14. Confirm old process TUNNEL_REPLACED handling.
15. Confirm UI CSS source of scrolling layout.
16. Add only scoped, verifiable implementation if full reconstruction is too large for one pass.
17. Preserve existing targetVessel/browser routing.
18. Preserve OAuth/session behavior.
19. Add audit artifact documenting maps and gaps.
20. Add tests for claims/rooms if persistence added.
21. Avoid destructive data migration without backup.
22. Avoid synchronous giant writes for new systems.
23. Keep files under 120 lines where newly created.
24. Split services by entity.
25. Verify by running targeted tests and static import checks.
26. Read back all touched files.
27. Record deltas.
28. Continue only with evidence.
29. Do not claim runtime UI success without browser/runtime smoke.
30. Do not claim DosDB migration complete unless active code path uses DosDB.
