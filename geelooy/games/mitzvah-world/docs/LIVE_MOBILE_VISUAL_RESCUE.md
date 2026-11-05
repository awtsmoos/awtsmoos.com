# B"H
# Live Mobile Visual Rescue

## Runtime publication

`MinimalMeadowFeatureReceipts` uses `featureNow(environment)` for duration measurement. The former undefined `now` reference aborted deferred features and prevented stable publication of UI, rich world, and diagnostics.

## Right rail

The right rail now starts expanded on every viewport. Touch users retain a 44-pixel collapse control, but Bag, map, quests, controls, HUD, and menu are no longer hidden by default.

## Terrain and road density

Terrain UV coordinates are derived from world X/Z positions and a measured `tileWorld` value. This means repetition exists in geometry rather than depending only on a renderer-side repeat uniform. One composite is not stretched across the valley.

The ground blends separate lush, dry, soil, mud, and marsh composites. Each composite preserves its own density by storing a ratio to the shared world-UV basis.

The road uses a six-source stone/dirt/grass composite plus shoulder and soil layers. Its UV V coordinate follows measured Bézier distance, its U coordinate follows road width, and its surface is raised 0.12 world units to avoid z-fighting while collision remains authoritative in the underlying terrain.

## Friendly quest NPC

The primitive box watchman is no longer mounted. The quest actor loads the same canonical `chossid.glb` source as the player, but receives an isolated skeleton, imported animation player, staff equipment runtime, custom-action runtime, and quest marker.

## Houses, demons, equipment, and casting

A post-mount visual stability pass disables incorrect frustum and backface disappearance on house meshes without changing their dimensions or colliders.

Demon meshes retain their procedural map materials, opt out of dark vertex-color multiplication in the bootstrap renderer, and remain uncullable.

Every procedural staff and sword child is marked visible to bootstrap and rich render paths. Starting a cast draws either equipped weapon, not only the wooden staff. Custom action rotations begin from captured bind quaternions instead of accumulating previous-frame offsets.

## Acceptance authority

Screenshots are not proof. Inspect feature receipts, rail DOM state, GLB source identity, world-UV ranges, road source count, house culling and sidedness, demon mapped-material count, weapon attachment state, action quaternions, console errors, and deterministic simulation receipts.
