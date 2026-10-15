# B"H — Wallet Commerce Core (geelooy/api/wallet/core/commerce/)

The commerce engine behind the `commerce/*` routes: catalogs, paid actions with
reversible execution, entitlements, purchase engine, product credits, receipts,
and SKUs.

Key files:
- `catalog.js`, `paidActionCatalog.js`, `creditPackCatalog.js`,
  `foundingServiceCatalog.js`, `supporterCatalog.js` — product/service catalogs
- `paidActionExecution{Start,Finish,Replay,Service,Store}.js` — reversible paid-action execution
- `purchaseEngine.js`, `purchase{Debit,Commit,Mutation,Validation}.js` — purchase flow
- `entitlement.js`, `paidActionEntitlement.js` — entitlements
- `productCredit*.js` — product credit reserve/consume/commit/release
- `sku.js`, `receipt.js`, `resourceQuotePolicy.js` — SKUs, receipts, quotes
- `app-services.js`, `app-creator-services.js`, `app-system-services.js`,
  `app-utility-services.js`, `flagship-*` — app/flagship commerce services

Subdirectories:
- `builderTemplates/` — builder template catalog/markup/script/style
- `platform/` — product app/game routes, directory, discovery, manifests

Includes `foundingServiceCatalog.test.js` (catalog test).
