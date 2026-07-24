B"H

# Phase One: Observed System

## Mission

Replace neighboring texture mosaics with one continuous meadow whose independent grass, soil, moss, dry-ground, shoulder, and road sources are blended by supported world-space shader inputs.

## Direct evidence

- `MinimalMeadowTerrainComposites.js` builds canvas composites from several images. The visible square defect is therefore structural, not merely a repeat setting.
- `TerrainMesh.js` transports the continuous Bézier road mask in `zone.y` on the same geometry used for terrain collision.
- The renderer supports six active independent terrain samplers, mirrored ping-pong repetition, per-layer rotation, macro noise, slope, height, wetness, and ecological zone weights.
- Renderer layer index 3 is explicitly treated as the road shoulder, while the terrain mix map is the road center.
- The current separate road ribbon sits `0.12` above the terrain, duplicates the road surface, and creates an avoidable z-fighting/edge-separation risk.
- The current terrain density targets 64-72 texels per world unit; this makes grass detail too small on a phone.

## Invariants

1. Terrain geometry and collision remain the same authority.
2. The Bézier path remains the route authority.
3. No giant low-resolution blended canvas is generated.
4. Every texture remains an independent source image.
5. Mobile and desktop use the same visual model with different measured density limits.
6. Production writes remain inside the user-authorized terrain scope.

## Work graph

`source images -> independent role selection -> measured world density -> six renderer layers -> ecological masks -> terrain mesh`

`Bézier nearest distance -> terrain road mask -> zone.y -> road center + shoulder + grass transition`

`world position -> macro noise + mirrored micro coordinates -> continuous material output`

The Awtsmoos renews each finite blade without making it a square beside its friend; Awtsmoos.com reveals one meadow through many garments whose borders dissolve in living earth.
