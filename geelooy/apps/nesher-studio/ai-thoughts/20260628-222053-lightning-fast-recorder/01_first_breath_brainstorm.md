B"H
# Lightning Fast Recorder Brainstorm

## Fresh user pain
- Current WebCodecs VP9 + Opus path is too slow for day-to-day recording.
- After one recording, the page does not reliably produce another downloadable file without a refresh.
- External window audio came out garbled.

## Root-cause hypotheses from inspected code
1. Manual WebCodecs VP9 encoding and mux finalization is too expensive for the default path.
2. Browser automatic-download protections can block repeated invisible anchor downloads, making it look like the app refuses a second recording.
3. The custom WebCodecs audio path transcodes external window audio through AudioContext -> AudioEncoder -> WebM muxer, which can introduce timestamp/channel/resampling trouble.
4. For external window audio, the safest low-latency path is to pass the captured audio MediaStreamTrack directly into a MediaRecorder stream instead of manually re-encoding it.
5. Canvas capture can use `canvas.captureStream(fps)` and browser-native MediaRecorder so encoding happens continuously and finalization is almost instant.

## Biggest speed idea
Make the default recorder a real-time MediaRecorder path:
- canvas.captureStream(fps) for video
- direct cloned audio track when exactly one source stream has live audio
- mixed audio only when multiple audio streams exist
- MediaRecorder with timeslice chunks so stop does not perform a huge encode at the end
- persistent download shelf so multiple recordings always leave clickable files

## Keep advanced path
Keep the existing WebCodecs path as a selectable "WebCodecs quality" mode, but make "Fast realtime" the default.
