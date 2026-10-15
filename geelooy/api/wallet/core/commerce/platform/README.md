# B"H — Commerce Platform (geelooy/api/wallet/core/commerce/platform/)

Product directory and route manifests for apps/games sold through commerce.

Files:
- `productDirectory.js`, `productDiscovery.js` — listing and discovering products
- `productManifest.js`, `productRouteManifest.js` — product + route manifests
- `productAppRoutes.js`, `productGameRoutes.js` — app/game-specific route tables

Feeds the `commerce/products` route and platform readiness checks
(`tests/platformCommerceCoverage.test.js`, `tests/platformReadiness.test.js`).
