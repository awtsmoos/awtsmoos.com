// B"H
function mustAuth(ident) { return ident && ident.ok ? null : { ok: false, error: "not_authenticated", status: 401 }; }
function mustMaster(economy, ident) {
  const auth = mustAuth(ident);
  if (auth) return auth;
  return economy.isMasterUser(ident.userId) ? null : { ok: false, error: "not_master", status: 403 };
}
function amounts(q = {}) {
  return { routing: Number(q.routing || q.amount || 0), compute: Number(q.compute || 0), storage: Number(q.storage || 0), gpu: Number(q.gpu || 0) };
}
module.exports = { amounts, mustAuth, mustMaster };
