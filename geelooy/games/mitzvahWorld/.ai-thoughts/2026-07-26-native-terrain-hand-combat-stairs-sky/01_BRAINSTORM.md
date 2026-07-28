B"H

# First Brainstorm: Native Terrain, Honest Readiness, Hand Combat, Mercy, Stairs, and Sky

## The complete field of possibilities

The user-visible failures are not isolated cosmetic defects. They reveal several places where a convenient approximation replaced the real contract:

- terrain scale used one fixed world multiplier instead of source dimensions and world dimensions,
- readiness described the bootstrap as finished while rich systems were still descending,
- weapon visibility was guaranteed by abandoning the real hand,
- combat rotation aimed the body but not the staff,
- six demons shared aggressive pack pressure too early,
- target selection existed in data but barely changed the world surface,
- a static menu invented a Shlichus instead of reading the actual store,
- a wedge made stairs mathematically climbable but physically unlike stairs,
- the sky shader contained a sun but its composition could still read as one flat blue field.

## Terrain possibilities

1. Restore high source texel density and derive exact repeat count from `worldSize * desiredTexelsPerWorld / sourcePixels`.
2. Preserve fractional repeat rather than integer rounding.
3. Pass absolute world-frequency values into the shader instead of ratios against an arbitrary reference texture.
4. Remove the fixed `0.0048` constant or define it from the world size.
5. Keep a broad macro sample only as subtle variation, not as the primary texture scale.
6. Use one native-detail sample and one low-frequency color variation sample.
7. Keep all six ecological sources at their own native dimensions.
8. Record exact repeat, world coverage per source, source pixels, and achieved texel density in diagnostics.
9. Avoid downscaling images before upload.
10. Keep road scale independent from grass scale.

## Readiness possibilities

1. Await both renderer hydration and feature settlement.
2. Require one successful rich render after those promises settle.
3. Wait one or two animation frames for texture upload and layout.
4. Mark a degraded-but-settled state when optional systems fail rather than hiding the loading screen early.
5. Keep progress below one until the final readiness receipt is published.
6. Include renderer, features, equipment, houses, terrain, sky, enemies, and UI in a final checklist.

## Weapon and casting possibilities

1. Attach the weapon anchor directly to `rightHand` when that bone exists.
2. Retain a model-root fallback only for models with no hand bone.
3. Keep a separate initial hand pose and casting aim pose.
4. Compute yaw and pitch from hand position to selected target chest.
5. Update the aim every cast frame because both player and enemy may move.
6. Restore the neutral hand pose after launch/cancel.
7. Keep the staff in the hand before any cast begins.
8. Record attachment source, fallback state, target id, and aim angles.
9. Make staff meshes uncullable but do not detach them from skeleton hierarchy.

## Combat icon possibilities

1. Replace Hebrew text icons with recognizable pictograms while retaining Hebrew letters in tooltips and spell effects.
2. Fire: flame icon.
3. Light: radiant star/sun icon.
4. Staff strike: staff/wand icon.
5. Add accessible labels and keep keyboard numbers visible.

## Combat mercy and spacing possibilities

1. Reduce global attack slots to one melee or one ranged attacker at a time.
2. Lower damage.
3. Increase windup, cooldown, recovery, and player invulnerability.
4. Reduce aggro radius.
5. Remove pack-expanded aggro cascade.
6. Spread spawn points across the world.
7. Increase separation radius and force.
8. Ensure non-slot enemies orbit or hold distance rather than crowding.
9. Add an opening grace delay after engagement.
10. Keep patrols away from the initial player spawn.

## Selection highlight possibilities

1. Increase selected material emissive strength.
2. Brighten the base tint without washing out texture.
3. Add a pulsing world-space ring under the selected enemy.
4. Add a floating diamond or halo above the head.
5. Preserve the selected visual on corpses until loot is resolved.
6. Restore exact original material values on clear.
7. Pulse in the actor update loop.
8. Publish highlight diagnostics.

## Shlichus menu possibilities

1. Remove the hard-coded East Gate placeholder.
2. Read `runtime.adventures.snapshot()` when available.
3. Read the dedicated minimal quest snapshot as a fallback.
4. Display current active/pinned quest, objective, progress, percentage, and ready-to-return state.
5. Refresh while the menu is open when adventure state changes.
6. Escape all quest strings before inserting markup.
7. Show available/completed counts beneath the current mission.

## Stair possibilities

1. Remove the ramp entirely.
2. Use actual stepped support heights.
3. Keep visible stair treads as visuals.
4. Add a custom stair height sampler that returns one discrete tread height.
5. Mark the stair footprint and direction in house diagnostics.
6. During horizontal movement, detect entry into a stair footprint and snap upward only when the next tread rise is within policy.
7. Prevent downward slope acceleration and false airborne state.
8. Keep a safe exit margin at top and bottom.
9. Prevent capsule trapping by making stair visual meshes non-solid and using the sampler as the sole stair collision authority.
10. Preserve the upper landing as a real solid walkable slab.

## Sky possibilities

1. Strengthen zenith-to-horizon gradient.
2. Increase sun angular size and halo visibility on mobile.
3. Increase cloud contrast and cloud band coverage.
4. Add warm horizon haze.
5. Ensure sky material is unlit/procedural and not flattened by ordinary lighting.
6. Publish sun direction and intensity.
7. Make the sun visible from common camera directions by selecting a deliberate world direction.
8. Add a secondary circumsolar glow rather than geometric cards.

## Files likely touched

- terrain density/math and terrain shader files,
- readiness and feature-settlement helpers,
- weapon anchor/attachment/casting files,
- combat actions and action-bar view,
- combat balance, profiles, steering, enemy lifecycle and selection visuals,
- menu Shlichus presentation,
- stair definitions and movement stair support,
- sky fragment shader and sky diagnostics,
- focused test fixtures and live browser probes.
