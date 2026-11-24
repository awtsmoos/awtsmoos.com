#B"H — Tranche 6: simultaneous voice recording + feedback protection (both surfaces)

Baseline: HEAD f7652aa53, suite 375/375. Other sessions dirty work preserved; path-scoped commit only.

## Shared law — ONE module, both surfaces
- NEW modules/recording/micSafety.js (pure): output modes (default speakers = safe),
  canEnableMonitor/resolveMonitorEnabled (speakers ⇒ monitoring impossible),
  buildMicConstraints (echoCancellation + noiseSuppression ALWAYS on, AGC configurable),
  totalLatencyCompensation (output/base + input), placeRecordedClip (timeline math,
  negative start trims into sourceOffset), duckFactorFromDb, FeedbackGuard
  (sustained peak>=0.98 AND rms>=0.55 for >=300ms while monitoring ⇒ cut; singing
  patterns and monitor-off never fire; latched until explicit reset), micErrorMessage.
- NEW modules/recording/micCapture.js: MicCaptureSession — PCM capture via
  ScriptProcessor on the shared context (no codec delay), analyser branch never
  routed to output, monitor path only through the gate, ducking with exact
  restore, stream tracks stopped on stop() (device light off).
- Studio shim multitrackMicSafety.js re-exports the shared module (identity-tested).

## Studio
- NEW multitrackMicRecord.js (MultitrackMicTake): capture opens, transport plays
  from playhead (multitrackPlayback.clockStart reconciles the two clocks), stop
  places ONE clip on the armed track via setProject (one Undo), compensation
  stored on the clip (multitrackProject clip factory gained latencyCompensation).
- NEW multitrackMicControls.js panel: mode select (persisted, shared key), arm
  select + new Vocal track, monitor checkbox (disabled+explained on speakers),
  ducking toggle (-3/-6/-12, default on -6), record/stop, role=alert notice.
  Feedback cut notice requires explicit re-tick to re-arm.

## Main piano surface
- REWRITTEN modules/app/microphone.js: safe constraints, Hear Self forced off
  by default (HTML default checked is overridden unless a stored choice exists),
  injected output-mode selector + notice (index.html/pianoShell untouched —
  both are other sessions dirty files), analyser-poll FeedbackGuard cuts only
  micPlaybackGain.
- NEW modules/app/voiceTakeControl.js: self-binding 🎙 Record Voice control by
  the Record Audio button — capture while keys play (speakers: -6 dB duck,
  monitor off), then ▶ playback, ⬇ WAV (save-decision flow), 🎼 To Studio
  via the existing editRecordingInStudio.

## Verification
- Unit: test/multitrackMicSafety.test.mjs 6/6 (gating identity across surfaces,
  constraints, compensation, placement x3, guard cut/no-cut patterns).
- Full suite: 381/381 (375 + 6).
- Chromium fake-device (runMicFixture.cjs, new): studioMicRecordBrowser PASS
  playing-during=true rms=0.086 start=0.000 dur=1.12 comp=40ms; speakers-mode
  UI gating asserted in-fixture; stream released (capture.stream === null).
- pianoVoiceTakeBrowser PASS master-rms=0.028: real startExecutedNote notes
  audible on masterGain during capture, take kept (1.4s), defaults verified
  (monitor off, mode=speakers).
- Regression: studioMidiBrowser PASS.
- Production: page + all new modules 200 application/javascript, zero __awts_build.

## Honest remains
- Full index.html boot in headless (runPianoVoiceFixture.cjs) timed out waiting
  for keyboard render under server load 38-127 (load spiked by many sessions +
  orphaned fixture Chromes, since cleaned). Pre-existing startup behavior, not
  exercised to a verdict this tranche; the piano-surface fixture above uses the
  real modules, DOM ids, note path and master chain instead.
- Residual feedback risk on speakers can never be zero: a loud room + sensitive
  mic can still bleed arrangement into a take (EC/ducking reduce, not erase),
  and the guard only protects the MONITOR path (off on speakers anyway).
- ScriptProcessor is deprecated-but-universal; an AudioWorklet capture node is
  the future replacement. iOS Safari mime/echo behaviour varies by version —
  capture here is PCM, so no MediaRecorder mime dependence for takes.
