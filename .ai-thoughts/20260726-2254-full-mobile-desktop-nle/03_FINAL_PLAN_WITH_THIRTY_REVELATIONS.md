B"H
Boruch Hashem
Blessed is He

# Final Plan with Thirty Revelations

## Thirty Final Corrections

1. Start from the existing 30-second project rather than an empty editor.
2. Preserve original tracks and add extension tracks only when needed.
3. Use `nle-visual`, `nle-overlay`, and `nle-audio` as extension track types.
4. Store generated recipes in `project.nle.assets`.
5. Store imported Blob metadata in the project and Blob values in the repository.
6. Make project state the only source of truth for timeline and inspector.
7. Make selection explicit as track ID plus clip ID.
8. Make playhead independent from selection.
9. Snap all time edits to the project frame grid by default.
10. Clamp clips to project duration.
11. Add split, duplicate, remove, move, and trim as pure functions.
12. Add undo and redo around project replacements, not DOM actions.
13. Add a deterministic generated asset ID factory.
14. Add deterministic particle recipes using project seed plus asset seed.
15. Add title-card recipes with text, alignment, colors, and entry/exit animation.
16. Add gradient recipes with two colors and direction.
17. Add tone recipes with frequency, waveform, volume, and fade.
18. Convert current scene clips into particle/gradient visual clips in the starter composition.
19. Convert current dialogue clips into overlay clips in the starter composition.
20. Reuse current audio tone clips directly in the preview and renderer.
21. Render current actor/camera/door clips as optional HUD annotations, never as fake 3D.
22. Add aspect presets that update project resolution safely.
23. Add a project duration control that never truncates silently without confirmation.
24. Add local autosave with a versioned key.
25. Add project JSON download and import.
26. Add real WebM export with truthful MIME negotiation.
27. Publish a recorder result compatible with the parent social bridge.
28. Add desktop keyboard shortcuts and mobile touch controls.
29. Add diagnostics before export and refuse missing critical assets.
30. Test that no MitzvahWorld gameplay or movie source file is written.

## Actual First Implementation Slice

This pass will implement:

- Responsive shell with Assets, Preview, Inspector, and always-visible Timeline.
- Project state, history, selection, playhead, zoom, autosave, import, export.
- Pure timeline move, trim, split, duplicate, and delete.
- Frame and clip-edge snapping.
- Generated gradient, particle, title, and tone assets.
- Starter composition from current scene/dialogue/audio tracks.
- Asset library and generator panel.
- Adaptive inspector for project, track, and clip basics.
- Canvas preview with playback and seeking.
- Generated tone audio during preview/export.
- Real browser WebM recording.
- Immediate `AwtsmoosMovie` public API.
- Optional full 3D world launch in a separate tab.
- Focused unit and browser tests.

## Files Actually Touched

Only `geelooy/social-composer/reel-studio/**`, reel route tests, and the existing reel-frame contract if needed.
The MitzvahWorld tree remains read-only.
