B"H

# Gameplay, Quests, Creator, and Persistence

## Bridge vertical slice

- Reuse one canonical AdventureStore across gameplay UI, rich quest presentation, rewards, persistence, map, and obstacle events.
- Add the Village Bridge Trial adventure with the existing `activity / village-bridge-trial` event.
- Mount the existing obstacle runtime into the authoritative world loop.
- Auto-offer/activate the trial at the canonical start without breaking normal quest UI.
- Grant exactly one canonical `stone-block` through ShlichusRewardService.
- Introduce a real damaged BRIDGE01 deck gap rather than overlaying duplicate geometry.
- Add a bridge-restoration objective that remains impossible to complete without the material.
- Expose contextual Build near the gap through the generic direct-action provider system.
- Lazy-load Creator transaction machinery only when the build becomes relevant.
- Commit world document, visible geometry, exact octree collision, inventory consumption, persistence, and quest completion transactionally.
- Roll every completed step back if a later step fails.
- Restore the repaired geometry and collision from persisted universal world data after reload without duplicate rewards.
- Test course replay, double-click races, failed collision insertion, failed persistence, reload, and repeated completion.

## Quest architecture

- Keep semantic event schemas stable for combat, travel, activity, build, learn, collect, care, dialogue, and discovery.
- Add prerequisite/locked quest support rather than exposing future quests too early.
- Add quest chains and data validation for giver, target, marker, reward, prerequisite, and world-effect IDs.
- Ensure every objective can become impossible only through an explicit recoverable design.

## Content loops

- Implement Gather the Lost Sparks as real world collection and consequence.
- Implement Journey to the Hidden Spring as exploration/traversal/hydrology gameplay.
- Implement Build the Learning Garden with resources, placement, persistence, growth, and community effect.
- Implement Trial of Ascent with mountain traversal, checkpoints, timing, recovery, and mobile-friendly controls.
- Add village helping, learning, repairs, deliveries, garden care, market work, exploration, and emergent world events.
- Add farbrengen scenes and gatherings with respectful spatial, NPC, lighting, and audio treatment.

## Torah and mitzvah systems

- Make Torah learning discovery, memory, dialogue, understanding, and world consequence rather than generic ammunition.
- Make mitzvos visibly improve infrastructure, gardens, safety, NPC state, and civilization.
- Balance progression around capability, understanding, relationship, and world improvement rather than grind.

## Creator

- Finish semantic prefab categories, search, ghost validation, rotate/elevate/distance controls, snapping, collision checks, terrain conformity, costs, undo/redo, saves, remix/export, streaming, and mobile UX.
- Route Creator materials through Procedural Core material intent.
- Add walls, stairs, fences, paths, planters, benches, garden beds, structural pieces, and meaningful architectural assemblies.

## Persistence

- Assign explicit ownership for player position, inventory, quests, exact-once reward IDs, Creator world, world effects, discovery, settings, NPC relationships, and important simulation state.
- Add schema migration, corrupt-save recovery, last-known-good backup, offline behavior, cloud conflict rules if accounts use cloud saves, and compact delta persistence.
- Test repeated save/reload cycles and abrupt tab close/network loss.
