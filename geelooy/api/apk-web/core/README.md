# B"H — APK Web Core (geelooy/api/apk-web/core/)

Internal machinery behind the APK web publication gate (see `../README.md`).

## Files
- `handlers.js` — `publishApkWebBundle` / `serveApkWebAsset` used by the route mount.
- `mime.js` — content-type mapping for served bundle assets.
- `store.js` — persistence of published bundles and their asset tokens.
- `validation.js` — bundle shape and token validation before anything is served.
