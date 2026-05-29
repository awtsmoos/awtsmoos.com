B"H
# Screenshot Tight-Space Fix Plan

## What the screenshot proves
The prior fairness test was too narrow. It only caught platforms with meaningful horizontal overlap. But a player can also be blocked by near-parallel ledges and ledges whose edges form a tight vertical slot. The rule must become stricter.

## New rule
For every pair of solid bodies close enough to create a navigable slot:
- If the vertical clearance is positive and less than the player height plus margin, move the upper body up.
- Treat near-horizontal adjacency as hazardous too, not just direct overlap.
- Include trick platforms, not only normal platforms.

## Concrete checks
- all 51 levels
- normal platforms
- solid trick platforms
- item overlaps
- hazard overlaps
- moving/spawned/trigger spikes have warning
- full test suite after repair
