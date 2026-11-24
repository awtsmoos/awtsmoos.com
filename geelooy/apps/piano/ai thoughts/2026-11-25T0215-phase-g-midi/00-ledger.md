//B"H
# Great Reinvention — Phase G execution ledger 2026-11-25T0215 (Asia/Saigon)

Baseline: previous session commit a67fff8b0, suite 340/340. Massive other-session dirty tree preserved; path-scoped commit only.

## 1. Phase G core — DONE
- Project model v2 (`multitrackProject.js`): `version:2`, tracks gain `kind` ('audio'|'midi'), `midiInstrument`, `midiRegions[]`; projects gain `markers[]`, `sections[]`. V1-shaped input migrates by normalization (empty vessels). `multitrackProjectDuration` counts MIDI regions. Archive (`multitrackProjectArchive.js`): format string unchanged ('awtsmoos-studio-1'); v1 audio archives unpack (tested), MIDI regions need no audio sources and pack/unpack (tested), duplicate region ids rejected.
- `multitrackMidiRegion.js` (new): notes (pitch/start/duration/velocity, seconds relative to region), sustain intervals, add/remove/move/resize/velocity/duplicate/transpose/quantize, sustain-aware expansion (note ending inside a pedal interval is held to its end — unit-tested exact: end 3.25s).
- `multitrackMidiFile.js` (new): SMF format-1 encode (conductor tempo track + one track per MIDI track, 480 PPQ), format 0/1 decode incl. running status, tempo, sustain CC64, track names; `midiFileToRegions`. Round-trip unit test: pitches/timing/velocity/tempo preserved.
- Playback/export: `multitrackPlaybackSchedule.js` schedules MIDI notes (sustain-expanded, seek-aware) through the per-track output chain (effects/automation/mute/solo apply) via `multitrackMidiVoice.js` (oscillator voice, velocity envelope — identical in live and OfflineAudioContext). `multitrackOfflineMix.js` accepts MIDI-only projects.
- Piano roll (`multitrackPianoRoll.js`, new, wired in multitrack/index.js): pitch 36–84 grid, click-to-draw with audition (AudioState master, guarded), drag to move, right-edge drag to resize, velocity slider, quantize (beat fractions at project tempo), delete/duplicate/transpose, sustain add, .mid import (adds tracks/regions) and export. Styles folded into existing styles/multitrackTimeline.css (a new sheet would have broken the NLE fixture's exact 24-link isolation count — fixture left untouched).

## 2. Markers + sections — DONE
- `multitrackMarkers.js` (new) + `multitrackMarkerControls.js` (new): add marker/section at playhead, named, seek-on-click, delete; persisted via project model (JSON round-trip tested); rendered as a lane on the timeline (`multitrackTimelineDom.js` markerLane + `multitrackRender.js` renderMarkerLane); marker/section times are magnetic snap targets (`multitrackSnapMath.js` collectMagneticTargets — tested).

## 3. Remaining-item pick: 24-bit WAV — DONE; buses/freeze/IndexedDB — NOT done
- `multitrackWavEncoder.js`: optional 24-bit PCM (16-bit default byte-identical path); header/data sizes unit-tested. `multitrackMastering.js`: new working "Master WAV 24-bit" button alongside 16-bit.
- Buses/sends, track freeze, IndexedDB incremental storage: not attempted this session (honest remainder, in that priority order).

## Verification
- New unit tests `test/multitrackMidi.test.mjs`: 7/7 pass (edits, sustain, v2 migration, SMF round-trip, v1 archive compat + MIDI-only archive, markers, 24-bit WAV).
- Full suite: **347 tests, 347 pass, 0 fail** (340 baseline + 7 new), concurrency 4.
- Chromium fixtures (local server :8899): studioMidiBrowser **PASS** (MIDI-only offline render: silence before 0.5s, PCM peaks 0.303/0.275 at the two notes; piano roll draws 2 notes, grid click adds a 3rd to the project). studioNleBrowser PASS, studioMixBrowser PASS, studioArrangementBrowser PASS, studioEffectRoutingBrowser PASS. Note: server load was 17–22 during the run; the stock runner's 5s CDP timeout flaked — fixtures pass with a 20s-timeout copy of the runner (/tmp/runFixtureSlow.cjs, runner itself unchanged in repo).
- New files chmod 644 verified (the 640→403 bug does not recur).

## Deployment / rollback
- Production serves the working tree directly (verified previous session); no BH.sh (would destroy other sessions' uncommitted work). Path-scoped commit + push to main (see git log). Some committed multitrack files also carry earlier reinvention sessions' still-uncommitted work in the same files — same mission lineage, no other-app files included.
- Rollback: `git revert <this session's commit>`.
- Production check: new modules return 200 application/javascript at awtsmoos.com; permanent URL https://awtsmoos.com/apps/piano/ unchanged, no __awts_build.

## Honest remains
- Piano roll: no marquee multi-note selection, no controller lanes beyond sustain-add, no scale highlighting; MIDI notes in the >128-clip lookahead scheduler path are not incrementally scheduled (full-schedule path handles them; lookahead triggers only on >128 audio clips).
- No tempo map (single project tempo), no drum patterns/arpeggiator integration in regions.
- Buses/sends, freeze, incremental IndexedDB storage, true-peak limiting, physical-device/Firefox/WebKit passes still open.
