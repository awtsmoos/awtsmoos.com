B"H

# Critique and Refined Plan

## What already exists

- Combat already has one melee and one ranged attack slot, long windups, impact spacing, and invulnerability.
- Corpse loot already has manual Take and Loot All.
- The main Shlichus already tracks five unique demons and grants an exact-once reward.
- The world is already 360 units wide with spaced enemy profiles.
- UI refresh is already cadence-limited.

## What should not be duplicated

- No second combat engine.
- No second inventory store.
- No second quest database.
- No second renderer or terrain system.
- No always-on expensive diagnostics loop.

## Coordinating systems to add

1. Region catalog and runtime
   - Stable region IDs and names.
   - Safe-zone state.
   - Discovery history.
   - Region-change bus events.

2. Adaptive quality and enemy budget
   - Rolling frame-time measurement.
   - Balanced quality transitions with hysteresis.
   - Distant noncombat enemies update less often.
   - Selected and engaged actors always update at full cadence.

3. Presentation
   - Compact region banner.
   - Enemy threat warning driven by existing events.
   - Toggleable diagnostics panel rather than permanent HUD clutter.

4. Shlichus memory
   - Required unique defeats remain unchanged.
   - Optional no-defeat, teaching, and deliberate-loot objectives.
   - Completion receipt stores optional outcomes and discovery context.

5. Loot readability
   - Rarity and value derived from canonical inventory definitions.
   - Item rows expose rarity without changing transaction ownership.

## Safety constraints

- Rewrite entire touched files.
- Keep every source/test module at or below 120 lines.
- Preserve all current public exports unless deliberately extended.
- Do not commit or push.
- Do not claim the broader legacy suite is green.
