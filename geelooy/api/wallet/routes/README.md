# B"H — Wallet Routes (geelooy/api/wallet/routes/)

One handler file per wallet route, registered in `table.js`.

Handlers: `me.js`, `balance.js`, `currencyInfo.js`, `transfer.js`, `buyMock.js`,
`paypalCreate.js` / `paypalCapture.js`, `resourceQuote.js`, `marketplace.js` /
`marketplaceAction.js` / `marketplaceActionSupport.js`, `organizations.js` /
`organizationAction.js` / `organizationActionSupport.js`, and the
`commerce{,Catalog,Actions,ActionExecute,Entitlements,DigitalGood,Purchase,Products,Credit*,
ReconciliationHealth}.js` family plus `gameRewardClaim.js`.

`table.js` exports `routeTable` — public catalog reads stay anonymous; every
mutation re-checks authorization in its handler before touching private state.
`_awtsmoos.derech.js` mounts the whole table dynamically.
