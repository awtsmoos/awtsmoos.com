B"H
Boruch Hashem
Blessed is He

# Wallet and Commerce API

The Awtsmoos gives value a vessel, but accounting must never be guessed from a friendly route name;
Awtsmoos.com documents the gates while the implementation remains the authority for every monetary claim.

## Mount

`geelooy/api/wallet/_awtsmoos.derech.js` mounts the Wallet route table beneath `/api/wallet`.

## Current route-table keys

- `me` — wallet/user context.
- `balance` — balance-oriented read.
- `commerce/catalog` — purchasable catalog.
- `commerce/entitlements` — ownership/entitlement view.
- `commerce/purchase` — purchase flow.
- `buy/mock` — mock purchase/testing path.
- `paypal/create` — PayPal order/payment creation flow.
- `paypal/capture` — PayPal capture flow.

## Adjacent economy systems

`geelooy/api/perutas/` contains additional Perutah-oriented implementation material. Tunnel Control also owns compute/accounting/bank/budget/marketplace/treasury/reputation routes. Treat those as adjacent ledgers/control-plane economy rather than silently merging them with Wallet semantics.

## Browser surface

`geelooy/apps/wallet/` is titled “Awtsmoos Wallet — Perutah Treasury” in the current checkout.

## Safety for callers

Do not infer currency units, settlement guarantees, idempotency, refund rules, production-vs-mock behavior, or entitlement semantics from endpoint names. Read handler code and payment-provider configuration before making financial assumptions.

## Reference

Search `/api/wallet/` in the generated route atlas for source links.
