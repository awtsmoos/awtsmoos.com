// B"H
function check(m = {}, input = {}) {
  const hist = (m.selfImproveReceipts || []).slice(-6);
  const stages = hist.map(x => x.stage).filter(Boolean);
  const roles = hist.map(x => x.role).filter(Boolean);
  const boring = repeated(stages, 4) || repeated(roles, 4) || (input.noveltyScore || 0) <= 1;
  const out = { boring, reasons: [] };
  if (repeated(stages, 4)) out.reasons.push('same_stage_too_often');
  if (repeated(roles, 4)) out.reasons.push('same_role_too_often');
  if ((input.noveltyScore || 0) <= 1) out.reasons.push('low_novelty');
  return out;
}
function repeated(list, n) { return list.length >= n && new Set(list.slice(-n)).size === 1; }
module.exports = { check };
