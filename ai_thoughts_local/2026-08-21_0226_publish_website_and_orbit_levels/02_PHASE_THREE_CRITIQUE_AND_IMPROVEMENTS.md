B"H
Boruch Hashem
Blessed is He

# Phase Three — Critique, Improvements, and Completion Gate

The Awtsmoos renews every critique before confidence can harden into stone;
Awtsmoos.com should prove the path, the level, the score, and the URL as known.

## Thirty improvements over the naive plan

1. Use `publishWebsite` as the normal action name.
2. Keep `publicRootPublishFolder` internal/advanced instead of deleting it.
3. Namespace default websites under `web/{alias}/{slug}`.
4. Derive slug from basename when `name` is absent.
5. Normalize Unicode display names separately from ASCII URL slugs.
6. Reject empty/hidden/reserved names.
7. Never accept a caller-selected verification origin.
8. Verify after atomic promotion while backup still exists.
9. Roll back on verification failure.
10. Lock per destination.
11. Retire stale locks.
12. Hash every source file.
13. Hash every staged file.
14. Hash every non-HTML public asset after publication.
15. Verify HTML title identity despite server HTML injection.
16. Repair array-style Virtual-OS directory traversal.
17. Exclude private metadata recursively.
18. Keep Drive/Sites semantics separate.
19. Remove stale `/sites` draft candidate decoration.
20. Make docs examples use one simple source path + optional name.
21. Make level definitions pure data.
22. Keep physics engine reusable across all levels.
23. Track shots separately from bounces.
24. Make victory criteria explicit and testable.
25. Make failure criteria explicit and visible.
26. Persist unlocks and medals without requiring an account backend.
27. Ensure first level teaches the loop rather than overwhelming the player.
28. Escalate one major mechanic at a time.
29. Make medal thresholds reward mastery rather than gate progress.
30. Republish the upgraded game through `publishWebsite` as the publisher acceptance test.

## Completion gate

Publisher complete only when:

- any owned Virtual-OS subfolder with `index.html` publishes via one `publishWebsite` call;
- default name/path derivation is deterministic;
- overwrite is atomic and rollback is tested;
- docs and machine catalog expose the friendly action;
- stale `/sites` candidate is removed;
- deployed production action republishes a test site successfully;
- final URL is externally verified.

Game complete only when:

- campaign has multiple progressively harder levels;
- each level has visible goals and a real win/fail condition;
- progress unlocks and persists;
- medals/stars provide mastery goals;
- gameplay and UI work in a real browser;
- upgraded release is published and verified through the new friendly publisher.
