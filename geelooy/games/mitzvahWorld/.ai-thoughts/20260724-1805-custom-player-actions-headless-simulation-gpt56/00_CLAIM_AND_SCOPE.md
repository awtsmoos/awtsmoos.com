# B"H
# Custom Player Actions and Headless Simulation Claim

## Claimed source
- `experiments/Awtsmoos/src/playerActions/**`
- `experiments/Awtsmoos/src/simulation/**`
- `experiments/Awtsmoos/src/test/playerActions/**`
- `experiments/Awtsmoos/src/test/simulation/**`
- `experiments/Awtsmoos/src/app/MinimalMeadowAnimationState.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowFriendlyChossidSystem.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js`
- `docs/CUSTOM_PLAYER_ACTIONS.md`
- `docs/HEADLESS_GAMEPLAY_SIMULATION.md`

## Hash guards
- `MinimalMeadowAnimationState.js`: `4aad41985923c39e710e41d72bcb3ef18feb93499b78bf91cdf76a664b790bed`
- `MinimalMeadowFeatureBundle.js`: to be rechecked immediately before its full rewrite.

## Preserved authorities
The imported GLB clips remain authoritative for standing, walking, running, jumping, falling, punch, and stab. Existing combat, inventory, equipment, movement, collision, renderer, terrain, demons, and world systems remain read-only dependencies.

## Goal
Add only missing custom actions as registered additive poses, keep staff and sword messages separate, expose the same actor contract to friendly Chossid NPCs, and build a deterministic Node.js simulation that loads the real GLB manifest and advances real gameplay mechanics without WebGL.
