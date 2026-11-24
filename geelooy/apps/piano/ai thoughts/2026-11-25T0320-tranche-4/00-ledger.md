//B"H
# Great Reinvention — Tranche 4 ledger 2026-11-25T0320 (Asia/Saigon)

Baseline: HEAD 05335230e (includes 63cf77833 tranche 3), suite 361/361. Other sessions' dirty tree preserved; path-scoped commit only. Server load was 11–31 throughout — several Chromium runs were starved; see honest remains.

## 1. Bus effect inserts — DONE
- `multitrackBus.js`: buses gain `effects` (same normalized settings as tracks) + `enabled` (bypass) flag, preserved through project v2 model and archive pack/unpack (unit-tested).
- `multitrackBusChain.js` (new): one builder — input gain → `createTrackEffectNodes` chain (skipped when bypassed) → bus gain → destination. Bus→bus sends now tap the POST-insert output.
- `multitrackPlaybackSchedule.js`: uses the chain builder, so live playback and offline rendering share the identical bus signal path.
- `multitrackFreezeControls.js`: bus insert UI in the existing panel — bus select + highpass slider + enable/bypass checkbox + Apply.
- PCM-verified (Chromium `studioBusTempoBrowser`): MIDI dry peak 0.303 → bypassed bus send 0.517 → highpass-2000 bus 0.302 (send filtered out, dry untouched).

## 2. Tempo map — DONE
- `multitrackTempoMap.js` (new): points {beat, bpm, beatsPerBar}, sorted/deduped/anchored at beat 0; `beatsToSeconds`/`secondsToBeats` piecewise-exact (round-trip <1e-9, boundary-exact at segment joins), `tempoPointAtBeat/Seconds`, `barAtBeat`.
- `multitrackProject.js`: `project.tempoMap` normalized on load; constant-tempo v2 projects migrate to a single point at `project.tempo` (unit-tested).
- Uses: grid snap (`snapMultitrackTime` snaps in beat domain when a map is passed — follows tempo changes), SMF export writes per-point tempo + time-signature metas and converts note seconds via the map; SMF import rebuilds the map from tempo/signature metas. Round-trip unit-tested (note at 4 s across a 120→60 change returns at 4.00 s, sig 3 preserved). No metronome/count-in exists in the Studio, so nothing to wire there.

## 3. Asset-store wiring — DONE (additive, no save-path change)
- `multitrackAssetWiring.js` (new), bound in `multitrack/index.js` beside the existing bindings. Existing autosave/library/archive code untouched.
- On project change (debounced, serialized): claim a revision, then dedupe every project source buffer's PCM into `MultitrackAssetStore` by content hash; a localStorage manifest maps bufferId → {assetId, channels, length, rate, name}.
- On workstation init: hydrate missing runtime buffers from the store when an AudioContext exists. Missing store entry = cache miss reported in the result, never an error — embedded archive bytes remain authoritative (unit + Chromium forced-reload tests: fresh runtime store + same IndexedDB hydrates PCM-exact).
- Multi-tab guard: `createProjectRevisionGuard` (localStorage, per-tab id, monotonic per-project revision); a superseded tab pauses mirroring and reports once via status instead of overwriting.
- Chromium `studioAssetSmokeBrowser` PASS: dedupe → forced reload → hydrate 1 source PCM-exact.

## 4. Screenshot matrix — DONE, no defects found
- Production page at 360/390/768/1024/1440 (shots/ in this folder): start gate clean at all widths; after clicking Start, interior renders keys/labels/scrollbar cleanly at 360 and 1440 (personally inspected). Page scrollWidth == innerWidth at every width (no page-level horizontal overflow). The piano keyboard strip extends beyond the viewport INSIDE its own scroll container (visible scrollbar) — by design, not a defect. No CSS fixes needed.
- Flake: the 390 interior capture did not complete once under load ~31 (gate shot is clean); 390 interior not re-captured.

## 5. Production workflow smoke — DONE (Chromium, production origin)
- `studioAssetSmokeBrowser` PASS: build/record notes → arrange region → mix (gain/pan/automation/bus insert/tempo map) → asset dedupe + reload-hydrate → save named project to the real library → list → load → unpack (title, bus insert, tempo map all restored) → delete → offline render → 24-bit WAV inspected programmatically: RIFF/WAVE, 24-bit, 44100 Hz, 2 ch, 2.55 s, peak 0.623.

## Verification
- New unit tests: multitrackTranche4 (10). Full suite: **371/371 pass** (361 baseline + 10), concurrency 4.
- Chromium fixtures PASS: studioBusTempoBrowser (new), studioAssetSmokeBrowser (new), studioMidiBrowser, studioNleBrowser, studioMixBrowser, studioArrangementBrowser, studioEffectRoutingBrowser.
- studioFreezeBrowser: NOT re-verified this tranche — it stays RUNNING >160 s under current server load. A/B proof it is not a tranche-4 regression: with the schedule file temporarily restored to HEAD (pre-tranche-4) it also stayed RUNNING >160 s; my version was restored afterwards. Tranche 3 verified it PASS in a calmer window; calm-window re-run still owed.
- Production 200: /apps/piano/ and all three new modules. New files chmod 644.

## Deployment / rollback
- Production serves the working tree directly; no BH.sh. Path-scoped commit + push to main.
- Rollback: `git revert <this session's commit>`.

## Honest remains
- Freeze fixture calm-window re-run; 390px interior screenshot re-capture.
- Asset wiring is an additive mirror/hydration layer — embedded archives remain the save format of record (deliberate: zero save-path regression risk). Full migration of saves to asset references is a future tranche.
- Tempo map has no dedicated UI editor yet (model + grid + SMF + persistence are live; points are set via project data/SMF import).
- No physical-device/Firefox/WebKit pass yet.
