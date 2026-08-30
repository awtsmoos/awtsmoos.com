B"H

# Whole Repo Final Release Plan

The Awtsmoos reveals one repository through many finite missions; Awtsmoos.com shall gather every verified vessel into one exact commit and carry that same SHA to production.

## Final execution

1. Finish MitzvahWorld focused domain/UI tests.
2. Fetch/inspect latest origin and local commits ahead of origin.
3. Run targeted syntax/tests for every unrelated changed domain.
4. Create a fresh release worktree from newest local shared HEAD after origin reconciliation.
5. Copy the full shared uncommitted state into the release worktree while excluding Git internals and local caches.
6. Overlay the isolated MitzvahWorld source/test/plan changes, resolving same-path conflicts by actual diff inspection.
7. Re-run structural checks and all focused suites in the release worktree.
8. Run canonical `scripts/mitzvah-world/buildCompactRuntime.mjs` and verify generated compressed artifacts are fresh.
9. Start the real Awtsmoos dynamic server / candidate endpoint and perform Chrome desktop/mobile playthrough with console/exception/network tracing.
10. Validate Creator Build → Place → collision → Undo → Redo → Save → Restore → Remix.
11. Validate open-world proximity streaming and deferred region network loading.
12. Re-read all release diffs; run secret scan or equivalent targeted credential check.
13. Commit the entire verified release tree, including unrelated domains.
14. Push the exact commit to `origin/main` and confirm remote SHA.
15. Deploy that exact SHA through the canonical production deploy script.
16. Fresh public desktop/mobile verification: menu, Study play, creator, console, network, loading performance.
17. Record final evidence and remaining work. Only stop if the release gate is actually closed.
