# B"H — Awtsmoos Glyph Lab v2 & Session Lab v3

Boruch Hashem. Blessed is He.

The Awtsmoos sustains each letter from nothing every instant;
Awtsmoos.com tests the proof of its typography rather than promises.

## v2 — Stable experimental font

`/tests/glyph-engine/` preserves the original public experiment. Build it with native Node.js:

```sh
node ayzarim/glyph-engine/build.cjs
node --test ayzarim/glyph-engine/font.test.cjs
node ayzarim/glyph-engine/attack-audit.cjs
```

All 27 Hebrew letters and final forms use 2–4 independent TrueType glyf outlines, with 78 new fragments and 432 randomized aliases. Fragment decomposition changes native text selection and increases bandwidth. Original source font Noto Sans Hebrew is SIL OFL 1.1.

## v3 — Per-session fonts and natural RTL

`/tests/glyph-engine/session.html` calls two new server-only endpoints:

- `GET /api/glyph-lab/session` sets a Secure, HttpOnly, SameSite=Strict, short-lived cookie and responds with a manifest of **encoded PUA letter tokens**, never the original Hebrew passage or source mapping.
- `GET /api/glyph-lab/font` serves a matching WOFF1 only with the correct cookie. All responses are `no-store`, `Vary: Cookie`, `nosniff`.

A server-only HMAC keyed by a per-process secret (or `AWTSMOOS_GLYPH_SECRET`) mixes session ID, document ID, position, occurrence count and fragment index. 24 alternative PUA aliases for each fragment allow identical words and letters to have different source encodings, for 1,944 mappings and 81 shufflable outlines. Original whole Hebrew glyphs are removed from the per-session font. Cache holds at most 32 sessions for ten minutes; a global 60 new-session/minute guard limits unbounded CPU use, but is **not per-IP rate limiting**.

Most importantly, v3 preserves *logical Hebrew letter order*. Each visible letter occupies an atomic inline unit with inner LTR fragments inside a true RTL word. It no longer reverses whole Hebrew words in JavaScript. Chrome verified the first visual letter is to the right of the second and a DOM Range can select both exactly, without dropping the first. **Native Android touch-handle behavior remains unverified on a real Android device**; multiple fragment characters can still create unexpected caret behavior on some browsers.

Run native Node.js tests (no additional dependencies):

```sh
node --test ayzarim/glyph-engine/{font,session,session-ingress}.test.cjs
node ayzarim/glyph-engine/session-benchmark.cjs
node ayzarim/glyph-engine/demo-server.cjs
# Mac Chrome CDP must be listening on port 9339:
node ayzarim/glyph-engine/browser-proof.cjs
```

## Critical security limitations

This is **obfuscation, not encryption, DRM, secrecy, or access control**. Anyone who can render text obtains the geometric glyphs and mapping. A font parser can group all 24 equivalent aliases by cmap glyph ID without OCR; public source-font matching or visual OCR can reconstruct Hebrew despite random aliases and shuffled IDs. Spaces, punctuation, word lengths, fragment count and document geometry remain observable. A per-session cookie limits accidental cross-session mixing, not an attacker who controls the same browser session. Changing the font every session prevents shared font-cache economies and increases CPU and transfer bandwidth.

Accessibility, copy-as-Hebrew, niqqud, cantillation and arbitrarily complex RTL punctuation are not fully supported. Synthetic transfer tests measure original UTF-8 Hebrew+Brotli versus randomized fragment PUA+Brotli both with cold font and cached font; **never claim a bandwidth win without data**. Source license: [Noto Fonts (SIL OFL-1.1)](https://github.com/notofonts/noto-fonts).
