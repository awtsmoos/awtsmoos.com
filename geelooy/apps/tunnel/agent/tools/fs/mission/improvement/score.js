// B"H
function scoreFile(f={}) {
  let score = 0;
  if (f.todo) score += 35;
  if (f.lines > 120) score += Math.min(40, Math.ceil((f.lines - 120) / 30));
  if (f.bytes > 25000) score += 10;
  if (/test|spec/i.test(f.path)) score -= 5;
  if (/mission|tunnel|agent/.test(f.path)) score += 8;
  const kind = f.todo ? 'technical-debt' : f.lines > 120 ? 'split-large-file' : f.syntaxTarget ? 'verify-syntax' : 'inspect';
  return { ...f, score, kind, reason: reason(f, score) };
}
function reason(f, score) {
  const r=[]; if (f.todo) r.push('TODO/FIXME marker'); if (f.lines>120) r.push('large file');
  if (f.syntaxTarget) r.push('syntax-checkable'); if (!r.length) r.push('low-risk inspection');
  return `${score} points: ${r.join(', ')}`;
}
function rank(report={}, limit=20) { return (report.files||[]).map(scoreFile).sort((a,b)=>b.score-a.score).slice(0, limit); }
module.exports = { scoreFile, rank, reason };
