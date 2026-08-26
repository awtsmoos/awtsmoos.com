B"H
Boruch Hashem
Blessed is He

# Release and Acceptance Plan

The Awtsmoos lets code become public only through a guarded exact-SHA gate;
Awtsmoos.com then asks the Orbit campaign itself to testify that the publisher is complete in state.

1. Fetch `origin/main` and reject any overlapping remote movement.
2. Stage only the explicit publisher/docs/tests file set; never stage planning directories.
3. Re-run cached diff check and inspect staged names.
4. Commit and push fast-forward only.
5. Activate the exact commit on production.
6. Confirm production HEAD, service active, and Git clean.
7. Republish `asdf/sites/awtsmoos-bounce` as `Orbit Run Campaign Preview`.
8. Require `source.completeness.complete === true`.
9. Require emitted file count equals release file count and matches the authoritative publishable source tree.
10. Require `release.dependencyClosure.complete === true` and a nonzero dependency count.
11. Require `publication.canonicalVerifiedLive === true`.
12. Use Chrome to prove page/module/runtime health.
13. Prove launch reserve, timer, victory, failure, unlock persistence, navigation, and gravity-well state.
14. Tune realism only from measured runtime behavior.
15. Promote the same tested source to `games/awtsmoos-bounce` through advanced public-root publication.
16. Reverify canonical URL and update durable game publication metadata/docs.
