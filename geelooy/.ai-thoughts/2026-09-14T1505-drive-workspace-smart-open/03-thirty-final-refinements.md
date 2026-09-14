<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Phase Three — Thirty Final Refinements

1. Re-read transport and resource base before source writes.
2. Re-read current host bridge/index wiring before source writes.
3. Work only on canonical `main`.
4. Create no branch or worktree.
5. Preserve the three intentionally uncommitted runtime-state artifacts.
6. Rewrite every modified source file whole.
7. Use new modules rather than pushing files over 119 lines.
8. Exact `//B"H`, `//Boruch Hashem`, `//Blessed be He` headers on touched JS/tests.
9. Tabs for indentation.
10. Full JSDoc for each exported function/class.
11. Keep comments poetic but code practical.
12. Do not add JSON parsing/serialization for the new bridge.
13. Do not add a new backend endpoint.
14. Do not hand-edit generated artifacts.
15. Keep the existing channel/version, additive command only.
16. Validate source/origin before payload normalization.
17. Normalize again at host boundary even if child normalized first.
18. Bound metadata and bytes on both sides.
19. Transfer no credentials, tokens, alias auth headers, or account identifiers.
20. Do not route Drive path to VFS.
21. Derive base path locally from Drive logical path only for window context.
22. Preserve filename/extension for descriptor classification.
23. Supply MIME as inert raw metadata only if useful; file kind authority stays existing classifier/artifact detector.
24. Never auto-open an external public link after an authenticated content failure.
25. Maintain current folder/link actions exactly.
26. Add focused tests for oversize rejection and malformed buffer.
27. Add focused test proving unsupported commands remain rejected.
28. Run existing Drive workspace bridge tests unchanged even though legacy file exceeds 120 lines.
29. Re-read every touched/new file after tests and compare plan vs actual.
30. Commit only smart-open code/plans on `main`; push only after remote freshness is reconciled without force.
