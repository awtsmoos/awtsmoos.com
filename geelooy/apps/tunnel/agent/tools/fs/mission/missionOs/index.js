// B"H
const G = require('./graph.js');
const C = require('./constitution.js');
const Cy = require('./cycles.js');
const R = require('./releaseCourt.js');
const P = require('./phases.js');
const Prompt = require('./promptRenderer.js');
const Cont = require('./continuation.js');
function seed(m, input = {}) { const os = G.ensure(m, input); if (!G.nodes(m).length) { G.add(m, { id:'discover_files', type:'file_read', title:'Inspect required files', status:'ready', verificationMethod:'file read receipt', expectedEvidence:['file contents observed'] }); G.add(m, { id:'plan_graph', type:'review', title:'Build work graph', dependencies:['discover_files'], status:'planned', verificationMethod:'graph contains real nodes' }); G.add(m, { id:'verify_release', type:'release_decision', title:'Release court', dependencies:['plan_graph'], status:'planned', verificationMethod:'release court verdict' }); } os.phase = P.phase(input.phase || os.phase || 'discover'); os.keepGoing = input.keepGoing !== false; return status(m); }
function status(m) { const os = G.ensure(m), nodes = G.nodes(m); return { phase:os.phase || 'discover', keepGoing:os.keepGoing !== false, planning:os.planning, execution:os.execution, counts:counts(nodes), ready:G.ready(m), constitution:C.review(m), release:os.release || {}, prompt:Prompt.render(m) }; }
function counts(nodes) { return nodes.reduce((a,n)=>{ a.total++; a[n.status]=(a[n.status]||0)+1; return a; }, { total:0 }); }
function addNode(m, input) { return G.add(m, input); }
function updateNode(m, input) { const n = G.update(m, input.nodeId || input.id, input); trackDone(m, n); return n; }
function trackDone(m, n) { if (!n) return; const os = G.ensure(m); if (n.status === 'complete' && !os.execution.completedNodeIds.includes(n.id)) os.execution.completedNodeIds.push(n.id); if (n.status === 'blocked' && !os.execution.blockedNodeIds.includes(n.id)) os.execution.blockedNodeIds.push(n.id); }
function recordReceipt(m, input) { const r = G.receipt(m, input); const patch = input.complete === false ? {} : { status:'complete' }; const n = input.nodeId ? G.update(m, input.nodeId, patch) : null; trackDone(m, n); return r; }
function next(m) { const ready = G.ready(m)[0]; if (ready) { G.update(m, ready.id, { status:'executing' }); G.ensure(m).execution.activeNode = ready.id; return ready; } return null; }
module.exports = { seed, status, addNode, updateNode, recordReceipt, next, releaseCourt:R.court, cycleCheck:Cy.detect, constitution:C.review, prompt:Prompt.render, keepGoing:Cont.keepGoing, steer:Cont.steer };
