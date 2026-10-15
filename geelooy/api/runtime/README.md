# B"H — Native Runtime API (geelooy/api/runtime/)

Lets browser intent meet native capability through explicit launch, status,
stop, and capability-discovery gates. Kept separate from Tunnel transport;
never exposes a shell command, arbitrary environment, or module path.

## Contents
- `_awtsmoos.derech.js` — routes: `/native/capabilities`, `/native/launch`,
  `/native/status`, `/native/stop`
- `DOCUMENTATION.md` — full docs + Geelooy OS / developer-tools pointers.
- `core/` — auth, body parsing, handlers, service loader.

## Endpoints
- `/native/capabilities` — authenticated capability discovery.
- `/native/launch` — launch a native process behind the capability gate.
- `/native/status` — status of a running native process record.
- `/native/stop` — stop it.
