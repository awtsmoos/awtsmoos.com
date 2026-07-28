B"H

# First Brainstorm: Texture, Selection, Enemy, Stair, Door, and HUD Repair

## Texture revelation

- One remote base URL module only.
- All material catalogs reference filenames only.
- Separate full-resolution and tree-library roots behind one resolver.
- Preserve canonical identity independent from transport URL.
- Enlarge grass texel scale so blades and clumps read at player height.
- Blend grass, dirt-grass, dirt, and cobblestone by ecological masks and road distance.
- Keep road center materially distinct from shoulders.
- Use real road/cobblestone pixels instead of procedural color alone.

## Selection revelation

- First click selects and studies/highlights a target.
- Second click on the same target invokes its contextual interaction.
- Friendly NPC second click opens dialogue/discussion.
- Hostile second click confirms combat targeting without accidental dialogue.
- Clicking a new target returns to study stage.
- Selection timeout or distance loss clears safely.

## Combat revelation

- Every hostile profile must own retaliation truth.
- Damage receipt should aggro the struck enemy regardless of patrol archetype.
- Validate all demon profiles against combat controller registration.
- Remove any profile-specific passive flag that silently disables response.

## House revelation

- Stair support must select lower treads while descending instead of preserving the highest reachable floor.
- Story-floor support must yield near stair openings and descending intent.
- Door local positions must derive from room wall planes and story origin, not world/profile origin twice.
- Validate door yaw, hinge side, threshold, and doorway collider alignment.

## HUD revelation

- Player and target cards may never overlap.
- Narrow portrait mode stacks target below or beside player status with a shared width budget.
- Collapse oversized target metadata.
- Keep controls clear of target/status/action regions.
- Respect browser toolbar-driven dynamic viewport changes.

## Proof

- Catalog test proving only one remote host literal.
- Terrain blend tests for filename roles and repeat scale.
- Two-click selection tests.
- Every demon retaliates after damage.
- Bidirectional stair traversal tests.
- Door transform/threshold alignment tests.
- Portrait HUD no-overlap browser geometry proof.
