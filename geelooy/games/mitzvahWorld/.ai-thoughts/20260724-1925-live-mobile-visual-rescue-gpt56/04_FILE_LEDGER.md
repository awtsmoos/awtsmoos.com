# B"H
# File Ledger

## Existing full rewrites
- Feature receipts
- Mobile game rail
- Terrain package, composites, road ribbon, terrain mesh
- Quest NPC population and rich-world mounts
- Weapon factory
- Player action actor
- Bootstrap color renderer
- Feature bundle integration

## New modules
- `MinimalMeadowWorldUvDensity.js`
- `MinimalMeadowQuestChossidVisual.js`
- `MinimalMeadowVisualStability.js`
- focused tests under `experiments/Awtsmoos/src/test/world/` and `test/playerActions/`.

## Invariants
No partial writes, no source file above 120 lines, tab indentation, no replacement of imported GLB clips, no fake gameplay state, no screenshot-based acceptance.
