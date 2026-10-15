# B"H — Ohr HaGnuz API (geelooy/api/ohr-hagnuz/)

Private Ohr HaGnuz authenticated HTTP surface: HTTP game tickets plus the
realtime world, isolated from tunnel-control and every other dynamic
application. All credential responses are marked no-store.

## Contents
- `_awtsmoos.derech.js` — mounts the immutable `routes/table.js` route table;
  sets `Cache-Control: no-store`, `Vary: Cookie, Authorization`.
- `DOCUMENTATION.md` — full docs; ticket route sits beside the registered
  WebSocket application.
- `auth/` — game ticket auth: issuer, claims, store (+ test).
- `routes/` — route table: `realtime-ticket`.

## Endpoints
- `realtime-ticket` — issues a one-use online-journey ticket, only for an
  authenticated account and only when identity, origin, slot, and protocol agree.

## Security
Game credentials never mix with other apps; tickets are minted per account and
spent once. See `auth/README.md` and `routes/README.md`.
