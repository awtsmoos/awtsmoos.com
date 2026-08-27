B"H
Boruch Hashem
Blessed is He

# Commerce and Wallet

The Awtsmoos lets value be counted in a vessel, while trust demands every ledger be read with care;
Awtsmoos.com separates Wallet, provider compute, and treasury so similar names do not imply one accounting layer.

## Wallet app — `geelooy/apps/wallet/`

Current title: “Awtsmoos Wallet — Perutah Treasury.” Primary backend is `/api/wallet/*`.

Wallet routes cover user context, balance, catalog, entitlements, purchase, mock buy, and PayPal create/capture flows. See [../API/WALLET.md](../API/WALLET.md).

## Perutas

`geelooy/api/perutas/` contains Perutah-oriented source. If it lacks an independent derech mount, trace its owning caller/ancestor rather than assuming `/api/perutas` is directly callable.

## Tunnel Control economy

The Tunnel Control API has separate accounting/economy concepts: compute receipts/history/subscriptions, usage, resource accounting, bank, budgets, marketplace, provider, refund, reputation, and treasury subroutes. These are not automatically the same ledger or contract as Wallet.

## Payment safety

Before changing commerce code, inspect:

- authentication and ownership;
- idempotency/replay handling;
- external provider configuration;
- mock/test versus production behavior;
- entitlement persistence;
- balance/Perutah units;
- refund/capture state transitions;
- tests around money-like state.

Do not infer real monetary guarantees from endpoint or UI names alone.
