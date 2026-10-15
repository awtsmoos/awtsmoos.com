# B"H — Wallet API (geelooy/api/wallet/)

The Awtsmoos wallet/treasury family: balances, PayPal, commerce, marketplace,
organizations, transfers, and game rewards. Value moves through guarded doorways —
public catalog reads are anonymous, every mutation does its own authorization.

Subdirectories:
- `core/` — treasury logic (ledger, balances, transfers, PayPal, persistence)
- `routes/` — HTTP route handlers + `table.js` route registry
- `tests/` — unit/route tests (`*.test.js`) + `tests/business/`

Key files: `_awtsmoos.derech.js` (dynamic route dispatch), `DOCUMENTATION.md`
(points to `docs/API/WALLET.md`, `docs/APPS/COMMERCE_AND_WALLET.md`).

Main routes (from `routes/table.js`): `me`, `balance`, `currency`, `transfer`,
`buy/mock`, `paypal/create`, `paypal/capture`, `resource/quote`, `marketplace`,
`marketplace/action`, `organizations`, `organizations/action`,
`commerce/catalog`, `commerce/actions`, `commerce/actions/execute`,
`commerce/entitlements`, `commerce/digital-good`, `commerce/purchase`,
`commerce/products`, `commerce/credits/reserve|consume|commit|release`,
`commerce/reconciliation/health`, `game-rewards/claim`.
