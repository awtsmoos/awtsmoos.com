# B"H — Ohr HaGnuz Routes (geelooy/api/ohr-hagnuz/routes/)

Route declarations for the Ohr HaGnuz HTTP surface (see `../README.md`).

## Files
- `table.js` — the frozen route table: `realtime-ticket`. Every server door is
  declared as data, so mounting, testing, and docs consume the same table.
- `realtimeTicket.js` — the realtime ticket route handler.
