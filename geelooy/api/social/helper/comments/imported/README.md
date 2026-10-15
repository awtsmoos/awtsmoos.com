# B"H — Imported Comments (geelooy/api/social/helper/comments/imported/)

Imported external comment corpora (Meluket, Sichos Kodesh) adapted into the social comment system.

## Files
- `CHASSIDUS_PUBLISH_README.md` — notes on the Chassidus publish flow for imported content.
- `orchestrator.js`, `registry.js` — orchestrate and register imported corpora.
- `adapters/` — source adapters: `bundleAdapter`, `corpusAdapter`, `legacyAdapter`, `shardAdapter`.
- `bundleStore.js`, `cache.js`, `dbPool.js` — storage and caching for imported data.
- `normalizer.js`, `text.js`, `meluketMap.js`, `postResolver.js` — normalize text and resolve posts to corpus entries.
- `data/` — the corpora themselves: `meluket/` (manifest + 218 post JSONs) and `sichosKodesh/` (manifest + 283 post JSONs), one JSON file per imported post.
- `test/` — `federationCore.test.js`.

## What it does
Ingests third-party comment corpora, normalizes and maps them to social posts, and serves them through the same comment-tree reads as native comments.
