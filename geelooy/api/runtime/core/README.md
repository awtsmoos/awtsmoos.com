# B"H — Runtime Core (geelooy/api/runtime/core/)

Internals behind the native runtime API (see `../README.md`).

## Files
- `handlers.js` — joins authenticated capability, launch, status, and stop
  routes into one service boundary.
- `auth.js` — authorizes each runtime request.
- `body.js` — request body parsing.
- `serviceLoader.js` — loads the runtime service / native adapter.
