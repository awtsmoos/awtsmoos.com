# B"H
# Boruch Hashem
# Blessed is He

## Test evidence

### Focused acceptance

`node --test` over the new population, mount/budget, and river-continuity suites:

- Tests: 8
- Passed: 8
- Failed: 0

### Legacy compatibility

The existing tree core, tree materials, mobile integration, live mobile rescue, and village hydrology suites were run from their intended repository root:

- Tests: 9
- Passed: 9
- Failed: 0

## Runtime profile evidence

### 390x844 mobile

- Mounted top-level scene groups: 3
- Trees: 22 across 7 groves
- Tree children per tree: 2
- Vegetation cells: 28
- Vegetation children per cell: 2
- River segments: 80; source-to-lake continuity true
- Draw calls: 106
- Live materials: 17
- Scene objects: 159
- Triangles: 258,184
- Update allocations: 0
- Vegetation bounds X: -105.5 to 105.5; finite and playable

### 1440x900 desktop

- Mounted top-level scene groups: 3
- Trees: 32 across 7 groves
- Tree children per tree: 2
- Vegetation cells: 42
- Vegetation children per cell: 2
- River segments: 80; source-to-lake continuity true
- Draw calls: 154
- Live materials: 17
- Scene objects: 231
- Triangles: 360,638
- Update allocations: 0
- Vegetation bounds X: -105.5 to 105.5; finite and playable

## Clearance and ecology evidence

Desktop minimum tree clearances:

- Road: 13.6221
- House envelope: 5.2130
- Entrance corridor: 4.2089
- Quest access: 24.1365
- Combat clearing: 11.9471
- River water edge: 11.2274

Tree quadrants: northeast 10, northwest 16, southeast 3, southwest 3.
Vegetation quadrants: northeast 16, northwest 22, southeast 1, southwest 3.
Vegetation zones: grass 14, dry 5, river-bank 17, moist 6.

## Hydrology evidence

- Continuous river segments: 80
- Maximum adjacent sample gap: approximately 2.2361
- Destination overlaps receiving lake: true
- Minimum sampled water depth above bed: approximately 1.7350
- Minimum sampled bank rise above water: 0.08
- Water, riverbed, and bank vertices are finite and inside the world envelope.
