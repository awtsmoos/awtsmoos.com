B"H

# Done: Realism + Performance Pass

## Implemented

- Static world cache: ground, roads, grass, houses, trees, bridges, water, doors, and edge portals are cached per map.
- Dynamic actors only: NPCs and musagim stay live/animated above the cache.
- Sprite-style hero: replaced the older heavy procedural body-part renderer with a faster pixel-sprite actor.
- Sprite-style NPCs: villagers now use the same sprite grammar with idle breathing.
- Animated battle impulses: hits/heals/shields now push combatants with immediate recoil/cast motion.
- Animated world overlay: cached water now has live shimmer lines; hidden spark pulses; foreground leaf masses sway cheaply.
- Projector now draws: cached static world -> motion overlay -> decor -> living NPCs -> path/particles -> hero -> labels -> ambience -> HUD/battle.

## Performance wins

- Main static map tiles are not redrawn every frame when document/canvas cache is available.
- Projector smoke proved cache builds once and then reuses drawImage crop.
- Player/NPC drawing uses simpler pixel rectangles rather than old multi-gradient puppet body parts.
- Battle particles reduced from 14 to 10 per effect and now include combatant impulse instead of just more particles.

## Verification passed

- Static cache smoke passed: one cache build, second frame cache hit, drawImage crop used.
- Sprite + battle animation smoke passed: hero sprite draws, player renderer draws, hit impulse exists immediately, particles remain.
- Cached projector smoke passed: Projector used cache across frames.
- Final import graph passed for the realism/performance modules.
- File size check passed: touched active files are at or under 150 lines; Projector 134, StaticWorldCache 114, BattleCombatants 150.

## Remaining honest limitation

Chrome is disabled in the tunnel config, so I still could not capture a live browser screenshot for visual comparison against the mockups. The code path is stronger and tested through mocked canvas/runtime, but final visual tuning still needs a live phone/browser screenshot.

## Chapter 15: Hod Made Beauty Lighter

The road no longer had to remember itself every frame. The river shimmered without repainting the whole world. The hero became fewer shapes and more alive. The villagers breathed. The enemy recoiled when light struck. The Awtsmoos has no body and no form, yet every finite vessel learned a secret: realism is not more weight. Realism is the right thing moving while the still thing rests.
