# B"H

# Evidence ledger

Root: `/Users/awtsmoos/work/awtsmoos.com/.ai-thoughts/20260727-180405-animator-production-sitcom-takeover`

## Checkout

- 2026-07-27 18:04:05 -0700
- Command: `git status --short -- geelooy/apps/animator`
- Exit 0; clean Animator subtree; accepted as isolated baseline.

## Final character render

- Artifact time: 2026-07-27 19:57:12 -0700
- Command: `AWTSMOOS_REFERENCE_CHROME_PORT=9223 AWTSMOOS_REFERENCE_STATIC_PROOF_DIR=<83_miriam_free_sleeve> node tools/verify/referenceTrioStaticProof.js`
- Exit 0; accepted.
- PNG: `83_miriam_free_sleeve/reference-trio.png`
- Crops: six Ari/Dovid/Miriam full-body and head PNGs in the same directory.
- Bounds/proof: `reference-trio-bounds.json` and `reference-trio-static-proof.json`.
- Canvas: 1536×864.
- SHA-256: `f599cf8fbf8bd02b276aea4dda0f02e54311f4057d679448cac8f6e403a48e55`.
- Reason: improved organic sleeve overlap, oval jaw, beard speech clearance,
  face-bound eyes, and Miriam's bowed free sleeve without animation regressions.

## Landmarks

- 2026-07-27 19:37:10 through 19:37:11 -0700
- Command: `AWTSMOOS_REFERENCE_LANDMARK_PROOF_DIR=<74_landmarks> node tools/verify/referenceTrioLandmarkProof.js`
- Exit 0; log `74_landmarks/landmark-proof.log`; accepted.
- Artifacts: `reference-trio-landmarks.json`, targets, deltas, and audit Markdown.
- Result: 3 characters, 42 point deltas, deterministic repeat.
- Independent `faceShellBox` remains separate from hair, beard, peyot, kippah,
  wrap, fringe, and bun.

## Mouth/phoneme matrix

- 2026-07-27 19:37:11 through 19:37:41 -0700
- Command: `AWTSMOOS_MOUTH_POSE_PROOF_DIR=<75_mouth_pose_matrix> node tools/verify/referenceTrioMouthPoseProof.js`
- Exit 0; log `75_mouth_pose_matrix/mouth-pose-proof.log`; accepted.
- Result: 3 characters × 20 poses = 60 frames and 60 unique hashes.
- Artifacts: `75_mouth_pose_matrix/*.png` and `mouth-pose-sheet.json`.
- Closure, vowels, teeth, tongue, smile, frown, laugh, shout, and whisper remain
  character-specific and beard-readable.

## Desktop/mobile studio

- Final artifact time: 2026-07-27 19:53:33 -0700
- Commands: `node tools/verify/nleResponsiveEditingSmoke.js`;
  `node tools/verify/nleProfessionalEditingSmoke.js`;
  `node tools/verify/studioResponsiveBrowserSmoke.js`;
  `node tools/verify/studioResponsiveVisualProof.js <81_mobile_nle_seal_repair>`.
- Exits 0; automated log `82_final_gate/all-proof.log`; accepted.
- Artifacts: `81_mobile_nle_seal_repair/studio-desktop.png` and
  `81_mobile_nle_seal_repair/studio-mobile.png`.
- Hashes: desktop `3d18434b66c2c6a1136b6ba112f46f17579a2c353c9979ca743095223c51b84e`;
  mobile `b52a4edb5bb68274541918c1df63efc345856b9f5b086a77eab5e11870a68749`.
- Browser facts: 59 asset cards; 6 transforms; desktop canvas ratio 1.777833;
  mobile ratio 1.777778; desktop timeline 279 px; mobile baseline 254.8 px.
- Live browser diagnosis rejected pass 79 after measuring zero-height tracks caused
  by an inline 28 px seal. Pass 81 visibly proves the authoritative ruler, lanes,
  clips, playhead, and touch actions fill the mobile overlay.

## Complete automated gate

- 2026-07-27 19:55:10 through 19:55:42 -0700
- Exact order: `npm run verify:imports`; `referenceTrioSmoke.js`;
  `referenceTrioDurabilitySmoke.js`; `realisticLipSyncSmoke.js`;
  `facialExpressionMatrixSmoke.js`; `npm run verify:fast`;
  `proceduralSitcomCatalogSmoke.js`; `nleResponsiveEditingSmoke.js`;
  `nleProfessionalEditingSmoke.js`; `studioResponsiveBrowserSmoke.js`.
- Exit 0; log `82_final_gate/all-proof.log`; accepted.
- Results: 2200 imports and 0 missing; trio, durability/save-reload, realistic
  lip sync, expression matrix, fast syntax, responsive NLE, professional NLE,
  and responsive browser passed.
- Procedural result: 43 objects, 7 categories, 15 generators, 59 entities.

## Final MP4 parity

- 2026-07-27 19:57:35 through 19:59:08 -0700
- Command: `AWTSMOOS_CDP_ORIGIN=http://127.0.0.1:9223 AWTSMOOS_REFERENCE_EXPORT_PROOF_DIR=<84_export_parity_final_art> node tools/verify/referenceTrioBrowserExportProof.js`
- Exit 0; log/report in `84_export_parity_final_art`; accepted.
- MP4: `reference-trio-browser-proof.mp4`; SHA-256
  `a095d4bc66d6228ed422e4af5811d18a7b7f514972ffbcbd576f2585e1619590`.
- Preview SHA-256 exactly equals static PNG:
  `f599cf8fbf8bd02b276aea4dda0f02e54311f4057d679448cac8f6e403a48e55`.
- MP4: 2,513,032 bytes; H.264 1536×864; 24 fps; 144 frames;
  AAC 48 kHz stereo; 6.08 seconds; no exceptions or severe logs.
- Decoded proof: `decoded-frame-000.png`, `decoded-frame-072.png`,
  `decoded-frame-132.png`, and `decoded-ffprobe.json`.

## File audit

- Commands: `node --check`, `wc -l`, tab/leading-space audit, final-newline
  byte audit, required header/meditation audit, and `shasum -a 256`.
- Exit 0; 58 Animator files; all at or below 120 lines; syntax, required B"H
  headers, Awtsmoos.com meditations, tabs, and final newlines valid.
- Hash ledger: `82_final_gate/source-hashes.sha256`.
