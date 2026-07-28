B"H

# Integrated Game Improvement Brainstorm

## Vertical slice

The primary loop will be treated as one continuous experience:

Village safety → Reb Mendel Shlichus → readable road → spaced demon encounters → telegraphed combat → satisfying corpse loot → return journey → visible completion and permanent memory.

## World identity

- Regions receive stable IDs, names, themes, ambient labels, safety policy, encounter density, texture roles, and discovery receipts.
- Roads become navigation structure rather than decoration.
- Landmarks and region transitions announce themselves without modal interruption.
- Safe zones suppress enemy pursuit and attacks.
- Demon fields remain visibly separate from homes, spawn, friendly NPCs, and roads.

## Combat clarity

- Each enemy attack has a windup, danger phase, execution receipt, recovery phase, and cooldown.
- Player and enemy damage use typed receipts: physical, fire, light, corruption, healing, blocked, and critical.
- Impact feedback includes amount, type, action label, and outcome.
- Enemy concurrency is bounded so the player is not surrounded by every nearby actor.
- Target selection brightens the chosen actor and fades ambiguity in nearby enemies.

## Loot and inventory

- Fallen actors use forgiving body footprints.
- Loot opens as a compact manual-loot panel with item icons, quantity, rarity, individual take, and Loot All.
- Corpses retain a looted/unlooted visual state.
- Inventory gets category, sort, comparison, equipped state, and protected-item contracts.

## Shlichus and progression

- One active mission remains truthful in parchment, menu, tracker, and completion memory.
- Objectives support required and optional progress.
- Completion stores reward, outcome, timestamps, and follow-up availability.
- Learning prompts remain optional and full teaching stays available in the book.

## Performance and diagnostics

- Adaptive quality responds to measured frame time rather than device labels alone.
- Distant AI updates less often; distant optional effects pause.
- Runtime diagnostics expose FPS, frame time, world region, actor counts, draw calls, selected target, quest phase, water/terrain state, and recoverable failures.
- End-to-end tests exercise village-to-completion, inventory, stairs, combat, corpse loot, and mobile layout.
