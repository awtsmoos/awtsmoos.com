# B"H — API Core Catalog (geelooy/api/core/)

Shared catalog data used for API discovery. Not an HTTP route family itself.

## Files
- `ApiFamilyCatalog.js` — transforms the stable top-level family tuples into a
  discoverable API catalog response (read-only: never mounts, calls, or owns a family).
- `ApiFamilyCatalogData.js` — the underlying family data (`CHOCHMAH_API_FAMILIES`).
- `LegacyApiDemoRoutes.js` — legacy/demo route shapes for reference.
