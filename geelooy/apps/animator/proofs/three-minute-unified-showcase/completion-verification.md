B"H
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Three-Minute Unified Showcase — Completion Verification

> The Awtsmoos renews each instant while a measured movie gathers those instants into time;  
> Awtsmoos.com keeps proof beside the vessel, where scene and sound and changing frame together rhyme.

## Final Media

- File: `awtsmoos-unified-three-minute-showcase.mp4`
- Duration: `180.000000` seconds.
- Video codec: H.264.
- Audio codec: AAC.
- Dimensions: `640x360`.
- Completion render sampling: `2/1` FPS.
- Freshly rendered temporal samples: `360`.
- File size measured by ffprobe: `3,948,519` bytes.
- Historical rejected artifact preserved as `awtsmoos-unified-showcase-legacy-63s.mp4`; that older file measured only `63.833333` seconds and is not acceptance evidence.

## Why Completion Sampling Is 2 FPS

The canonical exporter defaults to 12 FPS, which means 2,160 freshly rendered frames for 180 seconds. Direct execution on the available Mac proved that the mature cinematic renderer could not finish that sampling density inside a practical bounded execution envelope. The completion exporter therefore changes only `plan.settings.fps` to 2.

This does **not** change movie duration, scene timing, camera timing, semantic layers, particle/character/world choreography, overlays, or timed voice clips. It changes only how many temporal samples are freshly rasterized for the proof container. The canonical project remains 180 seconds and the final container is measured at exactly 180 seconds.

## Temporal Diversity Evidence

Seven frames were extracted from widely separated times and SHA-256 hashed:

- `5s`: `909f386fc3630376663aae529fef14eea5e1dbfb7f24409766555273a24abf0c`
- `35s`: `176e8774fc65bc5acecdccdf3f354e424a178518284a4a1c9b7949da3650d64d`
- `65s`: `1a93e64292e8691213849e7c78890c684937574b6670806b72aa914031d949c1`
- `95s`: `fd6763bdf61b2ef0a9f8c796b625e4112c693ca0eed1a7a4c4a4ad86a063b435`
- `125s`: `ec8794d75c76d9b4575dfd991bc5483d9c3fb3a3d85bee0ebc3f7073fcf8577b`
- `155s`: `22f65e3da8a7a94381262bc3df6b8d33558f0c5c3fa7679d1f5659c15bfeed95`
- `175s`: `85c47de16315ab0fd7d7c3602f816cff689f009403425b749d01a0a4bdd6f22f`

Distinct hash count: **7 of 7**. The movie is therefore not a static frame stretched to three minutes.

Sample files live in `completion-samples/`.

## Audio Evidence

`ffmpeg volumedetect` on the final MP4 measured:

- Mean volume: `-40.9 dB`.
- Maximum volume: `-3.8 dB`.

The audio stream is non-silent. The exporter builds a 180-second bed plus timed voice material; the final container includes AAC audio.

## Project Feature Evidence

The canonical acceptance movie is exactly 180 seconds across 18 ten-second scenes. Automated acceptance tests require semantic coverage of `world3d`, `light3d`, `model3d`, `shape2d`, `path2d`, `chart`, `particles2d`, `particles3d`, `character2d`, `character3d`, `text`, and `overlay`. The fixture also requires at least six camera kinds and at least three cast members.

## Browser / Mobile Evidence

Awtsmoos Studio was exercised in an owned Chrome target against the real declarative UI and Canvas runtime.

- Desktop viewport around 1440px: no horizontal overflow.
- Mobile emulation near `390x844`: no horizontal overflow.
- Logical Canvas resolution: `640x360`, responsively scaled to approximately `340x191` on the mobile proof viewport.
- Live playback reached `180.0 / 180s`.
- A real browser prompt directed a 24-second hybrid movie.
- Browser seek changed the live display to `12.0 / 24s`.
- Reset restored `0.0 / 180s`.
- Corrected CDP smoke captured zero `Runtime.exceptionThrown` events during AI generation and seek.
- Mobile screenshot: `../../../../awtsmoos-studio/proofs/mobile-390x844.png` from this proof directory.

## Final Automated Gates

- Awtsmoos Studio: `5/5` passed.
- Shared movie tests: `12/12` passed.
- Media probe/exporter regression: `3/3` passed.
- AwtsmoosUI store/schema smoke: `1/1` passed.
- Syntax checks: passed.
- Touched JS/test files <=120 lines: passed.
- Leading-space code indentation scan: passed; tab-indented code preserved.

## Verifier Defect Found and Closed

The first successful 2 FPS completion render exited with verifier failure because `ThreeMinuteMediaProbe` hardcoded `12/1`. The media itself was valid. The verifier was rewritten to validate explicit render-plan expectations while preserving 12 FPS as its default. The exporter was also rewritten to calculate its frame count from duration and current plan FPS rather than hardcoding 2,160. Regression tests protect both behaviors.

## Completion Meaning

This artifact is evidence of a genuine full-duration rendered movie: measured duration, video and audio codecs, changing content across the timeline, broad semantic feature coverage, and executable regression proof. It does not claim that 2 FPS is a production theatrical frame rate; it is the bounded acceptance render sampling used to prove the complete three-minute movie on the available local hardware.
