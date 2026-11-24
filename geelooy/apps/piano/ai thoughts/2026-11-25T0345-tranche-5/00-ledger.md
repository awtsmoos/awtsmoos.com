//B"H
# Great Reinvention — Tranche 5 ledger 2026-11-25T0345 (Asia/Saigon)

Baseline: HEAD 4c5e64c55 (tranche 4), suite 371/371. Closes both tranche-4 remainders. Other sessions' dirty tree preserved; path-scoped commit only.

## 1. Tempo-map UI editor — DONE
- `multitrackTempoMap.js`: pure point ops — `upsertTempoPoint` (add/replace same beat), `removeTempoPoint` (beat-0 anchor protected), `replaceTempoPoint` (anchor may change bpm/signature, never its beat).
- `multitrackTempoControls.js` (new): "𝄩 Tempo map" panel mounted in `multitrack/index.js` before the inspector, same pattern as markers/freeze panels. Lists every point as a row of numeric inputs (beat, bpm, beatsPerBar) + delete button (anchor: beat locked, no delete); add-point form (beat/bpm/beats-per-bar + button). Every action is one `state.setProject` = one history step; the anchor bpm also drives `project.tempo`. Map persists via the existing project model/archive normalization (unit-tested round-trip), and grid/SMF already consume the map.
- CSS: `.multitrack-tempo*` rules appended beside the marker rules in `styles/multitrackTimeline.css`.
- Unit tests: `test/multitrackTempoEditor.test.mjs` (4) — upsert/remove/replace semantics, project persistence, SMF shift prediction.
- Chromium fixture `test/studioTempoEditorBrowser.html` PASS (real `MultitrackStudioDaas` + the real panel, driven through its own DOM): constant-120 note-on tick 2880 → editor adds beat-4 @ 60 bpm/3-per-bar → tick 2400 exactly as `secondsToBeats` predicts; row edit to 30 bpm verified via `beatsToSeconds(map, 6) === 6`; Undo restores 60 bpm; delete removes the point; Undo restores it.

## 2. Freeze fixture + 390px interior — DONE (both tranche-4 debts closed)
- Server load was NOT calm (11.6 at start, 20.1 during the freeze run; threshold was <8). Per instructions: single attempt, no retry loop, using a generous-timeout copy of the fixture runner in /tmp (20s CDP timeout; repo runner unchanged — same approach as tranche G).
- `studioFreezeBrowser` PASS on that single attempt: `freeze-diff 0.00e+0 bus 0.303->0.517 limiter -0.52->-1.00 dBTP` — freeze remains bit-exact.
- 390px production screenshot captured (real production origin, clicked "Start Synthesizer", 580 key elements): `shots/shot-390-interior.png` in this folder, personally inspected — interior renders cleanly: keys with note names + shortcut labels legible, black keys labeled, menu button visible, keyboard strip scrolls inside its own container, `scrollWidth == innerWidth == 390` (no page overflow). No defects found, no CSS fix needed.

## Verification
- Full suite: **375/375 pass** (371 baseline + 4 new), concurrency 4.
- Chromium fixtures PASS: studioTempoEditorBrowser (new), studioFreezeBrowser, studioMidiBrowser, studioBusTempoBrowser.
- Production 200: /apps/piano/ (text/html), multitrackTempoControls.js + multitrackTempoMap.js (application/javascript), multitrackTimeline.css (text/css); served HTML contains zero `__awts_build`; permanent URL unchanged. New files chmod 644.

## Deployment / rollback
- Production serves the working tree directly; no BH.sh. Path-scoped commit + push to main.
- Rollback: `git revert <this session's commit>`.

## Honest remains
- Asset saves still use embedded archives as format of record (additive IndexedDB mirror/hydration only) — deliberate.
- Freeze is verified on the shared/offline schedule path; the >128-clip lookahead live path remains unverified for freeze.
- No physical-device/Firefox/WebKit pass yet (no such hardware/browser in this environment).
