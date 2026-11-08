<!--B"H-->
# Protected Text — ephemeral key-exchange demo

A test page at `/protected-text/` with a real client + server implementation.
It demonstrates the protection design discussed for text that should not be
rebuildable from a network recording.

## How it works

1. The browser generates a fresh ephemeral ECDH P-256 keypair per visit and
   sends only its **public** key to the server.
2. The server generates a fresh ephemeral keypair, derives the shared secret,
   runs HKDF-SHA256 to a 256-bit session key, and returns only its **public**
   key plus a random session id. The key lives in server memory only
   (in-memory Map, 10-minute expiry) and as a non-extractable WebCrypto key
   in the browser. It is never sent, never logged, never written to disk.
3. The sample text is encrypted with AES-256-GCM (fresh IV per call) and
   served as ciphertext. The browser decrypts in memory and draws the text
   onto `<canvas>` only — the readable text never enters the DOM.
4. Second layer: a **fresh random glyph permutation per session**. The server
   rewrites the base font's cmap (see `services/ProtectedTextFont.js`), serves
   the permuted font encrypted with the session key, and pre-permutes the text
   with the inverse permutation. Permuted text + permuted font renders the
   original. Hebrew permutes only among Hebrew letters and Latin only among
   Latin, so bidi rendering stays identical to the original.
5. `POST /rotate` re-derives the session key from the same shared secret with
   a new HKDF info string; the old key stops opening anything new.

## Endpoints

- `GET /api/protected-text/` — service status (no key material).
- `POST /api/protected-text/exchange` `{ clientPublicKey }` →
  `{ sessionId, serverPublicKey, fontLayer }`.
- `GET /api/protected-text/content?session=<id>` →
  `{ iv, ciphertext, tag, fontIv, fontCiphertext, fontTag, rotation, fontLayer }`.
- `POST /api/protected-text/rotate` `{ sessionId }` → `{ rotation }`.

## Honest limits

- A screenshot can still be read. Pixels must be correct for the reader, so
  no design stops that. This stops the quiet bulk attack: recording everything
  the browser downloads and rebuilding the text from it later.
- A live debugger can read the decrypted text out of browser memory at render
  time. The key is still safe (non-extractable), and the recording is still
  useless — but a patient human with DevTools open wins eventually.
- If the base font cannot be read, the demo runs on the encryption layer
  alone (`fontLayer: false`) and says so on the page.

## Files

- `_awtsmoos.derech.js` — thin route facade (follows the `geelooy/api/*`
  derech pattern).
- `services/ProtectedTextService.js` — ECDH + HKDF + AES-GCM + sessions.
- `services/ProtectedTextFont.js` — per-session font permutation.
- `services/../vendor/opentype.js` — vendored opentype.js 2.0.0 (MIT), used
  only to rewrite the font cmap.
- `fonts/base.ttf` — Taamey Frank CLM Medium, from the Culmus Project
  (the same family chabad.ai serves). It covers Hebrew, Latin, vowels and
  punctuation, which the demo needs in one font.
- `test/protectedText.test.cjs` — `node --test`: full browser-flow simulation
  in Node WebCrypto, glyph-sequence proof, rotation, failure cases.
- Page: `geelooy/protected-text/index.html` (self-contained, no site assets).
