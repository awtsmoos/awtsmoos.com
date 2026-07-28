B"H

# First Brainstorm: Bigger Meadow and Three New Enemy Types

## Goal

Expand the continuous meadow from 220 to 360 world units without losing geometric or texture density, then place three additional enemies in the newly created outer regions. The additions must differ in silhouette, movement, role, engagement distance, damage cadence, reward, and test evidence.

## Enemy possibilities

1. Heavy sentinel: broad silhouette, slow movement, high armor, low aggro, melee role, long recovery.
2. Fast skirmisher: narrow silhouette, high movement speed, wide orbit, low health, light melee damage.
3. Long-range cantor: tall silhouette, caster role, broad preferred distance, slow readable projectile, long cooldown.
4. Burrowing creature, flying creature, healer, summoner, and stealth creature were considered but rejected for this pass because they require new navigation or group-support systems rather than focused world growth.

## World possibilities

1. Increase terrain size only. Rejected as incomplete unless sampling density also rises.
2. Increase terrain size and preserve approximately the same meters-per-grid-cell. Chosen.
3. Scale all existing landmarks outward. Rejected because the village should remain a dense central hub.
4. Keep existing village, road, houses, river, and lake in place while using expanded procedural terrain for new outer encounter regions. Chosen.
5. Add an explicit world contract with radius, safe inset, and encounter ring so profiles cannot silently spawn beyond terrain.

## Chosen numbers

- terrain size: 360
- grid steps: 120
- prior cell width: 220 / 72 = 3.0556
- new cell width: 360 / 120 = 3.0
- existing six enemies remain within the inner world
- new enemy radius: approximately 120 to 148 world units
- safe terrain half-width: 180
- encounter safe inset: 18

## Three new enemy identities

### Even-Koved — Stone Warden

- archetype: warden
- role: melee
- spawn: northwestern high rim
- broad body scale
- high health and armor
- slow speed
- short aggro range
- long cooldown and recovery
- low-to-moderate damage

### Ratz-Layla — Night Skirmisher

- archetype: skirmisher
- role: melee
- spawn: southeastern dry meadow
- narrow tall body scale
- low health and armor
- fast speed
- wider orbit and separation
- light damage
- medium cooldown

### Baal-Otiyot — Letter Cantor

- archetype: cantor
- role: caster
- spawn: northeastern outer ridge
- tall body scale
- medium health
- long preferred range
- slow readable projectile
- long cooldown
- light ranged damage

## Required proof

- one dedicated test for each new enemy type
- one world-expansion test proving size, steps, density preservation, and safe spawns
- current combat and terrain tests remain green
- live runtime diagnostics report nine enemies and a 360-unit world
