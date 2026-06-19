B"H

# Emergency Current vs Goal Fix — Honest Observation

The screenshots prove the current pass is not close enough.

Visible failures:

1. Huge black region still appears above the room.
2. Camera still sometimes frames too wide and leaves characters tiny.
3. Room is still sparse compared with goal board.
4. Rich room details are not visible enough, meaning either the backdrop renderer is not the visible renderer for this scene or camera/stage transform hides its details.
5. Characters are improved but still not production-hot: no hats/beards for the goal style, faces are still simple, clothes are simple, gestures are limited.
6. The ideal reference is a warm detailed interior dialogue scene with table, books, lamps, framed art, shelves, curtains, bearded hat-wearing male characters, stable two-shots, OTS, close-ups, inserts.

Correction strategy:

Do not keep nudging the old room. Create a stronger default scene target: a warm study room with two bearded hat characters at a table. Add a screen-space background fill guard so black void cannot remain even if camera transform shifts world. Add specific default camera values that keep subjects large and centered. Add character style support for beard/hat if already possible; otherwise add safe stable overlay details in character renderer.

Files to inspect before writing:
- Render pipeline/clear/background files to find why black appears.
- SceneBuilder/LayerRenderer to see which backdrop is active.
- Stable head/hair renderers to add hat/beard safely.
- Default scene files already touched.
