// B"H
function migrateStore(store = {}) {
  store.apiKeys = store.apiKeys || {};
  store.usage = store.usage || [];
  store.perutaLedger = store.perutaLedger || [];
  store.perutaAccounts = store.perutaAccounts || {};
  store.perutaReceipts = store.perutaReceipts || [];
  store.perutaProviderEvents = store.perutaProviderEvents || [];
  store.perutaRefunds = store.perutaRefunds || [];
  store.treasurySchemaVersion = Math.max(2, Number(store.treasurySchemaVersion || 0));
  return store;
}
module.exports = { migrateStore };
