// B"H
const G = require('./graph.js');
function review(m) {
  const os = G.ensure(m), issues = [];
  for (const n of G.nodes(m)) {
    if (n.status === 'complete' && !n.receipts.length) issues.push(`${n.id}:complete_without_receipt`);
    if (n.status === 'blocked' && !n.blockedReason) issues.push(`${n.id}:blocked_without_reason`);
    if (n.type === 'file_rewrite') {
      if (!n.files.length) issues.push(`${n.id}:write_without_file`);
      if (!/complete/i.test(n.purpose + n.verificationMethod)) issues.push(`${n.id}:rewrite_not_declared_complete`);
      if (!/read.?back/i.test(n.verificationMethod)) issues.push(`${n.id}:missing_readback_requirement`);
    }
  }
  if (!os.planning.successCriteria.length) issues.push('missing_success_criteria');
  return { ok: issues.length === 0, issues, laws: [
    'never claim completed work without evidence', 'never repeat unchanged work indefinitely',
    'every write requires verification', 'every command produces a receipt',
    'release requires objective criteria', 'remaining work is maintained',
    'completed nodes record proof', 'blocked nodes record why blocked',
    'decisions explain from graph, evidence, or safety'
  ] };
}
module.exports = { review };
