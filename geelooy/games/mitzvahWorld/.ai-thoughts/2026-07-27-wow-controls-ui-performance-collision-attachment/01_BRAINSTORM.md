B"H

# First Brainstorm: Controls, UI, Performance, House Floors, Attachments

## Control possibilities

- Right mouse held: rotate camera and player together.
- Left mouse held: orbit camera only, preserving player yaw.
- Both mouse buttons held: move forward in camera-facing direction.
- A/D should always strafe relative to camera, never become sticky turn flags.
- Pointer capture must release on pointerup, pointercancel, blur, visibility loss, and contextmenu.
- Mouse button state must be centralized so one lost DOM event cannot strand movement.
- Touch controls must remain independent from desktop mouse semantics.

## UI possibilities

- Establish one HUD viewport contract for mobile and desktop.
- Prevent panels from exceeding safe viewport width/height.
- Consolidate stacking contexts and pointer-event ownership.
- Add compact mode under narrow width and low height.
- Keep combat bar, movement controls, target card, menu, bag, and quest panel from overlapping.
- Avoid layout thrash by changing classes/datasets rather than inline geometry each frame.

## Performance possibilities

- Audit per-frame DOM writes, repeated traversals, object allocations, collision scans, and redundant renderer state.
- Cache static colliders and attachment nodes.
- Throttle HUD refresh to state changes or a bounded cadence.
- Reduce enemy diagnostics recomputation when no state changed.
- Skip offscreen/remote actor updates where safe.
- Reuse movement and camera vectors.
- Preserve 360-unit terrain while reducing runtime work, not visual quality.

## Collision possibilities

- House floors must be exact walkable supports rather than side-wall boxes.
- Interior floor support should win over terrain below the house.
- Support sampling must include story floors, landings, and threshold levels.
- Downward movement must not tunnel through a floor after a large frame delta.
- Falling beneath a valid house floor should snap upward only when inside the room footprint.
- Collision-only walls must never become floor authority.

## Attachment possibilities

- Resolve semantic skeleton anchors once per model generation.
- Rebind all equipped items after hydrated model replacement.
- Preserve local transforms per item/slot.
- Never let multiple attachment anchors accumulate under one hand.
- Detach old objects before binding new model nodes.
- Make weapon, staff, offhand, tefillin, jacket, and accessories use the same ownership protocol.

## Required proof

- Desktop mouse control state-machine tests.
- A/D release and blur recovery tests.
- Both-button autorun test.
- UI viewport contract tests.
- Performance budget test for per-frame allocations/DOM writes.
- House interior floor support tests, including large delta and underground recovery.
- Attachment rebinding and duplicate-anchor tests.
- Full Node simulation and live browser input simulation.
