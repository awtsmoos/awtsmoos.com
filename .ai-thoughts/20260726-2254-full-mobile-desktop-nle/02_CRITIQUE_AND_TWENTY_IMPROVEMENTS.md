B"H
Boruch Hashem
Blessed is He

# Critique and Twenty Improvements

## What the First Architecture Misses

1. A giant first pass would create too many modules before proving the state model.
2. IndexedDB can complicate tests and should be isolated behind one small interface.
3. Real-time MediaRecorder export can take project duration, so tests need short projects.
4. Video element seeking is asynchronous and must not block simple generated scenes.
5. AudioContext may require a user gesture and must fail gracefully.
6. Unknown extension tracks must remain harmless to the existing compiler.
7. Project JSON cannot serialize object URLs.
8. Mobile timeline drag handles need larger hit targets than desktop.
9. Timeline clips need deterministic colors without user data injection.
10. The preview canvas must preserve aspect ratio across orientation changes.
11. The inspector must not become a raw JSON form.
12. Generated assets need stable IDs for undo, redo, and persistence.
13. Undo snapshots must exclude live Blob objects.
14. Media removal must revoke object URLs.
15. Imported video duration may be unknown until metadata loads.
16. Rendering must lock project mutation to avoid mid-export drift.
17. Recorder MIME selection must remain truthful.
18. Project restore must tolerate schema evolution.
19. The parent should receive a ready recorder before the optional world boot.
20. Existing 3D tracks should be visible even if the 2D compositor cannot fully represent them.

## Improved Plan

- Implement a smaller first slice with project state, timeline, generated assets, preview, and recorder.
- Use a simple in-memory repository with optional IndexedDB persistence added behind the same API.
- Support generated backgrounds, titles, dialogue, and tones first because they are deterministic.
- Support image/video/audio import second, with metadata loading and missing-asset receipts.
- Publish `AwtsmoosMovie.ready` immediately after the NLE and recorder assemble.
- Keep world preview as an explicit button, never an automatic boot.
- Render unsupported MitzvahWorld tracks as labeled timeline clips and diagnostic overlays.
- Use an extension namespace under `project.nle` and track types prefixed with `nle-`.
- Keep history snapshots project-only; repository blobs remain stable by asset ID.
- Block mutation only during export, while playback remains freely seekable.
- Use frame snapping by default and clip-edge snapping as a second layer.
- Use pointer capture for robust mobile dragging.
- Use CSS grid and container-aware panels rather than viewport-only assumptions.
- Add a compact mobile mode switch instead of stacking all panes.
- Keep the timeline visible at every viewport size.
- Generate a starter composition from the current 30-second project on first load.
- Add project import/export before advanced editing.
- Add pure tests for clip mutation, snapping, generators, and recorder result shape.
- Add browser tests for mobile/desktop layout and a sub-second real WebM export.
- Keep every source and style module below 120 lines.
