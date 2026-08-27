# B"H
# Custom Player Action Architecture

## Canonical rule

The Chossid GLB remains authoritative for every imported clip it actually contains: standing, walking, running, jumping, falling, punch, and stab. Custom actions are created only for missing behavior and are applied additively after imported clip sampling.

## Distinct messages

Staff and sword are separate public contracts:

- `player.action.staff.cast`
- `player.action.sword.cast`

They are never aliases of one generic weapon cast. Their definitions have separate keyframes, timing, equipment requirements, release events, and priorities.

Every message uses one phase:

- `start`
- `progress`
- `release`
- `cancel`

The combat bridge locks the weapon-specific message at cast start, so changing equipment during a cast cannot silently change its animation identity.

## Extension contract

A future AI-authored action is declarative data registered through `runtime.registerPlayerAction(definition)`. Definitions name semantic bone roles rather than exporter-specific bone names. Validation rejects unknown roles, duplicate IDs, duplicate message types, invalid timing, missing equipment rules, and malformed keyframes.

The runtime exposes:

- `runtime.playerActionRegistry`
- `runtime.playerActions`
- `runtime.registerPlayerAction(definition)`
- `runtime.dispatchPlayerAction(message)`

Gameplay consequences must listen to a finite release event. They do not belong inside pose data.

## Actor neutrality

`PlayerActionActor` accepts a model, equipment authority, event bus, and actor ID. The player and friendly Chossid NPCs use the same contract. Each actor owns isolated mutable bones; sharing the canonical GLB source never means sharing one skeleton instance.

## Acceptance evidence

Do not use screenshots as proof. Inspect:

- imported clip name before custom layering
- registered action ID and message type
- bound semantic bone roles
- action phase, weight, elapsed time, and release count
- equipped item and attachment state
- garment visibility
- locomotion state before and after recovery
- console and event errors
