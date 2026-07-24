# B"H
# Boruch Hashem
# Blessed is He

## Planned Versus Actual Delta

The Awtsmoos turns intention into measured manifestation; Awtsmoos.com keeps the difference visible so a beautiful report cannot conceal a broken gesture.

### Planned and completed

- Recover the July 23 evening combat and GLB contracts from Git checkpoint `40cefd4`.
- Preserve a fast playable first frame.
- Default to single-player and defer multiplayer.
- Load one canonical Chossid GLB after play.
- Restore the real three-slot action bar and Tab targeting.
- Restore charged Hebrew casts, visible projectiles, impact damage, cooldowns, and target health.
- Keep six independent demons, corpse state, and loot behavior.
- Use compact feature entry boundaries while removing connected `?v=` identities.
- Preserve Bag, W/A/S/D, camera drag, HUD, and mobile movement.

### Discoveries beyond the plan

- A concurrent worker had restored the historical blocking runtime after the prior core repair; the implementation was rebuilt against the latest disk state.
- The historical combat graph was already behaviorally complete but trapped behind terrain richness, GLB, renderer, and multiplayer readiness.
- The first cast meter exposed a payload/view mismatch that displayed `NaNs`; the view now reads finite remaining time.
- The mobile shell was uncollapsed while legacy styling hid the joystick and reduced shell height to zero; the final correction stylesheet provides bounded controls.
- The rich quest backdrop used a stronger selector and reclaimed full-screen pointer ownership; the exact data-open selectors are now pointer-transparent while the parchment itself remains interactive.
- Test Chrome throttled requestAnimationFrame because it lacked window focus. The live runtime's own `updateWorldSystems(1/60)` method was stepped deterministically to verify actual cast, launch, travel, impact, damage, and cooldown code.

### Intentional noncritical boundaries

- Rich water, trees, vegetation, houses, friendly NPCs, and quests load after combat readiness.
- Multiplayer loads only when `session=multiplayer` is requested.
- The screenshot helper did not persist a file; all acceptance evidence came from direct browser state and interaction receipts.

No known critical delta remains.
