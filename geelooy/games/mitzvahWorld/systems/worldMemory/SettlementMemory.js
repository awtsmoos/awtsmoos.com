// B"H
/** @file SettlementMemory.js @description Settlement-scale memory for growth, needs, repairs, and trade. */
export function createSettlementMemory(store, events) {
  function remember(settlementId, kind, data = {}) {
    events?.record?.(`settlement-${kind}`, { settlementId, ...data });
    return store.remember(`settlement-${kind}`, settlementId, { ...data, target:settlementId });
  }
  function needs(settlementId) { return store.database.query({ target:settlementId }).filter(f => /need|shortage|damage/.test(f.kind)); }
  function growth(settlementId) { return store.score('settlement-growth', settlementId, 'value'); }
  return { remember, needs, growth };
}
export default createSettlementMemory;
