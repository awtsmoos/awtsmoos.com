# B"H — Platform API (geelooy/api/platform/)

Read-only platform-level product metadata. Manifest responses are built only
from verified server products — no account state, no mutation capability, and
no browser-authored pricing or identity testimony.

## Contents
- `_awtsmoos.derech.js` — route: `/manifest` (GET parameters projected from query).
- `productManifest.js` — builds the standards-shaped install metadata response.
- `installableProductDirectory.js` — the shared directory of routes proven to
  be installable products.
- `productManifest.test.js` — node test for the manifest builder.
