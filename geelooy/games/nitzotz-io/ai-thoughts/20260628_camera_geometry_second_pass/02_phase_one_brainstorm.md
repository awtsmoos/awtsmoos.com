# B"H — Phase One Brainstorm

Possible repairs:

- Reduce chunk radius for low/medium performance.
- Reduce per-chunk object budget.
- Add visible-object culling by player radius and camera distance.
- Add max visible object count per frame.
- Add near-camera clipping rejection so huge shapes cannot cover the whole screen.
- Reduce semantic size tiers for gates, clouds, arches, towers.
- Split camera into rig/config/obstacle modules.
- Split render list into terrain/object/particle/portal/radar/culling modules.
- Split procedural primitives into cube/plane/round/star modules.
- Split catalog into registry/nature/structures/glyphs modules.
- Add tests for command counts, finite commands, near-camera culling, catalog triangles.
- Keep gameplay intact: player still grows, absorbs, unlocks worlds.

Risk: over-culling could make the world empty. Mitigation: terrain, portal, particles, nearby edible items remain; objects are sorted by distance and capped rather than eliminated randomly.
