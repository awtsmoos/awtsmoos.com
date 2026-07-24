# B"H
# Phase Two: Architecture

## Action path
`message -> registry -> validator -> actor -> pose sampler -> additive bone application -> finite release event`

## Runtime invariants
1. Never delete, replace, or rename imported GLB clips.
2. Sample the imported clip first.
3. Apply a registered custom pose only afterward.
4. Resolve semantic roles once per model.
5. Emit each release event at most once.
6. Keep staff and sword definitions and messages separate.
7. Reject missing equipment or unresolved required bones.
8. Preserve garment visibility and weapon attachment through the existing equipment runtime.

## Simulation path
`GLB file -> GLB JSON manifest -> simulated scene graph -> real movement/combat/inventory/collision -> fixed clock -> inspector`

The clock advances without sleeping and may process many simulated seconds inside one wall-clock millisecond. Snapshots expose model nodes, animation names, action phase, equipment, collision contacts, combat cooldowns, inventory, events, and simulated time.
