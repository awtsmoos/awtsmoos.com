# B"H
# Boruch Hashem
# Blessed is He

## Third Critique — Thirty Additional Improvements

1. Clamp every tint channel rather than trusting profile data.
2. Preserve hue relationships while lifting luminance.
3. Avoid full-white fallback under every failure path.
4. Use finite family names instead of arbitrary profile IDs.
5. Hash profile identity deterministically into a family.
6. Keep cache size equal to the finite family count.
7. Store immutable diagnostics separately from mutable runtime material state.
8. Set the same map image fields expected by the current runtime.
9. Preserve `vertexColors: true` explicitly.
10. Set `texturePolicy` explicitly for shader selection.
11. Set `materialModeCode` only if the runtime contract already uses it.
12. Keep roughness high enough for broad highlights.
13. Keep metallic low enough for organic readability.
14. Keep emissive restrained so damage/selection feedback remains visible.
15. Use two-axis repeat metadata even if the canvas itself is small.
16. Preserve canvas source dimensions in diagnostics.
17. Use low-cost layered noise, cracks, and rune flecks.
18. Ensure every generated pattern is seamless enough at the wrap boundary.
19. Avoid costly gradients if the fake canvas test adapter cannot represent them.
20. Make the texture module independently testable without real WebGL.
21. Test that two materials are distinct objects.
22. Test that their map resource is the same object for the same family.
23. Test that a second family returns a different resource.
24. Test that bootstrap base color is above a blackness floor.
25. Test that no channel becomes full white.
26. Test roughness and metallic bounds.
27. Test UV, normals, color, joints, and weights remain present.
28. Test the canonical one-child mesh contract remains intact.
29. Reread and hash immediately before each rewrite, not merely once at discovery.
30. Abort rather than overwrite if an owned source hash changes unexpectedly.

### Revelation after critique

The original impulse was to connect the existing texture directly. That alone is insufficient because bootstrap ignores texture and rich multiplication can still collapse three dark values. The improved implementation must jointly normalize base tint, preserve bright anatomical vertex color, and bind a moderately valued procedural texture.
