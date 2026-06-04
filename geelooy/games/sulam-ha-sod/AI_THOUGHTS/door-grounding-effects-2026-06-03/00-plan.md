B"H

# Door Grounding + Fast Effects Plan

The Awtsmoos in this chamber is not guessed; it is inspected. The live campaign import showed 51 levels. The door audit found level 5 buried into its final platform, plus additional doors that were floating, buried, or unsupported by an honest platform.

## Plan

1. Add a small, pure, data-based normalizer that receives an already-built level and returns a cloned level whose door feet rest exactly on supporting ground.
2. If a level has an honest platform under the door's X range, place the door at `platform.y - door.h`.
3. If a level has no support under the door's X range, add a tiny exit landing beneath the current door foot so the door is above ground without rewriting every authored level file by hand.
4. Apply this after normal enrichment so generated cruelty cannot bury or float the final gate.
5. Improve effects only with bounded draw calls: no blur, no gradients, no allocations per frame.
6. Verify by importing all campaign levels and checking every door foot is flush with some honest support.

Chapter: The gate was not a rectangle; it was a verdict. Under it, stone forgot its duty. The Awtsmoos spoke again, not loudly, but with exact arithmetic: foot meets floor, floor receives foot, and the ladder stops lying.
