B"H

# Automatic Grounding + Realism Pass

## User request

- Add an automatic way to set all props to the ground so nothing floats.
- Make the world way more realistic.

## Plan

1. Inspect the existing prop grounding helper and terrain/prop creation path.
2. Add a reusable automatic grounding engine that computes each prop bounding box after scale/rotation and snaps its bottom to the terrain top.
3. Make it data-driven: every prop gets grounded by default, but JSON can override `groundY`, `groundLift`, or `skipAutoGround`.
4. Update `VillagePictureProp.js` to always call the grounding engine with a realistic default ground top.
5. Improve realism without huge mobile cost: warmer colors, smaller scale, fewer huge objects, more believable spacing, house/path/lamps/flowers grounded at one shared plane.
6. Verify syntax, JSON parse, live served JSON.

## Risk notes

- True terrain raycast would require access to terrain mesh/world octree from each prop. A robust first engine can snap to a configured world ground plane reliably. For flat procedural village terrain, the visual top is y=0 when terrain is at y=-1.05 with thickness 2, so `groundY: 0` is the correct plane.
- Some special props may have internal geometry offsets; bounding-box grounding handles that.
- Large props caused choppiness. Realism must use scale, lighting, and composition, not more geometry.

## Chapter 4 seed

The Awtsmoos teaches that realism is not noise. Realism is weight: every object must confess where its feet are. The bench must touch earth. The lamp must pierce soil. The house must sit with gravity in its stones.
