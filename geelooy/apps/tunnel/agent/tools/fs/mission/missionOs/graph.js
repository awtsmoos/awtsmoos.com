// B"H
const P = require('./phases.js');
function list(v) { return Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []; }
function id(prefix = 'node') { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
function ensure(m, input = {}) {
  m.operatingSystem ||= { version: 1, planning: {}, execution: {}, release: {}, cycles: [] };
  const os = m.operatingSystem;
  os.planning ||= {};
  os.execution ||= {};
  os.planning.goal ||= m.goal;
  os.planning.expandedGoal ||= input.expandedGoal || m.goal;
  os.planning.graph ||= { nodes: {}, order: [] };
  os.planning.dependencies ||= [];
  os.planning.risks ||= list(input.risks);
  os.planning.successCriteria ||= list(input.successCriteria || m.definitionOfDone);
  os.planning.releaseBlockers ||= [];
  os.execution.receipts ||= [];
  os.execution.completedNodeIds ||= [];
  os.execution.blockedNodeIds ||= [];
  os.execution.commandOutput ||= [];
  os.execution.fileReadEvidence ||= [];
  os.execution.writeReceipts ||= [];
  os.execution.verificationResults ||= [];
  return os;
}
function add(m, input = {}) {
  const os = ensure(m, input), graph = os.planning.graph, nodeId = input.id || id('work');
  const node = {
    id: nodeId, type: P.type(input.type), title: input.title || input.purpose || nodeId,
    purpose: input.purpose || input.title || '', dependencies: list(input.dependencies),
    status: P.status(input.status || 'discovered'), files: list(input.files || input.file),
    commands: list(input.commands || input.command), verificationMethod: input.verificationMethod || '',
    expectedEvidence: list(input.expectedEvidence), rollbackStrategy: input.rollbackStrategy || '',
    successCriteria: list(input.successCriteria), downstreamNodes: list(input.downstreamNodes),
    createdAt: input.createdAt || P.now(), updatedAt: P.now(), receipts: []
  };
  graph.nodes[nodeId] = node;
  if (!graph.order.includes(nodeId)) graph.order.push(nodeId);
  return node;
}
function update(m, nodeId, patch = {}) {
  const node = ensure(m).planning.graph.nodes[nodeId];
  if (!node) return null;
  Object.assign(node, patch, { updatedAt: P.now() });
  if (patch.status) node.status = P.status(patch.status);
  return node;
}
function nodes(m) { const g = ensure(m).planning.graph; return g.order.map(id => g.nodes[id]).filter(Boolean); }
function depsDone(os, n) { return list(n.dependencies).every(id => os.execution.completedNodeIds.includes(id)); }
function ready(m) { const os = ensure(m); return nodes(m).filter(n => ['planned','ready'].includes(n.status) && depsDone(os, n)); }
function receipt(m, input = {}) {
  const os = ensure(m), r = { id: input.id || id('receipt'), nodeId: input.nodeId || '', kind: input.kind || 'evidence', ok: input.ok !== false, summary: input.summary || input.claim || '', proof: input.proof || input.output || null, at: P.now() };
  os.execution.receipts.push(r);
  const n = r.nodeId && os.planning.graph.nodes[r.nodeId];
  if (n) n.receipts.push(r.id);
  if (r.kind === 'command') os.execution.commandOutput.push(r);
  if (r.kind === 'file_read') os.execution.fileReadEvidence.push(r);
  if (r.kind === 'write') os.execution.writeReceipts.push(r);
  if (r.kind === 'verification') os.execution.verificationResults.push(r);
  return r;
}
module.exports = { ensure, add, update, nodes, ready, receipt };
