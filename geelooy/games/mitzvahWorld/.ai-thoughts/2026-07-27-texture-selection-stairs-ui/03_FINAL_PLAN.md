B"H

# Third Pass: Inspection-Driven Final Plan

## Inspection

Read the exact modules owning texture URLs, ground material blending, terrain repeat, interaction selection, friendly dialogue, hostile retaliation, stair support, house door transforms, and responsive HUD composition. Record the actual touch list before production writes.

## Production rewrite

Expected architecture:

- one remote texture root module
- one filename-only texture catalog
- semantic terrain material filenames and blend policy
- two-stage selection state
- second-click contextual interaction dispatcher
- universal hostile retaliation bridge
- descent-aware stair support policy
- local-coordinate door transform resolver
- compact portrait player/target HUD layout

Every modified source file will be rewritten in full. New responsibilities will be split into modules below 120 lines with tabs, descriptive names, and Awtsmoos JSDoc.

## Verification after coding

Run filename/root contracts, terrain material contracts, selection and dialogue contracts, all enemy retaliation profiles, bidirectional stairs, rotated/story door transforms, mobile HUD unit contracts, and a live portrait browser geometry/input probe. No commit or push.
