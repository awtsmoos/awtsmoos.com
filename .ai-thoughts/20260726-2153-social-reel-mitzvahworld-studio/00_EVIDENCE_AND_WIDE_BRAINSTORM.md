B"H
Boruch Hashem
Blessed is He

# Evidence and Wide Brainstorm

The Awtsmoos gives one social post the power to carry a finished film,
while the living game remains untouched in its own vessel.

## Proven Repository Evidence

- Current MitzvahWorld contains a runnable movie studio under `experiments/Awtsmoos/src/movie`.
- The studio boots `createEretzRuntime` with `startLoop: false`, isolating movie direction from gameplay loops.
- The launcher detects movie query parameters and opens the studio directly.
- The studio publishes `globalThis.AwtsmoosMovie` with project, director, recorder, runtime, seek, play, render, and exact-render APIs.
- `MovieRecorder.render({ download: false })` returns a real recording result containing a browser-produced Blob, MIME type, filename, frame telemetry, duration, and codec/container truth.
- Current audit records a verified 30-second H.264/AAC final movie and browser master.
- July 14 staged history contains project normalization, compilation, timeline, camera, actor, scene, audio, recorder, studio, workspace, and tests.
- July 15/current history extends that system with real runtime integration and exact rendering.
- Social composer already has one canonical `AttachmentStore.addFiles(scope, files)` path for root, verse, and subsection media.
- Social composer already previews and uploads pending video files through the same media UI.

## Broad Possibilities

1. Add a compact Reel card directly above the writing canvas.
2. Add Reel to the mobile quick-tool rail.
3. Offer Upload video and Create in MitzvahWorld as equal first choices.
4. Use a native dialog for the reel workflow.
5. Embed the real MitzvahWorld movie page in a same-origin iframe.
6. Open the studio with `mode=movie&movie=sample30` as a safe starting project.
7. Preserve support for encoded project URLs later.
8. Poll only the published `AwtsmoosMovie.ready` contract.
9. Never import gameplay internals into the social composer bundle.
10. Never modify current meadow gameplay files.
11. Render through `AwtsmoosMovie.recorder.render({download:false})`.
12. Convert the resulting Blob to a File with truthful filename and MIME type.
13. Add the File to root post media through existing `AttachmentStore` actions.
14. Add a generated caption naming the movie project.
15. Show render progress in the social dialog.
16. Keep the full studio controls available inside the iframe.
17. Let upload-first users attach a normal video without loading WebGL.
18. Close the dialog after successful attachment.
19. Focus the root media panel after attachment.
20. Make the dialog a bottom sheet on phones and a large studio modal on desktop.
21. Use clear visual separation between upload and generation.
22. Show truthful warnings that rendering happens locally in the browser.
23. Preserve a fallback link to open the studio in a new tab if embedding fails.
24. Test the bridge against a synthetic studio API and real Blob.
25. Test the actual MitzvahWorld iframe reaches `AwtsmoosMovie.ready`.
26. Test that the game route still enters gameplay without movie parameters.
27. Test no MitzvahWorld gameplay file is changed.
28. Keep every new file below 120 lines.
