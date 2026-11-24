#B"H — Voice + Piano final-audio fix (owner-reported, main piano, speakers)

## Symptom
Owner granted mic permission, recorded voice + piano together on the MAIN
piano (no headphones), final audio contained ONLY piano.

## Root cause
Two disjoint recording systems from tranche 6:
- MicCaptureSession (🎙 Record Voice) captured the voice to a private PCM
  buffer and NEVER connected to AudioState.mediaStreamDestination, so a
  concurrent Record Audio/Video final file structurally excluded the voice.
- The voice take artifact itself was voice-ONLY (no piano), so no single
  artifact contained the performance the owner actually made.
- Tranche-6 piano fixture never measured take content (status text only),
  and there was no mic level meter or silent-voice warning.
- buildMicConstraints forced noiseSuppression:true — browser NS can gate
  sustained sung notes; singing-unsafe default.

## Fix
- micCapture.js: MicCaptureSession gains a record tap (source -> gain ->
  mediaStreamDestination; recording destination only, no feedback path).
  New StreamPcmTap captures the record stream (piano master) to PCM.
- voiceTakeControl.js: a take now starts a master tap + mic capture,
  mixes voice + piano sample-aligned by audio-clock start times into ONE
  final buffer used by ▶ Play, ⬇ WAV and 🎼 To Studio. Live mic level
  meter (onLevel was previously unused here), "● Recording voice + piano"
  state, and a post-record warning when voice RMS < 0.004.
- micSafety.js: noiseSuppression OFF by default (opt-in), EC stays on.

## Evidence (Chromium fake mic ~398Hz tone, piano A2 110Hz, Goertzel)
Before: take WAV pianoE=0.0012 (absent), rms=0.086; Record Audio during a
voice take could not contain voice at all (no connection existed).
After (test/pianoVoiceMixBrowser.html, hard assertions):
- Take WAV: micE=0.0108, pianoE=0.0110, rms=0.159 — BOTH present.
- Record Audio + Record Voice together: micE=0.0048, pianoE=0.0074 — BOTH.
- Enable Mic + Record Audio: micE=0.0077, pianoE=0.0250 — still works.
Fixtures PASS: pianoVoiceMixBrowser, pianoVoiceTakeBrowser,
studioMicRecordBrowser (runMicFixture). Full suite 381/381.
Rollback: git revert <this commit>.
