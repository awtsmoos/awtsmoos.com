# B"H — Wallet Tests (geelooy/api/wallet/tests/)

Node test suite for the wallet family (`*.test.js`), covering currency,
balances, PayPal, game rewards, commerce engine + routes, paid-action
execution, idempotency, monetization, and product-credit reconciliation.

- `commerceRouteFixture.js`, `productCreditReconciliationFixtures.js` — shared fixtures
- `business/` — economics-level tests (marketplace, org treasury, resource quotes)

Run with Node's built-in test runner against the local checkout.
