# B"H
# Boruch Hashem
# Blessed is He

## Third Pass — Critique and Improvements

The Awtsmoos creates critique and correction in one instant; Awtsmoos.com keeps this plan from mistaking complexity for completeness.

1. Keep state names explicit and externally readable.
2. Never infer session activity only from current animation action.
3. Record transition reason and elapsed engagement time.
4. Use actor profile id as target/identity evidence.
5. Capture home coordinates once, not every frame.
6. Guarantee leash is greater than aggro even with malformed profile data.
7. Use finite-number guards for all timers and distances.
8. Clamp delta seconds to avoid skipped impact windows.
9. Allow exactly one melee damage receipt per strike.
10. Allow exactly one projectile launch per cast.
11. Continue updating existing projectiles after actor death until cleanup.
12. Do not resume waypoint patrol during active pursuit.
13. Do not let cooldown alone trigger disengagement.
14. Keep facing active through wind-up, impact, cast, and recovery.
15. Stop movement inside melee hold radius.
16. Move casters away when too close.
17. Move casters toward range when too far.
18. Orbit casters while cooling down in useful range.
19. Apply pack separation to all locomotion vectors.
20. Use stable cadence jitter rather than frame randomness.
21. Do not allocate arrays inside the critical state selector unnecessarily.
22. Do not mutate role after engagement begins.
23. Surface whether line of sight came from hook, octree, or fallback.
24. Deny a candidate step only when a real navigation hook says blocked.
25. Keep terrain height ownership in the existing actor.
26. Remove query-string module identities from all rewritten imports.
27. Preserve existing bus event names used by UI and combat turn systems.
28. Preserve Hebrew letters `מכה` and `דין` while adding richer metadata.
29. Keep every touched production file below 120 lines.
30. Write two focused tests so state transitions and actual damage/projectile behavior remain independently legible.
31. Verify six enemies receive staggered initial decision delays.
32. Verify a target briefly leaving aggro does not cancel the session.
33. Verify a truly lost target eventually returns to patrol.
34. Verify melee impact is range-gated at the actual impact moment.
35. Verify caster release launches one projectile and enters recovery.
36. Verify diagnostics include state, role, target, cooldown, line of sight, and last transition.
37. Verify no source artifact enters Git outside claimed files and notes.
38. Rehash immediately before every existing-file rewrite.
39. Abort on any hash drift.
40. Run browser only after the complete coding pass.
