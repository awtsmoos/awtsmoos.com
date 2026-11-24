//B"H
# Great Reinvention — Freeze / Buses / True-Peak / Piano-Roll / Asset-Store ledger 2026-11-25T0245 (Asia/Saigon)

Baseline: commit 7c1645afe, suite 347/347. Other sessions' dirty tree preserved; path-scoped commit only.

## 1. Track freeze/unfreeze — DONE, PCM bit-exact
- `multitrackFreeze.js`: snapshot of clips/MIDI/effects/automation/gain/pan/kind sleeps in `track.frozen`; freeze swaps content to the single rendered clip; `unfreezeTrack` restores the snapshot exactly (unit deep-equal). `effectivePlaybackTrack` plays a frozen track at unity (gain/pan/EQ/automation already baked) while mute/solo stay live gates.
- `multitrackFreezeRender.js`: renders exactly one track through the shared offline mix (same signal as export), registers the render via new `MultitrackAudioStore.setBuffer`.
- `multitrackFreezeControls.js`: Freeze/Unfreeze panel mounted in the Studio beside the piano roll.
- Real bug found+fixed: project archives neither packed nor remapped frozen-snapshot sources — `multitrackProjectArchive.js` now packs snapshot clip sources, validates their references, and remaps `frozen.bufferId` + snapshot clip bufferIds on unpack (unit-tested).
- Chromium fixture `studioFreezeBrowser.html`: frozen render vs original render max PCM diff **0.00e+0** (bit-exact, gain .5 + pan −.3 + mid EQ +5 baked).

## 2. Buses & sends — DONE
- `multitrackBus.js`: buses (`project.buses`) + per-track/per-bus sends, normalization (dedupe per bus, gain clamp), `validateBusGraph` — unknown targets, self-sends and bus cycles rejected (DFS, unit-tested).
- Routing in `multitrackPlaybackSchedule.js` (shared live/offline path): bus gain nodes to destination, bus→bus taps, track sends tapped post-gain/pre-pan in parallel with the master path; invalid graph throws before scheduling.
- Fixture: dry peak 0.303 → 0.517 with a 0.5 send into a unity bus.

## 3. True-peak limiting — DONE, honestly labeled estimator-based
- `multitrackTruePeakLimiter.js`: 4× Catmull-Rom oversampled inter-sample detection, lookahead (5 ms) gain envelope with exponential release, re-measure + second pass. Labeled estimator-based, not certified BS.1770.
- Verified on a hidden-peak signal (fs/8 sine, phase π/8: sample peak 0.878, true ≈0.95): unit + Chromium — **−0.52 → −1.00 dBTP** at a −1 dBTP ceiling; quiet signals pass bit-identical; full-scale stereo tamed.
- Estimator limit found honestly: at fs/4 the cubic estimator under-reads (0.84 vs 0.95 true) — documented; test signals use fs/8 where the estimator is accurate.
- Mastering: new "Master WAV TP-limit (−1 dBTP)" button + `exportTruePeakLimitedMix` reporting before/after dBTP and max gain reduction.

## 4. Piano roll — DONE
- Marquee multi-note selection (Shift-drag; `multitrackPianoRollSelection.js` pure geometry, unit-tested): selection drives delete/duplicate/velocity/multi-note drag.
- Controller lane under the roll: sustain blocks rendered, modulation points shown and click-added (`addMidiControllerPoint`, step-held `midiControllerValueAt`, persisted in region JSON + normalization-tested). Styles appended to the existing multitrackTimeline.css (no new sheet; fixture isolation counts unchanged).

## 5. IndexedDB asset store — ADDITIVE MODULE ONLY (by design)
- `multitrackAssetStore.js`: content-addressed (FNV-1a hash + length), deduplication, reference counting, GC at zero refs, quota-visible `totalBytes`; IndexedDB backend in browsers, in-memory backend with identical semantics elsewhere (unit-tested).
- NOT wired into live library/autosave/archive paths — existing saves untouched, zero migration risk. Wiring is a future tranche.

## Verification
- New unit tests: multitrackFreezeBus (6), multitrackTruePeakLimiter (4), multitrackPianoRollExtras (4) = 14/14.
- Full suite: **361/361 pass** (347 baseline + 14), concurrency 4.
- Chromium fixtures PASS: studioFreezeBrowser (new), studioMidiBrowser, studioNleBrowser, studioMixBrowser, studioArrangementBrowser, studioEffectRoutingBrowser (20s-timeout runner copy; repo runner unchanged).
- New files chmod 644 (publicAssetPermissions test caught 640 from scp; fixed and passing).

## Deployment / rollback
- Production serves the working tree directly; no BH.sh. Path-scoped commit + push to main.
- Rollback: `git revert <this session's commit>`.

## Honest remains
- Sends are post-gain/pre-pan parallel taps; no bus effect inserts yet (bus = gain vessel), no track freeze for the >128-clip lookahead live path (offline/shared schedule path verified).
- Asset store unwired from live saves; no tempo map, drum patterns, physical-device/Firefox/WebKit passes.
