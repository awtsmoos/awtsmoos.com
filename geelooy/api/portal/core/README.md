# B"H — Portal Core (geelooy/api/portal/core/)

Read path behind the Portal routes (see `../README.md`).

## Files
- `PortalHttpHandlers.js` — route handlers: extracts bounded query values from
  the dynamic route context, delegates to the read service, and translates
  failures into portal error resources.
- `PortalReadService.js` — the domain read service: portal root, types,
  API-family discovery; free of HTTP transport details.
