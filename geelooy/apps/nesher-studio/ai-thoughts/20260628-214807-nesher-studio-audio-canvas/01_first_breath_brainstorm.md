B"H
# First Breath Brainstorm — Nesher Studio Audio + Canvas Size

## User-visible request
Improve Nesher Studio so recordings include source audio, canvas size changes really update the canvas, and the resolution controls become stronger with preset choices plus custom width/height.

## Observed project surface
- Root app: `geelooy/apps/nesher-studio`.
- Entry: `index.html` loads `main.js`.
- Current recording path: `main.js -> modules/recorder.js -> modules/webcodecs/webmRecorder.js`.
- Current source audio exists in capture streams: `modules/sources.js` asks `getDisplayMedia(... audio:true ...)` for monitor/display sources.
- Existing `modules/audioCapture.js` packets audio to IndexedDB but is not wired into the recorder.
- Current canvas sizing path: `index.html` number inputs -> `main.js applySize()` -> `modules/stage.js resizeStage()`.
- Current WebM muxing path creates a muxer with video only; no audio input, no audio encoder, and no source-audio mixer.

## Broad options considered
1. Keep WebCodecs video and add WebCodecs Opus audio in the same WebM muxer.
2. Fall back to MediaRecorder for canvas capture stream + mixed audio stream.
3. Add a toggle that chooses WebCodecs if audio encoding is supported and MediaRecorder otherwise.
4. Refactor all recording code into smaller modules so the audio graph, source discovery, encoder plumbing, frame pump, and muxer lifecycle are visible.
5. Refactor canvas sizing into a preset module plus DOM binding module so custom dimensions and presets stay synchronized.

## Preferred direction
Use the browser-native path already present: WebCodecs + webm-muxer. Add a small audio graph module that mixes all audio-bearing source streams into one MediaStreamDestination. Feed that stream into a WebCodecs AudioEncoder via MediaStreamTrackProcessor, then mux Opus chunks next to VP9 video chunks.

## Files likely touched
- `index.html` for preset dropdown and status/control copy.
- `main.js` to delegate size controls and recorder status details.
- `modules/dom.js` to expose the new preset select.
- `modules/stage.js` possibly for stage resize containment and source clamping.
- `modules/recorder.js` to pass sources into recorder.
- `modules/webcodecs/webmRecorder.js` to become a small orchestrator.
- New `modules/recording/*` modules for audio mixing, audio encoder, video encoder, frame pump, muxer support, and size controls.
- New tests for resolution presets and recorder audio path.
- This `ai-thoughts` folder for durable handoff.

## Risks
- Browser support for `AudioEncoder`, `AudioData`, or `MediaStreamTrackProcessor` may vary.
- `webm-muxer` audio method names must match runtime library expectations; guard with helpful errors.
- Display capture audio may be absent when Chromium/user does not grant tab/system audio.
- Changing canvas dimensions clears the drawing buffer; must redraw immediately.
- Existing files should be rewritten as whole files only, never partially patched.
