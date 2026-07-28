B"H

# Third Pass: Final Inspection-Driven Plan

## Phase A — inspect canonical ownership

Read the exact modules that own:

- keyboard and pointer event listeners
- camera yaw/pitch/orbit
- player facing and movement vector
- HUD mounting and responsive CSS
- render/update scheduling and diagnostics
- house footprint, floor meshes, support sampling, and vertical movement
- equipment semantic node resolution, anchors, model hydration, and slot transforms

Record all files and contracts before production writes.

## Phase B — production rewrite

Expected modules will be split into:

- desktop mouse chord state
- desktop pointer bindings
- camera/player orientation policy
- movement intent synthesis
- HUD responsive contract
- HUD update scheduler
- frame budget/cache helpers
- house floor support registry and crossed-support recovery
- attachment registry, anchor cleanup, and model-generation rebinding

All edited files will be rewritten in full. No partial replacement. Tabs, descriptive names, JSDoc, and <=120 lines per file.

## Phase C — tests after all coding

Add focused tests for:

1. right drag rotates camera and player
2. left drag rotates camera only
3. both buttons move forward
4. A/D release cannot stick after blur/pointer loss
5. HUD fits mobile and desktop safe viewport contracts
6. HUD updates are throttled/cached
7. house floor wins over terrain and prevents underground tunneling
8. large delta crosses no valid floor
9. attachment registry has one anchor per slot
10. hydrated model rebinds every equipped item

Then run current control, movement, UI, house, equipment, performance, Node-world, and live browser simulations.

No commit or push.
