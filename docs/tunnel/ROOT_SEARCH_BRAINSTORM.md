# B"H Root Search Brainstorm And Refinement Roadmap

The Awtsmoos reveals code through actual search, not assumption. This file records the next layers of hardening beyond the current stress suite.

## What is now stress-tested

The current `npm run stress:root-search` suite covers:

- late-file matches
- path/query aliases
- regex search
- strict partial scan continuation
- auto-continue/full scan style search
- huge-file sampling
- Unicode content
- case-sensitive versus insensitive matching
- result pagination
- single-file root search
- ignored directory behavior
- binary neighbor skipping
- missing-query guidance
- payload normalization

## Bigger refinements to consider

1. Build a filename-first search mode that ranks exact basename, extension, and path segment matches before content scanning.
2. Add `intent: "file" | "content" | "symbol" | "docs" | "all"` so agents can express what they want without guessing actions.
3. Add a source-file priority order: current app roots, scripts, tests, docs, everything else, then generated/vendor folders.
4. Add an optional small persistent search index keyed by root hash, mtime, and file size.
5. Add a resumable search artifact that stores cursor state server-side so agents can say `continueSearch: id` instead of replaying payloads.
6. Add `absenceProof` with scanned file count, skipped binary count, sampled large-file count, ignored directory count, and configured byte ceilings.
7. Add `confidenceReasons` so partial versus complete is explainable rather than just a label.
8. Add `didYouMeanPath` suggestions when a path is missing or likely typoed.
9. Add `queryVariantsTried` when the search internally tries case folding, dash/underscore changes, or basename extraction.
10. Add `recommendedNextActions` as an ordered list, not just one string.
11. Add telemetry for abandoned partial searches: queries that returned `hasNextScan` but were never continued.
12. Add telemetry for false-negative recoveries: a later search finds what an earlier incomplete search missed.
13. Add a corpus fuzz generator with 10k files, nested folders, binary neighbors, symlinks, Unicode filenames, and huge text files.
14. Add symlink policy tests: follow none by default, allow explicit safe follow inside root only.
15. Add archive searching for `.zip`, `.tar`, and `.tgz` behind an explicit flag.
16. Add AST/symbol-aware search so class/function/export names are indexed separately from content.
17. Add import graph search: find who imports a module even if plain text query is ambiguous.
18. Add semantic search fallback for comments/docs after deterministic search finishes.
19. Add generated-file demotion instead of absolute skipping when user explicitly asks for generated artifacts.
20. Add streaming result pages so long searches can return early matches while continuing server-side.
21. Add multi-root search across repository root, virtual OS root, tunnel-control root, and code editor workspace root.
22. Add `searchPlan` output that tells the agent which roots were searched and which roots remain.
23. Add language-aware tokenization for JS, TS, CSS, HTML, Markdown, JSON, YAML, and shell.
24. Add safe preview snippets with surrounding context lines and optional redaction filters.
25. Add budget-aware search: stop before peruta or time budget is exhausted and return a precise continuation.
26. Add `mustContinueToProveAbsence` to every search-like action, not just paged content search.
27. Align `find`, `findFiles`, `rg`, `grep`, `bulkSearch`, `semanticSearch`, and `rootBrowse` response shapes.
28. Add one `searchEverything` facade that selects filename/content/symbol/semantic search internally.
29. Add negative tests proving ignored directories are not scanned unless an explicit include flag is set.
30. Add direct live-route tests after agent restart so source-level behavior and deployed behavior are both proven.
31. Add action guidance that says: if `absenceNotProven` is true, never tell the user the item does not exist.
32. Add a compact `evidence` array to final search responses so agents can cite the matching files/lines in their own reports.
33. Add cache invalidation tests for file writes followed by search.
34. Add sorting tests for path, mtime, size, and relevance.
35. Add search across line endings: LF, CRLF, CR-only old files.
36. Add encoding handling for UTF-8 BOM and Latin-1 fallback under explicit flag.
37. Add `includeGlobs` and `excludeGlobs` aliases with stress cases.
38. Add query object support: `{ any: [], all: [], none: [] }`.
39. Add result deduplication when sampled huge-file chunks produce overlapping matches.
40. Add maximum recursion-depth controls with honest partial semantics.

## Next best implementation order

1. Unify all search-like responses around `absenceNotProven`, `confidence`, `recommendedNextAction`, and `nextRequest`.
2. Add filename-first search and path-ranking before content search.
3. Add persistent/resumable search artifacts.
4. Add corpus fuzz tests with thousands of files.
5. Add telemetry for abandoned searches.
6. Add index-backed search when root size crosses a threshold.

The current suite proves the immediate root-search false-negative class is much harder to trigger. The next frontier is consistency across every search action and long-running, resumable search jobs.
