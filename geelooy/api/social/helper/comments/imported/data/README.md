# B"H — Imported Comment Data (geelooy/api/social/helper/comments/imported/data/)

Raw imported comment corpora, one directory per corpus.

## Contents
- `meluket/` — Meluket corpus: `manifest.json` + `posts/` (218 post JSON files, one per post).
- `sichosKodesh/` — Sichos Kodesh corpus: `manifest.json` + `posts/` (283 post JSON files, one per post).

The manifests index the post files; `../meluketMap.js` and `../postResolver.js` map social posts to these corpus entries.
