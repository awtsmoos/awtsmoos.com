# B"H — Awtsmoos Glyph Lab

Boruch Hashem. Blessed is He.

The Awtsmoos brings Hebrew light from hidden code to sight;
Awtsmoos.com tests the measurable cost of that delight.

## Build & test

Native Node.js, no npm installation required:

```sh
node ayzarim/glyph-engine/build.cjs
node --test ayzarim/glyph-engine/font.test.cjs
```

The builder reads `ayzarim/glyph-engine/source/NotoSansHebrew-Regular.ttf` (SIL Open Font License 1.1) and writes TTF, WOFF1, randomized encoded fixtures and synthetic benchmark JSON into `geelooy/tests/glyph-engine/`.

The site test URL is `/tests/glyph-engine/` wherever the existing static server serves `geelooy`.

This native font experiment includes TrueType table/checksum writing, WOFF1 zlib compression, randomized code-point aliases for the Hebrew alphabet/finals, and three distinct geometrically clipped Aleph glyphs, RTL word-run presentation, and measured font-inclusive first-visit and cached-bandwidth comparisons.

**Limitations:** Obfuscation is not encryption. Font analysis, OCR and visual recognition can recover content. Copy, screen readers, normal Hebrew bidi with punctuation, niqqud and cantillation are not fully supported. Only Aleph is genuinely fragmented; the rest of the supported alphabet uses whole-glyph substitutions. These are synthetic benchmarks, not real-user network timings.

The font source is Noto Sans Hebrew, licensed under SIL OFL 1.1. Preserve the relevant original font credits and license when redistributing it. For the authoritative license see [Noto Fonts](https://github.com/notofonts/noto-fonts).
