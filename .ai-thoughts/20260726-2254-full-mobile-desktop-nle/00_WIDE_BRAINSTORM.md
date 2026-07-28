B"H
Boruch Hashem
Blessed is He

# Wide Brainstorm: Full Social NLE

The Awtsmoos gives one movie many vessels: authored project, generated asset, timeline clip,
preview frame, browser recording, and optional living-world render.

## Evidence

- The current project schema already supports duration, FPS, resolution, seed, render settings, typed tracks, clips, characters, camera rigs, sequences, graphs, and material graphs.
- Unknown project fields survive normalization because the normalizer clones and spreads the source document.
- Unknown track types survive validation as long as tracks and clips remain bounded and timed.
- Existing timeline geometry already defines deterministic move and trim behavior.
- The heavy 3D runtime is real but too slow to be the editing shell on this machine.
- The social composer already accepts a generated browser Blob through the public recorder bridge.

## Every Plausible Direction

1. Keep the heavy 3D editor as the only editor and merely restyle it.
2. Build a fast project-first NLE that edits the same JSON and launches 3D only for preview/render.
3. Add a desktop three-pane layout: assets, preview, inspector, with timeline below.
4. Add a mobile tabbed layout: Canvas, Assets, Inspector, with a persistent timeline drawer.
5. Preserve the public `AwtsmoosMovie` API so the parent social bridge remains unchanged.
6. Render a real movie directly from a canvas compositor when the 3D runtime is unavailable.
7. Let generated scenes be portable recipes instead of opaque screenshots.
8. Generate particle worlds, gradients, title cards, subtitles, and audio beds.
9. Import image, video, and audio files into an IndexedDB asset repository.
10. Keep project JSON small by storing blobs outside the JSON and referencing asset IDs.
11. Support downloadable project JSON and downloadable movie WebM.
12. Support undo and redo through bounded project snapshots.
13. Add snapping to frames, seconds, clip edges, and playhead.
14. Add drag move, trim-left, trim-right, split, duplicate, delete, mute, and lock.
15. Add timeline zoom and horizontal virtual scrolling.
16. Add track creation for Visual, Overlay, Dialogue, Audio, Camera, Actor, Scene, and Door.
17. Add an inspector whose fields adapt to track and clip type.
18. Add a starter-film generator that converts existing MitzvahWorld scene/dialogue/audio tracks into a complete editable social composition.
19. Add a procedural asset generator with deterministic seed and palette.
20. Add title presets: cinematic, parchment, neon, minimal, and subtitle.
21. Add particle presets: sparks, stars, dust, rain, embers, and shattered light.
22. Add sound presets: drone, pulse, bell, wind, and silence.
23. Add safe generated SVG art for posters and backgrounds.
24. Add a real-time preview canvas with play, pause, seek, loop, and frame stepping.
25. Add a real MediaRecorder export using canvas capture plus generated audio.
26. Keep the original MitzvahWorld tracks untouched unless the user explicitly edits them.
27. Use extension tracks for social visual/audio composition so the real engine can ignore them safely.
28. Let the editor save locally without needing server APIs.
29. Restore the last project and asset library on reopen.
30. Add autosave receipts and unsaved-change indication.
31. Add keyboard shortcuts on desktop and large touch controls on mobile.
32. Add accessibility labels and focus restoration.
33. Add project diagnostics: duration overflow, missing asset, unsupported media, and empty track.
34. Add a render estimate based on duration, FPS, and resolution.
35. Add export presets for Reel 9:16, Landscape 16:9, Square 1:1, and Story 4:5.
36. Add safe resolution limits matching the current validator.
37. Add a generated thumbnail frame for the social post.
38. Add full-screen preview and timeline-only focus modes.
39. Add project import from JSON and media relinking.
40. Add world-preview launch that passes the current project through the existing movie query codec.

## Preferred Direction

Use the project-first NLE. It is responsive, truthful, immediately editable, produces a real browser movie,
and still preserves the optional full MitzvahWorld runtime for 3D preview/render when that runtime is available.
