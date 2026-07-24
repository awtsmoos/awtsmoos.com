# B"H
# Boruch Hashem
# Blessed is He

# Phase Three: Final Evidence-Driven Plan

## Thirty refinements before implementation
1. Inspect current source completely.
2. Trace all imports and call sites.
3. Parse the real GLB JSON chunk.
4. Enumerate node hierarchy.
5. Identify skeleton root, hips, spine, legs, arms, and hands.
6. Capture bind local transforms.
7. Enumerate clip names and durations.
8. Enumerate root/hips tracks by clip.
9. Quantify root-up deviation over each clip.
10. Quantify leg motion over stand/walk/run.
11. Confirm jump/fall airborne orientation is intentional.
12. Trace grounded state inputs.
13. Trace fall-state exit.
14. Trace imported clip sampling order.
15. Trace custom overlay order.
16. Trace cancellation/recovery order.
17. Trace model-forward correction ownership.
18. Trace weapon parent ownership.
19. Trace equipment switch cleanup.
20. Design the smallest body-mask contract.
21. Make forbidden lower-body channels impossible by validation.
22. Make pose sampling stateless or baseline-restoring.
23. Blend recovery toward fresh locomotion samples, not bind pose.
24. Preserve action registry APIs.
25. Preserve existing event names.
26. Keep modules below 120 executable lines.
27. Add focused deterministic tests first after production code.
28. Run syntax, imports, tests, and scoped diff checks.
29. Rehash and read back every touched file.
30. Produce a unique final handoff with evidence and remaining risks.

## Write decision gate
No production file will be rewritten until the GLB inspection and runtime trace identify the actual failure mechanism. Every write will be a complete-file replacement guarded by the recorded current hash.
