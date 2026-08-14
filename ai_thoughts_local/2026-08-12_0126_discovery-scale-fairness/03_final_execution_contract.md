B"H

# Discovery Scale & Fairness — Final Execution Contract

Boruch Hashem — Blessed is He.

This third pass freezes the conditions under which discovery may gain a persistent derived index or a fair rotating anonymous feed window.

## Privacy and consistency gates

1. No public index record may contain owner user IDs, email, login/session data, private alias lists, or ownership metadata.
2. Public index maintenance must never read `/users/...` for discovery purposes.
3. Existing `/social/aliases` remains the source of truth for alias existence.
4. A derived index must be rebuildable from public alias names only.
5. Route-level index hooks are allowed only if create/delete return stable alias IDs.
6. Do not rewrite the 560-line alias helper to force lifecycle hooks.
7. If `_awtsmoos.alias.js` can remain <=120 after a whole-file rewrite, route-level hooks may be used there.
8. Alias update must not mutate index membership unless alias ID can actually change.
9. Alias delete index cleanup must be idempotent.
10. Stale index markers must be harmless and filtered during public enrichment.
11. Missing index markers must not make a valid alias unreachable forever; bounded fallback/reconciliation is required.
12. Request-time full-database migration is forbidden.
13. Reconciliation must be bounded and explicit.
14. Partial index coverage must be reported honestly in metadata.
15. No derived index becomes authoritative over actual alias storage.
16. If atomic multiwrite is unavailable, index failure handling must be fail-soft and recoverable.
17. Do not roll back a successful alias creation merely because a derived index write fails unless the current product already promises atomic secondary indexes.
18. Tests must simulate stale marker, missing marker, and failed secondary write behavior.

## Performance and fairness gates

19. Anonymous feed must not always select alphabetical page 1 when more than 50 aliases exist.
20. Fairness rotation must be deterministic for a time bucket so caching/debugging remain possible.
21. Explicit `aliasPage` from callers must remain reproducible.
22. Authenticated explicit alias scopes must remain unchanged.
23. Rotating anonymous feed aliases remain capped at 50.
24. People browse/search must preserve its existing public-only fields and coverage semantics.
25. If persistent index does not reduce namespace stat cost materially, do not add complexity merely for appearance.
26. Sharding is allowed only if lifecycle/reconciliation remain simple and testable.
27. No unbounded prefix bucket scan.
28. Alias-count reads may be used to compute rotating pages only if bounded route behavior remains deterministic.
29. Fairness logic must handle zero aliases and fewer-than-50 aliases.
30. Page wrap-around must not duplicate aliases within one feed window.
31. Time-bucket derivation must be pure and testable.
32. No cryptographic randomness or per-request instability is needed for fairness.

## Source-quality gates

33. Whole-file rewrites only.
34. Tabs in touched source.
35. B"H / Boruch Hashem / Blessed is He / Awtsmoos architectural comments on touched source.
36. Every authored source/style/test file <=120 lines.
37. Split focused helper modules instead of compressing logic.
38. No `innerHTML` or unsafe DOM changes if client behavior changes.
39. Preserve all current 49/49 global-discovery/Social Hub regressions unless a deliberate contract change is documented.
40. Add lifecycle/index/fairness tests before calling the batch complete.
41. Run CSS quality if client styles change; avoid unnecessary style changes otherwise.
42. Exhaustively reread every touched file after green tests.
43. Write planned-vs-actual audit.
44. No Git commit/push.
45. No canonical production Git/systemd/release mutation.
46. `npm run bh` remains a canonical_git_authority refusal proof, not a publication path.
47. Never claim the scale/fairness work is live unless production independently proves it.

## Hard decision gate

Fresh source audit must classify the batch as one of:

- `safe-persistent-index`: route lifecycle hooks and recovery are small, explicit, and testable;
- `fairness-only`: persistent index would require oversized/helper entanglement, but deterministic rotating anonymous pages are safe;
- `stop`: neither can be implemented without violating privacy, consistency, or source-budget rules.

The next step reads actual alias lifecycle routes, helper return envelopes, and DosDB batch/write semantics before any product source mutation.
