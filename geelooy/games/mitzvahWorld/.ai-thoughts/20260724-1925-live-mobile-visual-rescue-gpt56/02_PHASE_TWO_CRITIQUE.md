# B"H
# Phase Two — Risks and Improvements

1. Avoid creating duplicate friendly systems; make the quest population itself canonical.
2. Preserve quest targeting and marker behavior while swapping only the visual vessel.
3. Avoid relying on shader repeat uniforms; encode world-density UVs.
4. Avoid double repetition by resetting material repeats after UV conversion.
5. Use a mixed road composite assembled from cobble, path, dirt, and soil sources.
6. Keep road collision authoritative in the underlying terrain.
7. Lift road only enough to prevent z-fighting.
8. Do not modify house dimensions or colliders.
9. Stabilize only house mesh culling and material sidedness.
10. Do not replace demon materials when the existing procedural map is valid.
11. Make bootstrap color obey the material vertex-color contract.
12. Mark weapon child meshes as bootstrap-visible and uncullable.
13. Preserve existing inventory and equipment events.
14. Prevent custom action quaternion accumulation with cached bind bases.
15. Restore bind bases only for action-controlled bones.
16. Keep imported clips sampled before custom actions.
17. Open the mobile rail by default but retain its collapse button.
18. Keep every rewritten executable at or below 120 lines.
19. Write complete files only.
20. Test only after the entire coding pass is complete.
