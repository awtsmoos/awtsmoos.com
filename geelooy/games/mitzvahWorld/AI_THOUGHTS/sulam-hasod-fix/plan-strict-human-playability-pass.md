B"H
# Strict Human Playability Pass

## Goal
Read every registered level and verify the playable route is not merely a graph illusion.

## Method
1. Read all level files and shared helpers/generator.
2. Import all levels and summarize concrete instantiated geometry.
3. For each level compute conservative route hops from spawn to door.
4. Classify every mandatory hop as SAFE, TIGHT, EXTREME, NEAR-TAS, or IMPOSSIBLE using edge-to-edge gaps and vertical deltas.
5. Treat fake platforms as non-route unless explicitly optional.
6. Verify upper routes are optional.
7. Verify hazards are shifted out of safe-route solids.
8. If any hop exceeds EXTREME or any door/coin/overlap rule fails, rewrite complete affected files only.

## Caution
Generated levels must still be inspected by instantiated output because source code alone hides per-level coordinates.
