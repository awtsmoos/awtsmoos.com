// B"H
const crypto = require("crypto");

/** B"H: Every peruta movement leaves a footprint in the server ledger. */
function pushLedger(store, entry = {}) {
  store.perutaLedger = store.perutaLedger || [];
  const got = { id: entry.id || `pl_${crypto.randomBytes(8).toString("hex")}`, at: entry.at || Date.now(), ...entry };
  store.perutaLedger.push(got);
  while (store.perutaLedger.length > 20000) store.perutaLedger.shift();
  return got;
}
function ledgerFor(store, userId, limit = 50) { return (store.perutaLedger || []).filter(x => x.userId === userId).slice(-limit).reverse(); }
function usageEvent(store, entry = {}) {
  store.usageEvents = store.usageEvents || [];
  const got = { at: Date.now(), ...entry };
  store.usageEvents.push(got);
  while (store.usageEvents.length > 50000) store.usageEvents.shift();
  return got;
}
function usageFor(store, userId, limit = 100) { return (store.usageEvents || []).filter(x => x.userId === userId).slice(-limit).reverse(); }
module.exports = { ledgerFor, pushLedger, usageEvent, usageFor };
