// B"H
function actionFor(item={}) {
  if (item.kind === 'verify-syntax') return { action:'commandRun', command:`node --check ${item.path}`, cwd:'.' };
  if (item.kind === 'split-large-file') return { action:'readManyLines', ranges:[{ path:item.path, startLine:1, endLine:160 }] };
  if (item.kind === 'technical-debt') return { action:'readManyLines', ranges:(item.markers || []).slice(0, 4).map(m => ({ path:item.path, startLine:Math.max(1, m.lineNumber - 3), endLine:m.lineNumber + 3 })) };
  return { action:'read', path:item.path };
}
function simulate(ranked=[], payload={}) {
  const selected = ranked.slice(0, Number(payload.maxItems || 8));
  return selected.map((item, index) => ({ index, item, predictedRisk: risk(item), predictedValue: item.score, action: actionFor(item), rollbackCost: item.kind === 'split-large-file' ? 'medium' : 'low' }));
}
function risk(item={}) { if (item.kind === 'split-large-file') return 'medium'; if (item.kind === 'technical-debt') return 'low'; return 'low'; }
module.exports = { simulate, actionFor, risk };
