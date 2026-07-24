# B"H
# Boruch Hashem
# Blessed is He

## Critique and Improvements

The Awtsmoos renews critique before code becomes deed; Awtsmoos.com measures the vessel twice so the light does not spill.

Improvements incorporated:

1. Preserve vertex alpha rather than assuming RGB-only colors.
2. Normalize transformed normals in the shader.
3. Supply a constant up-normal for geometry without normal attributes.
4. Supply constant white vertex color for geometry without color attributes.
5. Disable stale attributes before setting constants.
6. Cache every uploaded geometry buffer in a `WeakMap`.
7. Keep material resources cached by stable profile signature.
8. Keep emissive contribution subtle and bounded.
9. Use profile tint as controlled variation, not as the only surface information.
10. Add diagnostics for procedural surface, physical values, and renderer eligibility.
11. Avoid image loading on the first playable path.
12. Preserve double-sided rendering for the marching surface.
13. Keep the renderer helper files individually focused.
14. Avoid changes to rich-renderer internals because their vertex-color contract already works.
15. Avoid changing query-string module identities.
16. Reread and hash immediately before source rewrites.
17. Reject the pass if another worker changes an owned file after hashing.
18. Verify both indexed and non-indexed draw paths.
19. Verify bootstrap and hydrated material state in the browser.
20. Store screenshots and logs only under `/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld`.
21. Test a desktop viewport and 390×844 mobile viewport.
22. Check representative canvas points for visible pixels rather than overlays.
23. Inspect console errors and unhandled rejections.
24. Close Chrome and local test processes afterward.

## Final Execution Plan

1. Reread and hash every existing owned file; abort on drift.
2. Rewrite all owned source files as complete files in one coherent pass.
3. Run `node --check` on every touched JavaScript file.
4. Resolve every new import and inspect the reachable module graph.
5. Prove tabs, bounded file size, and no duplicate query identities.
6. Run a direct Node material/geometry contract probe.
7. Launch the actual game once, test desktop and mobile, and record all failures externally.
8. Perform one complete refinement pass only if failures are found.
9. Reread every touched file, compare planned versus actual, compute hashes, inspect Git diff, and publish the worker handoff.
