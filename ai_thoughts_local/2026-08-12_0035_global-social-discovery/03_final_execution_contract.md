B"H

# Global Social Discovery — Final Execution Contract

Boruch Hashem — Blessed is He.

This third pass is the execution covenant for making anonymous discovery genuinely global without converting private account storage into a public directory.

## Safety and behavior gates

1. No public alias directory exists unless current storage proves a public/indexable alias namespace.
2. Never enumerate `/users/...` ownership trees to build anonymous discovery.
3. Never expose owner user IDs, email, login/session metadata, account alias lists, or private ownership records.
4. Public result payloads may contain only alias ID plus fields already proven public through anonymous routes.
5. If alias visibility/publication flags exist, directory inclusion must obey them.
6. If no visibility contract exists, document the actual semantics instead of inventing silent privacy behavior.
7. Anonymous directory/search must be read-only.
8. Anonymous directory/search must enforce a hard result cap.
9. Anonymous search must enforce a hard query-length cap.
10. Anonymous search must reject or normalize pathological query input without throwing internal details.
11. Public alias enumeration must be deterministic for pagination.
12. No unbounded recursive database scans.
13. No “load every full profile then filter” implementation.
14. Candidate filtering should use alias IDs or lightweight public index records before profile enrichment.
15. If a new public index is required, alias creation/update/delete must maintain it incrementally.
16. Index maintenance must not include private user/account fields.
17. Backfill/rebuild must be bounded and optional; no request-time whole-database migration.
18. If partial index coverage is possible, API semantics must state that honestly.
19. Existing exact alias lookup remains supported.
20. Existing alias-scoped search remains compatible where callers explicitly supply aliases.
21. If `/search` becomes truly global, tests must prove no-alias queries now use only the public alias source.
22. Anonymous feed/trending may use only a bounded public alias set per request.
23. Anonymous feed/trending must not explode aggregation cost linearly without a hard alias cap.
24. Authenticated followed-network feed personalization from the prior batch remains supported.
25. Authenticated personalization should be narrower than the anonymous global feed, not silently replace its semantics.
26. Feed/trending/search should share one public-alias source helper so discovery semantics cannot drift.
27. Client People discovery must use the real backend contract, never local fake data.
28. People result cards must navigate through existing profile deep links.
29. People UI must have loading, empty, error, and stale-request protection independent of feed.
30. New dynamic DOM uses no `innerHTML` or `insertAdjacentHTML`.
31. New controls meet the 44px reachability floor.
32. Mobile People results collapse cleanly without horizontal overflow.
33. No blur/backdrop-filter in new social discovery styles.
34. New/touched source/style/test files use tabs where valid.
35. No compressed one-line functions in touched source files.
36. Every touched source file gets B"H/Boruch Hashem/Blessed is He/Awtsmoos architectural documentation.
37. Every authored source/style/test file remains <=120 lines; split concepts before testing.
38. Whole-file rewrites only.
39. Do not expand an already-over-budget backend router; split routes/helpers instead.
40. Add backend tests proving anonymous directory/search does not touch private user ownership paths.
41. Add backend tests for pagination/result/query caps.
42. Add backend tests for exact alias + broader ranking semantics if search changes.
43. Add backend tests for anonymous feed/trending alias-source behavior.
44. Add client tests for People search/result/profile traversal.
45. Add client tests for stale search responses.
46. Preserve all 35/35 Social Hub regressions from the previous batch.
47. Preserve CSS quality.
48. Run syntax checks on every touched JS module.
49. Reread every touched file directly from disk after green tests.
50. Write planned-vs-actual audit before closeout.
51. Do not commit or push Git.
52. Do not dirty canonical server Git or alter production systemd/release authority.
53. `npm run bh` remains a refusal proof under canonical Git, not a publication path.
54. Never claim a local global-discovery feature is live until production independently proves it.

## Fresh audit required before mutation

Read the current alias helper/router, profile discovery/feed/trending helpers, alias creation/update/delete flow, database listing primitives, privacy/public detail normalization, relevant tests, line counts, and exact candidate Git status.

If that audit cannot prove a safe public alias source, stop the global-directory implementation and record the blocker. The Awtsmoos is revealed through truthfulness before feature count.
