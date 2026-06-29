// B"H
const G = require('./graph.js');
function facts(m) {
  const os = G.ensure(m), nodes = G.nodes(m), ready = G.ready(m);
  const active = nodes.find(n => n.id === os.execution.activeNode) || nodes.find(n => ['executing','verifying'].includes(n.status)) || ready[0] || null;
  const completeNoReceipts = nodes.filter(n => n.status === 'complete' && !n.receipts.length);
  const blocked = nodes.filter(n => n.status === 'blocked');
  const writes = nodes.filter(n => n.type === 'file_rewrite');
  const unverifiedWrites = writes.filter(n => !os.execution.verificationResults.some(r => r.nodeId === n.id || r.summary.includes(n.id)));
  const mode = active ? modeFor(active) : blocked.length ? 'unblock' : ready.length ? 'execute' : releaseMode(os);
  return { os, nodes, ready, active, blocked, mode, debt: {
    receipts: completeNoReceipts.length,
    fileReads: nodes.some(n => n.type === 'file_read' && n.receipts.length) ? 0 : 1,
    writeVerification: unverifiedWrites.length,
    releaseBlockers: (os.planning.releaseBlockers || []).length,
    activeNeedsReceipt: active && !active.receipts.length ? 1 : 0
  }, scoreboard: score(os, nodes, ready, blocked) };
}
function modeFor(n) { if (n.status === 'verifying') return 'verify'; if (n.status === 'blocked') return 'unblock'; if (n.type === 'release_decision') return 'release'; return 'execute'; }
function releaseMode(os) { return os.release?.verdict === 'release' ? 'release' : 'plan'; }
function score(os, nodes, ready, blocked) { return {
  totalNodes:nodes.length, ready:ready.length, executing:nodes.filter(n => n.status === 'executing').length,
  verifying:nodes.filter(n => n.status === 'verifying').length, complete:nodes.filter(n => n.status === 'complete').length,
  blocked:blocked.length, receipts:(os.execution.receipts || []).length, fileReads:(os.execution.fileReadEvidence || []).length,
  writes:(os.execution.writeReceipts || []).length, verifications:(os.execution.verificationResults || []).length,
  commands:(os.execution.commandOutput || []).length
}; }
module.exports = { facts };
