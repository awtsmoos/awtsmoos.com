# B"H — APK Web API (geelooy/api/apk-web/)

Generic APK web publication gate.

## Contents
- `_awtsmoos.derech.js` — route mount: `publish`, `asset/:token/:path*`
- `core/` — internal helpers: `handlers.js`, `mime.js`, `store.js`, `validation.js`

## What it does
Publishes an APK's web bundle through a measured, validated gate and then serves
its assets back out under signed token URLs (`asset/:token/:path*`), keeping app
identity outside the scheme.

## Endpoints
- `publish` — accept and validate an APK web bundle for publication.
- `asset/:token/:path*` — serve a published bundle asset for a valid token.
