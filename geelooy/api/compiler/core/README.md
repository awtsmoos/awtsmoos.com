# B"H — Compiler Core (geelooy/api/compiler/core/)

Internals behind the compiler API (see `../README.md`).

## Files
- `handlers.js` — joins auth, build discovery, guarded builds, and the Rebbe APK into one boundary.
- `auth.js` / `body.js` — request authorization and body parsing.
- `limiter.js` — build leases / concurrency limits so builds can't stampede.
- `serviceLoader.js` — loads the compiler backend services.
- `serializer.js` — build-result response shaping.
- `rebbeApkHandler.js` — builds the source-owned Rebbe Responsa APK behind compiler security.
- `rebbeApkHandler.test.mjs` — node test for the Rebbe APK handler.
