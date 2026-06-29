// B"H
const crypto = require('crypto');
const G = require('./graph.js');
function digest(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,16); }
function snapshot(m) {
  const os = G.ensure(m), ns = G.nodes(m);
  return {
    workQueue: G.ready(m).map(n => n.id), evidenceDebt: ns.filter(n => n.status === 'complete' && !n.receipts.length).map(n => n.id),
    filesTouched: [...new Set(ns.flatMap(n => n.files || []))], testsRun: os.execution.verificationResults.map(r => r.summary),
    releaseBlockers: os.planning.releaseBlockers, graphStatuses: ns.map(n => [n.id, n.status]),
    lastRealFileChange: os.execution.writeReceipts.at(-1)?.summary || '', lastVerification: os.execution.verificationResults.at(-1)?.summary || ''
  };
}
function detect(m, input = {}) {
  const os = G.ensure(m), snap = snapshot(m), hash = digest(snap);
  os.cycles ||= [];
  os.cycles.push({ at: new Date().toISOString(), hash, snapshot: snap });
  const recent = os.cycles.slice(-Number(input.window || 4));
  const stuck = recent.length >= 4 && recent.every(c => c.hash === hash);
  const diagnostic = stuck ? 'mission_os_cycle_stuck_no_material_change' : 'mission_os_material_change_seen';
  if (stuck && !G.ready(m).length) G.add(m, { type:'verification', title:'Break cycle with reality-changing inspection', purpose:'Inspect a new file, run a command, or record a blocker.', status:'ready', verificationMethod:'receipt from file read, command, or blocker' });
  return { hash, stuck, diagnostic, recent: recent.map(c => c.hash), next: stuck ? 'create_concrete_reality_changing_node_or_block' : 'continue' };
}
module.exports = { snapshot, detect };
