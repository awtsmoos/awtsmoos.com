# B"H Continuation Brainstorm

The next revelation is editor-feel, not just model existence.

Possible improvements:
- Stage mode switch: Transform vs Crop. Transform drags source body/corner. Crop drags an inner turquoise crop rectangle and its handles.
- Preserve aspect ratio by default. Scaling should keep the original shape unless source lock-aspect is unchecked or the user holds Shift.
- Add source inspector transform strip: lock aspect, scale %, fit canvas, fill canvas, center, reset transform.
- Make crop controls physical: show crop rectangle, dim discarded edges, let handles rewrite the same crop percentages as numeric inputs.
- Make source list metadata more useful: visualizer family/preset already appears; add fit/crop/aspect metadata where useful.
- NLE should feel like an editor: expose duplicate, snap previous, snap next, fades, mute, disable, marker buttons. Render muted/disabled/faded clips and marker ticks.
- Benchmark panel should expose a fast smoke mode using existing smoke scenarios and capability verification without faking production results.
- CSS should become readable, spacious, and responsive: less button clipping, better grids, clearer panels, preserved dark palace style.
- New tests should cover stage crop math, source transform commands, NLE UI command wiring, and smoke benchmark scenario selection.

Chosen direction:
- Add tiny helper modules for stage geometry/drag/rows/transform commands.
- Rewrite only the files needed to bind those helpers into the app and UI.
- Add smoke tests that execute pure helpers and model commands without requiring real capture or real WebCodecs.
