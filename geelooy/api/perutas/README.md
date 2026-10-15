# B"H — Perutas API (geelooy/api/perutas/)

The peruta economy: Awtsmoos's base-unit value/accounting layer. Every amount
is reckoned in perutas and spoken in Talmudic coins
(`talmudicCoins.js`: peruta → issar → pundyon → me'ah → dinar/zuz → shekel →
maneh → kikar).

Root services: `accountService.js`, `ledgerService.js`, `economyMath.js`,
`flowService.js`, `purchaseService.js`, `receiptService.js`, `refundService.js`,
`usageService.js`, `tierService.js`, `subscriptionService.js`,
`marketplaceService.js`, `organizationService.js`, `providerService.js` +
`providerSandbox.js`, `adminService.js`, `adminVaultService.js`,
`identityService.js`, `fraudSignalService.js`, `deviceGraphService.js`,
`resourceAccountingService.js`, `resourceWorldService.js`,
`agentEconomyService.js`.

`index.js` aggregates every service for import. Subdirectories:
- `advisor/`, `agents/`, `analytics/`, `budgets/`, `forecasting/`,
  `marketplace/`, `providers/`, `reputation/`

See `DOCUMENTATION.md` (points to `docs/API/OTHER_FAMILIES.md`,
`docs/API/WALLET.md`, `docs/APPS/COMMERCE_AND_WALLET.md`). Distinct from the
wallet family: this is the peruta-denominated accounting/economy layer, not
the PayPal/commerce checkout path.
