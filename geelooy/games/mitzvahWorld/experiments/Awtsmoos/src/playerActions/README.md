# B"H
# Custom Player Actions

This directory contains additive actions that are not embedded in the canonical Chossid GLB. Imported standing, walking, running, jumping, falling, punch, and stab clips remain untouched.

## Public messages

- `player.action.staff.cast`
- `player.action.sword.cast`
- `player.action.dispatch`

Each action message carries `phase: start | progress | release | cancel`. Staff and sword definitions are intentionally independent.

## Adding an AI-authored action

Create a declarative definition with a unique `id`, unique `messageType`, semantic-bone keyframes, equipment requirement, duration, recovery, priority, and release event. Register it through `runtime.registerPlayerAction(definition)` or a `PlayerActionRegistry`.

Do not mutate DOM, renderer, inventory, or scene globals inside definitions. Gameplay consequence belongs to named release-event listeners; pose data only describes animation.
