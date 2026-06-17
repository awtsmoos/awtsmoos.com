// B"H
const assert = require("assert");
const economy = require("../geelooy/api/perutas/index.js");

/**
 * B"H
 * Chapter 496: The checkout rehearsal walked through fire without a card.
 * Packs and subscriptions must credit split balances and leave ledger ink.
 */
const store = {};
const userId = "peruta-smoke-user";
const pack = economy.purchase.simulate(store, userId, { type: "pack", pack: "river" });
assert.equal(pack.ok, true);
assert.equal(pack.account.balances.routing, 9000000);
assert.equal(pack.account.balances.compute, 25000);
const sub = economy.purchase.simulate(store, userId, { type: "subscription", tier: "gimel" });
assert.equal(sub.ok, true);
assert.equal(sub.account.tier, "gimel");
assert.equal(sub.account.balances.routing, 29000000);
assert.equal(sub.account.balances.compute, 125000);
assert.equal((store.perutaLedger || []).filter(x => x.kind === "sandbox_purchase").length, 2);
console.log(JSON.stringify({ ok: true, tier: sub.account.tier, balances: sub.account.balances, ledger: store.perutaLedger.length }, null, 2));
