// B"H
function create(plan=[], payload={}) {
  const id = `tx_${Date.now().toString(36)}`;
  return { id, createdAt:new Date().toISOString(), dryRun: payload.dryRun !== false, steps: plan.map(step), gates: gates(), rollback: rollback(plan) };
}
function step(x) { return { index:x.index, path:x.item.path, kind:x.item.kind, action:x.action, before:'capture file hash before write', verify:'run declared verification after write', commit:'only after verification passes' }; }
function gates() { return ['read reality before write','write complete files only','verify command succeeds','git diff reviewed','history receipt recorded']; }
function rollback(plan=[]) { return plan.filter(x=>/write|split|debt/.test(x.item.kind)).map(x=>({ path:x.item.path, method:'restore from captured before snapshot' })); }
module.exports = { create, step, gates, rollback };
