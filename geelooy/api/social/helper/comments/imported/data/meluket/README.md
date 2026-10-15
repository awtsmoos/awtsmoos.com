# B"H — Meluket Imported Posts (geelooy/api/social/helper/comments/imported/data/meluket/)

The Meluket imported corpus data.

- `manifest.json` — index of the corpus.
- `posts/` — 218 JSON files, one per imported post (hash-named).

Consumed by `../adapters/corpusAdapter.js`, `../postResolver.js`, and `../meluketMap.js` to serve imported comment trees through the normal comment routes.
