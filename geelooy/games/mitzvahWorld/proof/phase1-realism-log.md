# B"H — Phase 1 realism log (2026-10-12)

## Changes
- `photoreal/js/reality-scene.mjs`
  - New `TOD` time-of-day preset table: `midday` / `golden` / `dusk` (+ night untouched).
    `midday` reproduces the exact pre-Phase-1 lighting values (renderer contract intact).
  - `buildRealityScene()` takes new opt `tod` (default `'midday'`).
  - Sky shader gains `uGolden`: warm horizon band + sun-disc bloom near sun azimuth.
  - New sun-glow additive billboard (1 extra draw call, no postprocessing chain).
  - Wind `gust` strength keyed to tod: midday 0.25 / golden 0.9 / dusk 1.3 / night 0.2.
- `photoreal/js/reality-particles.mjs`
  - `makePollen()` and `makeFallingLeaves()` accept `gust` (default 0 = old behavior exactly).
- `photoreal/reality.html`
  - Reads `?tod=` query param; shows it in the HUD.

## Verification (real evidence, no fakes)
- `node --input-type=module --check` passes on both edited modules.
- TOD table extracted from the real file and evaluated in node: all 3 presets have all
  required fields; unknown value falls back to midday; golden horizon blend 0.55,
  dusk 0.88; sun elevation golden 0.30 / dusk 0.13; exposures golden 1.18 / dusk 1.15.
- midday defaults byte-identical to pre-Phase-1 lighting values (sun [0.55,0.62,0.35],
  0xfff2dd/2.6, hemi 0xbdd8ee/0x5d6b46/0.85, fog 0xcfdfe8 70/300, exposure 1.12).
- Only caller of `buildRealityScene` (reality.html) updated; no other callers exist.
- NOT yet verified: pixel-level screenshot comparison. `/opt/meta-chromium/chrome`
  launches but writes no screenshot file in this environment (tried headless new/old,
  swiftshader, virtual-time-budget — exits 0, no PNG produced). A working browser
  render is needed for the acceptance screenshot + first-frame timing; flagging for
  the parent's browser-capable route.

## 2026-10-12 ~04:18 EDT: merkava-shot path evaluated and RULED OUT
- Ran `node merkava-shot.mjs --file .../photoreal/reality.html --out /tmp/merkava-reality.png`:
  completed in 4697ms, produced a 1280x800 / 5KB PNG. I viewed it: it is ONLY the
  static HTML shell (black background + "reality-photorealism ?" HUD text). The
  three.js WebGL scene is entirely absent — Merkava renders DOM layout + CSS only;
  page module scripts are never executed.
- The pipeline's WebGL "painter" (software/canvas-painter/webglWitness.js) does not
  execute GL: it paints a placeholder badge ("WEBGL CUBE", grid, swatches) unless
  `texture.glPixels` is supplied, and nothing in the pipeline produces real GL pixels.
- The 4697ms was shell-render time, not scene first-frame — meaningless for the
  ≤3s acceptance bar.
- CONCLUSION: merkava-shot.mjs cannot produce a real render of the Reality Engine.
  The only viable acceptance path is the parent's live browser (real Chromium with
  working WebGL): open reality.html?view=character-forest&fast=1&tod=golden, measure
  from navigation start to window.__realityReady === true, screenshot, review at
  full resolution.
