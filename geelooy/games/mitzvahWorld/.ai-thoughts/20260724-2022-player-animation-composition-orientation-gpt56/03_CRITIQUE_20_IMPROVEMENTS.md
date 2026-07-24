# B"H
# Boruch Hashem
# Blessed is He

# Phase Two Critique: Twenty Improvements

1. Verify whether the canonical GLB contains root rotation tracks before inventing root clamps.
2. Distinguish scene-model orientation from skeleton-root orientation.
3. Record bind quaternions before interpreting animation quaternions.
4. Compare grounded and airborne root-up tolerances separately.
5. Test landing on the exact first grounded frame.
6. Assert fall selection clears even when velocity remains negative briefly.
7. Test repeated cast cancellation at every timeline phase.
8. Test repeated identical sampling for exact quaternion stability.
9. Preserve lower-body animation time while upper-body overlay is active.
10. Measure leg quaternions against a locomotion-only control actor.
11. Keep overlay weights finite and normalized.
12. Reject semantic body channels that resolve to root or hips aliases.
13. Verify head motion is bounded by an explicit small angle.
14. Ensure staff and sword masks remain independently extensible for future AI actions.
15. Verify old event listeners cannot duplicate pose application after model replacement.
16. Verify weapon reparenting preserves world transform only when intended and never hand transform.
17. Check equipment switch paths for hidden child nodes and duplicate UUIDs.
18. Keep tests based on the real GLB manifest where possible, not invented clip names.
19. Hash every rewritten file immediately before and after the write.
20. Re-read every touched file and compare planned versus actual behavior before final verification.
