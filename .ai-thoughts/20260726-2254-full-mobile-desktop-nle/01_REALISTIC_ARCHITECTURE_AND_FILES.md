B"H
Boruch Hashem
Blessed is He

# Realistic Architecture and File Targets

## Core Contract

```text
NLE Project State
  -> same normalized MitzvahWorld project JSON
  -> extension assets and extension tracks
  -> responsive timeline + inspector + asset lab
  -> canvas/audio preview
  -> MediaRecorder Blob
  -> existing parent ReelRenderBridge
```

## Social-Only Files

All new implementation lives below `geelooy/social-composer/reel-studio`.
No MitzvahWorld source file will be modified.

### Project and History

- `nle/NleProjectState.js`: normalized project state, selection, playhead, zoom, dirty flag.
- `nle/NleProjectHistory.js`: bounded undo and redo snapshots.
- `nle/NleProjectIO.js`: import, download, local save, restore.
- `nle/NleProjectDefaults.js`: extension tracks and starter composition.

### Timeline

- `nle/NleTimelineModel.js`: track rows, clip bounds, snapping, split, duplicate, delete.
- `nle/NleTimelineView.js`: safe DOM rendering of ruler, tracks, clips, playhead.
- `nle/NleTimelineInteractions.js`: pointer drag, trim, scrub, zoom, keyboard shortcuts.
- `nle/NleTimelineControls.js`: play, pause, frame step, split, undo, redo.

### Assets

- `nle/NleAssetRepository.js`: IndexedDB blobs and metadata.
- `nle/NleAssetGenerators.js`: deterministic particles, gradients, titles, and tones.
- `nle/NleAssetLab.js`: generator/import UI and asset library.
- `nle/NleAssetPreview.js`: thumbnails and media previews.
- `nle/NleAssetClipFactory.js`: converts selected assets into valid extension clips.

### Preview and Render

- `nle/NleCompositor.js`: draws active scene, media, title, dialogue, and particle clips.
- `nle/NleMediaResolver.js`: resolves image/video/audio elements from repository blobs.
- `nle/NleAudioEngine.js`: schedules generated tones and imported audio.
- `nle/NlePlayback.js`: real-time preview loop and seeking.
- `nle/NleMovieRecorder.js`: canvas/audio MediaRecorder output.
- `nle/NlePublicApi.js`: publishes `AwtsmoosMovie` immediately.

### Shell and Inspector

- `nle/NleApp.js`: assembly and lifecycle.
- `nle/NleShell.js`: semantic desktop/mobile workspace.
- `nle/NleInspector.js`: adaptive project/track/clip fields.
- `nle/NleDiagnostics.js`: project validity and missing-asset receipts.
- `nle/NleWorldPreview.js`: optional launch of the heavy world in a new window.

### Styling

- `nle/styles/index.css`
- `nle/styles/shell.css`
- `nle/styles/timeline.css`
- `nle/styles/assets.css`
- `nle/styles/inspector.css`
- `nle/styles/mobile.css`
- `nle/styles/preview.css`

### Existing Files to Rewrite

- `reel-studio/index.html`: host the fast NLE shell instead of auto-booting the heavy world.
- `reel-studio/boot.js`: load project, assemble NLE, publish API.
- `reel-studio/style.css`: import the NLE style system.
- `js/reel/ReelStudioFrame.js`: preserve route and readiness contract.

## Scope Boundary

- No server-side generation promises.
- No AI image service is assumed.
- “Generate” means deterministic browser-generated visual/audio assets.
- Imported files remain local to the browser unless rendered into the final movie.
- The full 3D world remains optional and external to the responsive editing shell.
