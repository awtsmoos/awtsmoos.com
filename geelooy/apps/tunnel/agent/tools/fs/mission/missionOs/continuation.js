// B"H
const G = require('./graph.js');
function keepGoing(m, input = {}) {
  const os = G.ensure(m), ready = G.ready(m), active = os.execution.activeNode && os.planning.graph.nodes[os.execution.activeNode];
  if (active && !['complete','blocked','failed','superseded'].includes(active.status)) return { decision:'continue_active', next:{ action:'missionOsReceipt', missionId:m.id, nodeId:active.id, kind:active.type, summary:'PROOF FROM REAL WORK' }, activeNode:active };
  if (ready.length) return { decision:'start_ready', next:{ action:'missionOsNext', missionId:m.id }, activeNode:ready[0] };
  const node = G.add(m, { type:input.type || 'verification', title:input.title || 'Keep going with reality-changing work', purpose:input.purpose || input.reason || 'The mission must not end without a proven release. Inspect, verify, write, run, browse, or record a blocker.', status:'ready', files:input.files || [], commands:input.commands || [], verificationMethod:input.verificationMethod || 'receipt from real work', expectedEvidence:['new receipt proving changed reality'] });
  return { decision:'created_keep_going_node', next:{ action:'missionOsNext', missionId:m.id }, activeNode:node };
}
function steer(m, input = {}) {
  const node = G.add(m, { type:input.type || 'review', title:input.title || 'Steered work node', purpose:input.purpose || input.direction || 'Agent steered mission direction while preserving continuation.', status:'ready', files:input.files || [], commands:input.commands || [], verificationMethod:input.verificationMethod || 'receipt proving steered work happened', expectedEvidence:['steering receipt'] });
  return { decision:'steered_without_ending', node, next:{ action:'missionOsNext', missionId:m.id } };
}
module.exports = { keepGoing, steer };
