# B"H
# Boruch Hashem
# Blessed is He

## First Extreme Brainstorm — Chesed Expansion

The Awtsmoos recreates darkness itself every instant, yet darkness is not required to become unreadable. At Awtsmoos.com the renderer is a vessel: color, normal, texture, light, and silhouette can join without multiplying allocations or tearing another worker's contract.

### Every technically plausible repair path

1. Brighten only the material base tint.
2. Bind the existing procedural smoky hide canvas.
3. Add deterministic hide families keyed by enemy profile.
4. Preserve geometry vertex colors for eyes, horns, torso, and limbs.
5. Tune roughness so daylight produces broad readable highlights.
6. Keep metallic near zero so the body reads as hide, bark, stone, or scorched flesh rather than polished void-metal.
7. Use subtle emissive tint only where renderer support exists.
8. Keep bootstrap readability through a non-black base tint.
9. Keep rich-renderer readability through `base × vertex × texture` multiplication.
10. Attach diagnostics for profile key, source dimensions, repeat, roughness, metallic, and renderer policy.
11. Share expensive canvas texture resources by a bounded family key.
12. Allocate one material per demon at construction so selection or damage feedback can remain independent.
13. Avoid detached eye or rune meshes because the canonical creature contract is one continuous skinned surface.
14. Avoid renderer changes because the renderer already consumes color, vertex colors, normals, UVs, and texture maps.
15. Avoid geometry changes because the generated anatomy already contains the needed attributes.
16. Make procedural texture generation deterministic for stable tests and captures.
17. Make texture creation testable with an injected document/canvas adapter.
18. Expose finite profile families to prevent unbounded cache growth.
19. Preserve fast first frame by creating only small synchronous canvases and no network requests.
20. Keep all behavior inside focused modules below the project's preferred file-size ceiling.

### Failure universe

- Bootstrap ignores the texture and remains too dark.
- Rich renderer multiplies three dark values and still produces black.
- Shared material mutation leaks selection feedback to every enemy.
- Per-actor texture generation wastes memory.
- Random patterns make screenshots nondeterministic.
- Unsupported canvas APIs break tests.
- Texture fields exist but the renderer looks for different names.
- New imports use query strings and duplicate module identity.
- Existing selection/damage code mutates material fields not preserved by the factory.
- UV wrap creates obvious seams.
- New files accidentally exceed the modularity limit.
- A concurrent worker modifies the same source after the initial read.

### Chosen direction after expansion

A bounded procedural hide cache plus a per-actor material factory is the strongest architecture. It gives shared resources without shared mutable feedback, preserves the one-mesh contract, remains readable in bootstrap, and unlocks existing UV/color detail in rich mode.
