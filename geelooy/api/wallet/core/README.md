# B"H — Wallet Core (geelooy/api/wallet/core/)

Treasury business logic the routes call. Root-level helpers: balance buckets and
state, ledger, transfers (identity/validation/operations), spend/credit
operations, PayPal transport/receipt/return-path, persistence + file locking,
transaction runner, request/response utilities, environment + storage paths.

Subdirectories:
- `commerce/` — catalogs, paid actions, entitlements, purchase engine, credits
- `currency/` — conversion, denominations, decompose, sources
- `gameRewards/` — reward catalog, claim, daily policy, results
- `marketplace/` — marketplace create/purchase/policy/service/state
- `organizations/` — org create/fund/consume, members, budgets, policy, events

The route files in `../routes/` are thin; the real money logic lives here.
