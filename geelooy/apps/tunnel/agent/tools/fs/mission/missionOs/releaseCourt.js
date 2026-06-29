// B"H
const G = require('./graph.js');
const C = require('./constitution.js');
function court(m) {
  const os = G.ensure(m), nodes = G.nodes(m), issues = [], con = C.review(m);
  const readyIds = G.ready(m).map(n => n.id);
  const active = nodes.filter(n => ['executing','verifying'].includes(n.status));
  if (readyIds.length || active.length) issues.push('required_nodes_remaining');
  if (!nodes.some(n => n.type === 'file_read' && n.receipts.length)) issues.push('required_files_not_inspected');
  for (const n of nodes.filter(n => n.type === 'file_rewrite')) {
    if (!n.receipts.length) issues.push(`${n.id}:write_missing_receipt`);
    if (!os.execution.verificationResults.some(r => r.nodeId === n.id || r.summary.includes(n.id))) issues.push(`${n.id}:write_missing_verification`);
  }
  if (nodes.some(n => n.status === 'failed')) issues.push('failed_nodes_present');
  if (!con.ok) issues.push(...con.issues);
  const evidenceDebt = nodes.filter(n => n.status === 'complete' && !n.receipts.length).length;
  if (evidenceDebt > Number(os.release.evidenceDebtThreshold || 0)) issues.push('evidence_debt_above_threshold');
  const critical = os.planning.releaseBlockers || [];
  const verdict = critical.length ? 'blocked' : issues.length ? 'continue' : 'release';
  os.release = { verdict, issues:[...critical, ...issues], evidenceDebt, decidedAt: new Date().toISOString() };
  return { verdict, evidenceSummary: os.execution.receipts.slice(-10), remainingBlockers: os.release.issues, confidenceScore: confidence(verdict, issues, nodes), nextAction: verdict === 'release' ? null : next(issues), evidenceDebt };
}
function confidence(verdict, issues, nodes) { if (verdict === 'release') return 0.95; return Math.max(0.1, 0.7 - issues.length * 0.08 - nodes.filter(n => n.status === 'failed').length * 0.2); }
function next(issues) { return { action:'missionOsNext', reason: issues[0] || 'continue_required' }; }
module.exports = { court };
