# B"H — Wallet Currency (geelooy/api/wallet/core/currency/)

Currency math for the wallet: denominations, conversion, and decomposition of
amounts across currencies.

Files:
- `denominations.js` — currency denominations
- `conversion.js` — cross-currency conversion
- `decompose.js` — breaking amounts into denomination units
- `sources.js` — rate/source providers

Exposed via the `currency` route (`routes/currencyInfo.js`); tested by
`tests/currency.test.js` and `tests/currencyRoute.test.js`.
