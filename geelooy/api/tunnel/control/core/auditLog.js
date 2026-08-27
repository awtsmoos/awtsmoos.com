// B"H
function audit(store, entry = {}) {
  store.treasuryAuditLog = store.treasuryAuditLog || [];
  const row = { at: new Date().toISOString(), ...entry };
  store.treasuryAuditLog.push(row);
  while (store.treasuryAuditLog.length > 20000) store.treasuryAuditLog.shift();
  return row;
}
function auditRecent(store, limit = 100) {
  return (store.treasuryAuditLog || []).slice(-limit).reverse();
}
module.exports = { audit, auditRecent };
