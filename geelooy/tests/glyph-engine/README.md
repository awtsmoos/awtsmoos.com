# B"H — Awtsmoos Glyph Lab v2

Boruch Hashem. Blessed is He.

The Awtsmoos brings Hebrew light from hidden code to sight;
Awtsmoos.com measures both the cleverness and the cost of flight.

## Native build

```sh
node ayzarim/glyph-engine/build.cjs
node --test ayzarim/glyph-engine/font.test.cjs
node ayzarim/glyph-engine/attack-audit.cjs
```

No npm, Python, TypeScript, or server-supplied client-side decoder required. The generator uses the source `NotoSansHebrew-Regular.ttf` licensed under the SIL Open Font License 1.1, and writes randomized generated TTF, WOFF1, encoded fixtures, and synthetic Brotli benchmarks to `geelooy/tests/glyph-engine/`.

## Experimental abilities

- 27 Hebrew letters/finals fragmented into 2–4 independently addressable `glyf` outlines (78 new outlines total).
- TrueType simple and multi-contour parsing, quadratic curve approximation, vertical clipping, 32-bit table alignment, full-font checksum.
- Four randomized private-use aliases per original glyph and each fragment, totaling 432 cmap aliases.
- Cryptographic random selection independently for every fragment occurrence, plus randomized per-build alias codes.
- Word-run RTL display by browser's native font engine. Aleph remains a genuine three-piece glyph.
- Benchmarks for 100/1,000/5,000/20,000 synthetic words including fresh WOFF1 and cached font costs.
- Deliberately adversarial `cmap` attack showing alias groups can be recovered without OCR.

## Security truth

This is obfuscation, not encryption, DRM, confidentiality, or reliable access control. The original source outlines remain in the downloadable font, and even the fragmented outlines expose visual geometry and their `cmap` glyph IDs. An attacker can group identical glyph IDs and visually/OCR-match contours to Hebrew. Word boundaries, punctuation, lengths and some statistics remain visible. Generated aliases and fragmentation increase data transfer cost substantially versus ordinary Hebrew+Brotli. Text-selection and screen-reader accessibility, general Unicode bidirectionality, niqqud and cantillation are not fully supported. No production-protection claims may rely on this experimental font.

See [Noto Fonts OFL](https://github.com/notofonts/noto-fonts) for the original font licensing obligations.
