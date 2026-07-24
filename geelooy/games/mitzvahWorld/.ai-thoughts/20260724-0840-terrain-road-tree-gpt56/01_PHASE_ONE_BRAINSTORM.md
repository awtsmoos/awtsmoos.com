# B"H
# Boruch Hashem
# Blessed is He

## Phase one: unconstrained discovery

The Awtsmoos.com meadow should reveal terrain as measured cloth rather than a stretched veil, a road as joined stone rather than painted mud, and trees as connected growth rather than floating cards.

Possible complete approaches considered:

1. Reuse the canonical procedural-core output buffers directly in the tiny runtime.
2. Use the canonical Three adapter after extending tiny runtime compatibility.
3. Build a narrow tiny-runtime adapter without modifying shared runtime or canonical library.
4. Cache one branch geometry and one leaf geometry per preset.
5. Bound preset count and tree population by mobile quality while keeping deterministic placement.
6. Use existing road-mask transport so visual road and collision terrain remain aligned.
7. Generate one cached cobblestone canvas during hydration, never per frame.
8. Overlay stone, mortar, wear, and dirt shoulders inside the existing path composite.
9. Compute integer repeats from terrain dimensions, source dimensions, target pixels per world unit, and quality limits.
10. Expose source size, selected repeats, effective density, quality, anisotropy, and clamp reasons in diagnostics.
11. Preserve bright first-frame fallback and asynchronous rich-world hydration.
12. Keep all resources shared and deterministic.
13. Add tests that reject crossed-card primitives and false generator-authority metadata.
14. Add tests across square and non-square source images and mobile/desktop profiles.
15. Confirm no fake-tree fallback survives any route import.

Preferred direction: focused adapters and data contracts, no shared-runtime edits, no canonical-library edits, no orchestration edits.
