# B"H — Wallet Marketplace (geelooy/api/wallet/core/marketplace/)

Marketplace treasury logic behind the `marketplace` and `marketplace/action` routes.

Files:
- `marketplaceCreate.js`, `marketplacePurchase.js` — listing creation and purchases
- `marketplacePolicy.js` — marketplace rules/fees
- `marketplaceService.js` — service orchestration
- `marketplaceState.js` — marketplace state

Route helpers `routes/marketplaceActionSupport.js`; business tests in
`tests/business/marketplaceEconomics.test.js`.
