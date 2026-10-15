# B"H — Compiler API (geelooy/api/compiler/)

Server-side build API: turns source into artifacts through authenticated,
rate-limited backend vessels. Never emits placeholder bytes for unavailable
backends or artifacts.

## Contents
- `_awtsmoos.derech.js` — routes: `/android/rebbe`, `/backends`, `/build`
- `DOCUMENTATION.md` — full docs + pointers to `docs/API/OTHER_FAMILIES.md`
- `core/` — auth, body parsing, handlers, build-lease limiter, service loader,
  serializer, and the source-owned Rebbe Responsa APK builder.

## Endpoints
- `/build` — guarded native build (auth + build lease required).
- `/backends` — authenticated compiler backend discovery.
- `/android/rebbe` — build the source-owned Rebbe Android package.

See also `core/README.md`.
