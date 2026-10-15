# B"H — Ohr HaGnuz Auth (geelooy/api/ohr-hagnuz/auth/)

Game ticket authentication internals (see `../README.md`).

## Files
- `GameTicketIssuer.js` — mints a one-use online-journey ticket for an
  authenticated account once identity, origin, slot, and protocol agree.
- `GameTicketClaims.js` — claim shapes and the game protocol version.
- `GameTicketStore.js` — ticket persistence (issue, spend-once semantics).
- `GameTicketStore.test.cjs` — node test for the ticket store.
